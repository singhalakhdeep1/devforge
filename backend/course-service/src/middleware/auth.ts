import { NextFunction, Request, Response } from 'express'
import { Role } from '@prisma/client'
import { forbidden, unauthorized } from '../lib/errors'
import { prisma } from '../lib/prisma'
import { verifyAccessToken } from '../lib/tokens'

declare global {
    namespace Express {
        interface Request {
            user: { id: string; role: Role; name: string; email: string }
        }
    }
}

const bearer = (req: Request): string | undefined => {
    const header = req.headers.authorization
    return header?.startsWith('Bearer ') ? header.slice(7) : undefined
}

async function loadUser(token: string) {
    const { userId } = verifyAccessToken(token)
    // Loaded fresh so deleted users and role changes take effect immediately
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, name: true, email: true } })
}

/** Requires a valid access token. */
export const protect = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = bearer(req)
        if (!token) return next(unauthorized('Not authorized, no token'))
        const user = await loadUser(token)
        if (!user) return next(unauthorized('Account no longer exists'))
        req.user = user
        next()
    } catch {
        next(unauthorized('Not authorized, token failed'))
    }
}

/** Attaches req.user when a valid token is present, but never rejects. */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = bearer(req)
        if (token) {
            const user = await loadUser(token)
            if (user) req.user = user
        }
    } catch {
        // Invalid or expired token: treat the request as anonymous
    }
    next()
}

/** Must run after `protect`. */
export const authorize =
    (...roles: Role[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(unauthorized())
        if (!roles.includes(req.user.role)) return next(forbidden('Forbidden: insufficient permissions'))
        next()
    }
