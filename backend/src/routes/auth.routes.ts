import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { env, isProd } from '../config/env'
import { badRequest, conflict, handle, unauthorized } from '../lib/errors'
import { sendMail, resetEmail, verificationEmail } from '../lib/mailer'
import { prisma } from '../lib/prisma'
import {
    issueRefreshToken,
    revokeAllRefreshTokens,
    revokeRefreshToken,
    rotateRefreshToken,
    signAccessToken,
    signPurposeToken,
    verifyPurposeToken,
} from '../lib/tokens'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

// Brute-force protection on credential endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later' },
})

const COOKIE = 'refreshToken'
const crossSite = env.CROSS_SITE_COOKIES === 'true'
const cookieOptions = {
    httpOnly: true,
    secure: isProd || crossSite,
    sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax',
    path: '/api/auth',
    maxAge: env.REFRESH_TOKEN_DAYS * 86_400_000,
}

const publicUser = {
    id: true,
    email: true,
    name: true,
    avatar: true,
    role: true,
    bio: true,
    location: true,
    skills: true,
    githubUrl: true,
    linkedinUrl: true,
    portfolioUrl: true,
    isVerified: true,
    createdAt: true,
} as const

async function startSession(res: Response, userId: string) {
    const refresh = await issueRefreshToken(userId)
    res.cookie(COOKIE, refresh, cookieOptions)
    return signAccessToken(userId)
}

const password = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number')

const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.string().trim().toLowerCase().email('Please provide a valid email'),
    password,
    role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
})

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required'),
})

async function sendVerification(user: { id: string; name: string; email: string }) {
    const token = signPurposeToken('verify', user.id, '24h')
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token } })
    const mail = verificationEmail(user.name, `${env.FRONTEND_URL}/verify/${token}`)
    await sendMail({ to: user.email, ...mail })
}

// POST /api/auth/register
router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    handle(async (req, res) => {
        const { name, email, password: plain, role } = req.body as z.infer<typeof registerSchema>

        if (await prisma.user.findUnique({ where: { email } })) throw conflict('An account with this email already exists')

        const user = await prisma.user.create({
            data: { name, email, role, password: await bcrypt.hash(plain, 12) },
            select: publicUser,
        })

        // Fire and forget: SMTP problems must not block sign-up
        void sendVerification(user)

        const accessToken = await startSession(res, user.id)
        res.status(201).json({ user, accessToken })
    })
)

// POST /api/auth/login
router.post(
    '/login',
    authLimiter,
    validate(loginSchema),
    handle(async (req, res) => {
        const { email, password: plain } = req.body as z.infer<typeof loginSchema>
        const user = await prisma.user.findUnique({ where: { email } })

        // Same error for unknown email and wrong password
        if (!user || !(await bcrypt.compare(plain, user.password))) throw unauthorized('Invalid email or password')

        const accessToken = await startSession(res, user.id)
        const safe = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUser })
        res.json({ user: safe, accessToken })
    })
)

// POST /api/auth/refresh  (rotates the refresh cookie)
router.post(
    '/refresh',
    handle(async (req, res) => {
        const token = req.cookies?.[COOKIE]
        if (!token) throw unauthorized('No session')

        const rotated = await rotateRefreshToken(token)
        if (!rotated) {
            res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined })
            throw unauthorized('Session expired, please sign in again')
        }

        const user = await prisma.user.findUnique({ where: { id: rotated.userId }, select: publicUser })
        if (!user) throw unauthorized('Account no longer exists')

        res.cookie(COOKIE, rotated.newToken, cookieOptions)
        res.json({ user, accessToken: signAccessToken(user.id) })
    })
)

// POST /api/auth/logout
router.post(
    '/logout',
    handle(async (req, res) => {
        const token = req.cookies?.[COOKIE]
        if (token) await revokeRefreshToken(token)
        res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined })
        res.json({ message: 'Logged out' })
    })
)

// GET /api/auth/me
router.get(
    '/me',
    protect,
    handle(async (req, res) => {
        res.json(await prisma.user.findUniqueOrThrow({ where: { id: req.user.id }, select: publicUser }))
    })
)

// POST /api/auth/verify  { token }
router.post(
    '/verify',
    validate(z.object({ token: z.string().min(1) })),
    handle(async (req, res) => {
        let userId: string
        try {
            userId = verifyPurposeToken('verify', req.body.token).userId
        } catch {
            throw badRequest('Invalid or expired verification link')
        }
        const result = await prisma.user.updateMany({
            where: { id: userId, verificationToken: req.body.token },
            data: { isVerified: true, verificationToken: null },
        })
        // Already verified (link used twice) is not an error worth surfacing
        if (result.count === 0 && !(await prisma.user.findFirst({ where: { id: userId, isVerified: true } }))) {
            throw badRequest('Invalid or expired verification link')
        }
        res.json({ message: 'Email verified' })
    })
)

// POST /api/auth/resend-verification
router.post(
    '/resend-verification',
    authLimiter,
    protect,
    handle(async (req, res) => {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })
        if (user.isVerified) return res.json({ message: 'Email already verified' })
        await sendVerification(user)
        res.json({ message: 'Verification email sent' })
    })
)

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    authLimiter,
    validate(z.object({ email: z.string().trim().toLowerCase().email() })),
    handle(async (req, res) => {
        const user = await prisma.user.findUnique({ where: { email: req.body.email } })
        if (user) {
            const token = signPurposeToken('reset', user.id, '1h')
            await prisma.user.update({
                where: { id: user.id },
                data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3_600_000) },
            })
            await sendMail({ to: user.email, ...resetEmail(user.name, `${env.FRONTEND_URL}/reset-password/${token}`) })
        }
        // Identical response whether or not the account exists (prevents email enumeration)
        res.json({ message: 'If that email exists, a reset link has been sent' })
    })
)

// POST /api/auth/reset-password  { token, password }
router.post(
    '/reset-password',
    authLimiter,
    validate(z.object({ token: z.string().min(1), password })),
    handle(async (req, res) => {
        const { token, password: plain } = req.body as { token: string; password: string }
        let userId: string
        try {
            userId = verifyPurposeToken('reset', token).userId
        } catch {
            throw badRequest('Invalid or expired reset link')
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw badRequest('Invalid or expired reset link')
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { password: await bcrypt.hash(plain, 12), resetToken: null, resetTokenExpiry: null },
        })
        await revokeAllRefreshTokens(user.id) // sign out every device
        res.json({ message: 'Password reset. Please sign in with your new password.' })
    })
)

export default router
