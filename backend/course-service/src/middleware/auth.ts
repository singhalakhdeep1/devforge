import { NextFunction, Request, Response } from 'express'
import { attachUser } from '@devhub/shared'
import { Role } from '../generated/client'
import { forbidden, unauthorized } from '../lib/errors'
import { prisma } from '../lib/prisma'

declare global {
    namespace Express {
        interface Request {
            /** Set by protect / optionalAuth; read from the verified token, never from client input. */
            user: { id: string; role: Role; name: string; email: string }
        }
    }
}

const ROLES = new Set<string>(Object.values(Role))

// Skip the projection upsert when this exact identity was written moments ago
const recentlySynced = new Map<string, number>()
const SYNC_TTL_MS = 60_000

/**
 * Identity comes from the gateway (trusted x-user-* headers) or a verified bearer token.
 * The local user row is a projection used for joins, upserted so the very first request of a
 * new user does not race the user.registered event.
 */
async function identify(req: Request): Promise<boolean> {
    await new Promise<void>((resolve) => attachUser(req as any, undefined as any, () => resolve()))
    const u = (req as any).user as { id: string; role: string; email?: string; name?: string } | undefined
    if (!u) return false
    const role = (ROLES.has(u.role) ? u.role : 'STUDENT') as Role
    const name = u.name || u.email?.split('@')[0] || 'Learner'
    const email = u.email || `${u.id}@unknown.local`
    const key = `${u.id}|${role}|${name}`
    if ((recentlySynced.get(key) ?? 0) < Date.now()) {
        await prisma.user.upsert({
            where: { id: u.id },
            update: { role, ...(u.name ? { name } : {}) },
            create: { id: u.id, email, name, role },
        })
        if (recentlySynced.size > 5000) recentlySynced.clear()
        recentlySynced.set(key, Date.now() + SYNC_TTL_MS)
    }
    req.user = { id: u.id, role, name, email }
    return true
}

/** Requires an authenticated user. */
export const protect = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        if (!(await identify(req))) return next(unauthorized('Not authorized, no token'))
        next()
    } catch (e) {
        next(e)
    }
}

/** Attaches req.user when credentials are present, but never rejects. */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        await identify(req)
    } catch {
        // treated as anonymous
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
