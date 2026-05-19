import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

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
    return (req: Request, res: Response, next: NextFunction) => {
        // This would check user role from database
        // For now, just pass through
        next()
    }
}
