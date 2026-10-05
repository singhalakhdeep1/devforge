import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface JwtPayload {
    userId: string
}

declare global {
    namespace Express {
        interface Request {
            user: {
                id: string
            }
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

        // Attach user to request
        req.user = { id: decoded.userId }

        next()
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' })
    }
}

export const authorize = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' })
            }
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { role: true },
            })
            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden: insufficient permissions' })
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}
