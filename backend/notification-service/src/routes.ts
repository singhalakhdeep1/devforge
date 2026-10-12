import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { AppError, asyncHandler, authenticate, internalOnly, toUser, userOf, validate } from '@devhub/shared'
import { Notification, Preference, toJSON } from './model'
import { createNotification, unreadCount } from './service'

const router = Router()
router.use(authenticate)

const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!.id
const objectId = (value: string) => {
    if (!mongoose.isValidObjectId(value)) throw AppError.badRequest('Invalid id')
    return value
}

// GET /api/notifications?unread=true
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = me(req)
        const unreadOnly = req.query.unread === 'true'
        const [items, unread] = await Promise.all([
            Notification.find({ userId, ...(unreadOnly ? { readAt: null } : {}) })
                .sort({ createdAt: -1 })
                .limit(100),
            unreadCount(userId),
        ])
        res.json({ items: items.map(toJSON), unread })
    })
)

router.get(
    '/unread-count',
    asyncHandler(async (req, res) => {
        res.json({ unread: await unreadCount(me(req)) })
    })
)

router.post(
    '/read-all',
    asyncHandler(async (req, res) => {
        const userId = me(req)
        const r = await Notification.updateMany({ userId, readAt: null }, { readAt: new Date() })
        await toUser(userId, 'notifications:read', { all: true })
        res.json({ updated: r.modifiedCount })
    })
)

router.post(
    '/:id/read',
    asyncHandler(async (req, res) => {
        await Notification.updateOne({ _id: objectId(req.params.id), userId: me(req), readAt: null }, { readAt: new Date() })
        res.json({ message: 'Marked as read' })
    })
)

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        await Notification.deleteOne({ _id: objectId(req.params.id), userId: me(req) })
        res.json({ message: 'Deleted' })
    })
)

// ----- Preferences: mute notification types -----
router.get(
    '/preferences/me',
    asyncHandler(async (req, res) => {
        const pref = await Preference.findOne({ userId: me(req) }).lean()
        res.json({ muted: pref?.muted ?? [] })
    })
)

router.put(
    '/preferences/me',
    validate(z.object({ muted: z.array(z.string().trim().min(1).max(40)).max(30) })),
    asyncHandler(async (req, res) => {
        const pref = await Preference.findOneAndUpdate({ userId: me(req) }, { muted: [...new Set<string>(req.body.muted)] }, { upsert: true, new: true }).lean()
        res.json({ muted: pref?.muted ?? [] })
    })
)

/** Other services (and admins) can create notifications directly, in addition to the event consumers. */
export const internalRouter = Router()
internalRouter.use(internalOnly)
internalRouter.post(
    '/notifications',
    validate(
        z.object({
            notifications: z
                .array(z.object({ userId: z.string().min(1), type: z.string().min(1).max(40), title: z.string().min(1).max(200), body: z.string().max(1000).optional(), link: z.string().max(300).optional() }))
                .min(1)
                .max(500),
        })
    ),
    asyncHandler(async (req, res) => {
        const created = await Promise.all((req.body.notifications as Parameters<typeof createNotification>[0][]).map(createNotification))
        res.status(201).json({ created: created.filter(Boolean).length })
    })
)

export default router
