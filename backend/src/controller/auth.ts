import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../config/prisma.js'
import type { Request, Response } from 'express'

export const Register = async (req: Request, res: Response): Promise<any> => {
    const { username, password, email } = req.body

    try {
        if (!username || !password || !email) {
            return res.status(400).json({ message: "parameter missing" })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(409).json({ message: "user with this email already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name: username,
                email,
                password: hashedPassword
            }
        })

        const token = createToken(user.id)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(201).json({ message: "registered successfully" })

    } catch (error) {
        return res.status(500).json({ message: "internal server error" })
    }
}

export const Login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "parameters missing" })
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(400).json({ message: "user does not exist" })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return res.status(401).json({ message: "invalid credentials" })
        }

        const token = createToken(user.id)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ message: "login successful" })

    } catch (error) {
        return res.status(500).json({ message: "internal server error" })
    }
}

const createToken = (id: number): string => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error("JWT_SECRET not defined")
    }

    return jwt.sign({ id }, secret, { expiresIn: '1d' })
}
