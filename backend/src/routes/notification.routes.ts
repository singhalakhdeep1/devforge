import { Router } from 'express'
import { handle, intParam } from '../lib/errors'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'

const router = Router()
router.use(protect)

// GET /api/notifications?unread=true
router.get(
    '/',
    handle(async (req, res) => {
        const unreadOnly = req.query.unread === 'true'
        const [items, unread] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: req.user.id, ...(unreadOnly ? { readAt: null } : {}) },
                orderBy: { createdAt: 'desc' },
                take: 100,
            }),
            prisma.notification.count({ where: { userId: req.user.id, readAt: null } }),
        ])
        res.json({ items, unread })
    })
)

router.post(
    '/read-all',
    handle(async (req, res) => {
        const { count } = await prisma.notification.updateMany({ where: { userId: req.user.id, readAt: null }, data: { readAt: new Date() } })
        res.json({ updated: count })
    })
)

router.post(
    '/:id/read',
    handle(async (req, res) => {
        await prisma.notification.updateMany({ where: { id: intParam(req.params.id), userId: req.user.id, readAt: null }, data: { readAt: new Date() } })
        res.json({ message: 'Marked as read' })
    })
)

router.delete(
    '/:id',
    handle(async (req, res) => {
        await prisma.notification.deleteMany({ where: { id: intParam(req.params.id), userId: req.user.id } })
        res.json({ message: 'Deleted' })
    })
)

export default router
