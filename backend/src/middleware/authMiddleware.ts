import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import type { Request, Response, NextFunction } from 'express'

interface JwtPayload {
  id: number
}

export interface AuthUser {
  id: number
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({ message: "not authenticated" })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET not defined")
    }

    const decoded = jwt.verify(token, secret) as JwtPayload
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user  
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}