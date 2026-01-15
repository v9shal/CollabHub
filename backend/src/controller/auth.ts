import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../config/prisma.js'
import type { Request , Response     } from 'express'

interface RegisterBody {
  username: string
  password: string
  email: string
}

interface LoginBody {
  email: string
  password: string
}

export const Register = async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<any> => {
  const { username, password, email } = req.body

  try {
    if (!username?.trim() || !password || !email?.trim()) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" })
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

    return res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Registration error:', error) 
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const Login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<any> => {
  const { email, password } = req.body

  try {
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }) 
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = createToken(user.id)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Login error:', error) 
    return res.status(500).json({ message: "Internal server error" })
  }
}

const createToken = (id: number): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET not defined")
  }

  return jwt.sign({ id }, secret, { expiresIn: '1d' })
}