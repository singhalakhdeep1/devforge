import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { z } from 'zod'
import { env } from '../config/env'
import { badRequest, conflict, handle, unauthorized } from '../lib/errors'
import { prisma } from '../lib/prisma'
import { revokeAllRefreshTokens } from '../lib/tokens'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()
router.use(protect)

const profileSelect = {
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

const optionalUrl = z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Must start with http:// or https://')
    .transform((v) => (v === '' ? null : v))

const profileSchema = z
    .object({
        name: z.string().trim().min(1).max(100),
        bio: z.string().trim().max(500).transform((v) => v || null),
        location: z.string().trim().max(100).transform((v) => v || null),
        skills: z.array(z.string().trim().min(1).max(40)).max(20),
        githubUrl: optionalUrl,
        linkedinUrl: optionalUrl,
        portfolioUrl: optionalUrl,
    })
    .partial()

router.get(
    '/profile',
    handle(async (req, res) => {
        res.json(await prisma.user.findUniqueOrThrow({ where: { id: req.user.id }, select: profileSelect }))
    })
)

router.put(
    '/profile',
    validate(profileSchema),
    handle(async (req, res) => {
        res.json(await prisma.user.update({ where: { id: req.user.id }, data: req.body, select: profileSelect }))
    })
)

// ----- Avatar upload -----
const avatarDir = path.resolve(env.UPLOAD_DIR, 'avatars')
fs.mkdirSync(avatarDir, { recursive: true })

const EXT: Record<string, string> = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' }

const upload = multer({
    storage: multer.diskStorage({
        destination: avatarDir,
        filename: (_req, file, cb) => cb(null, `${crypto.randomBytes(16).toString('hex')}${EXT[file.mimetype] ?? ''}`),
    }),
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => cb(null, Boolean(EXT[file.mimetype])),
})

router.post(
    '/avatar',
    upload.single('avatar'),
    handle(async (req, res) => {
        if (!req.file) throw badRequest('Upload a PNG, JPEG or WebP image up to 2 MB')

        const previous = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id }, select: { avatar: true } })
        const avatar = `/uploads/avatars/${req.file.filename}`
        await prisma.user.update({ where: { id: req.user.id }, data: { avatar } })

        // Remove the replaced file (only ones we created)
        if (previous.avatar?.startsWith('/uploads/avatars/')) {
            fs.promises.unlink(path.join(avatarDir, path.basename(previous.avatar))).catch(() => undefined)
        }
        res.json({ avatar })
    })
)

// ----- Password & account -----
router.post(
    '/change-password',
    validate(
        z.object({
            currentPassword: z.string().min(1),
            newPassword: z.string().min(8).max(128).regex(/[A-Za-z]/, 'Password must contain a letter').regex(/[0-9]/, 'Password must contain a number'),
        })
    ),
    handle(async (req, res) => {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })
        if (!(await bcrypt.compare(req.body.currentPassword, user.password))) throw unauthorized('Current password is incorrect')

        await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(req.body.newPassword, 12) } })
        await revokeAllRefreshTokens(user.id)
        res.json({ message: 'Password changed. Please sign in again on your other devices.' })
    })
)

router.delete(
    '/account',
    validate(z.object({ password: z.string().min(1) })),
    handle(async (req, res) => {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })
        if (!(await bcrypt.compare(req.body.password, user.password))) throw unauthorized('Password is incorrect')

        // Deleting an instructor would delete their courses out from under enrolled students
        const enrolledStudents = await prisma.enrollment.count({ where: { course: { instructorId: user.id }, userId: { not: user.id } } })
        if (enrolledStudents > 0) {
            throw conflict('You have courses with enrolled students. Unpublish or transfer them before deleting your account.')
        }

        await prisma.user.delete({ where: { id: user.id } }) // cascades to all owned data
        res.clearCookie('refreshToken', { path: '/api/auth' })
        res.json({ message: 'Account deleted' })
    })
)

export default router
