import { Router } from 'express'
import { internalOnly } from '@devhub/shared'
import { handle, intParam, notFound } from './lib/errors'
import { prisma } from './lib/prisma'

/** Endpoints other services call (payment-service, auth-service). Guarded by the internal key. */
const router = Router()
router.use(internalOnly)

router.get(
    '/courses/:id',
    handle(async (req, res) => {
        const c = await prisma.course.findUnique({ where: { id: intParam(req.params.id) } })
        if (!c) throw notFound('Course')
        res.json({ id: c.id, title: c.title, description: c.description, price: Number(c.price), published: c.published, instructorId: c.instructorId })
    })
)

router.get(
    '/enrollments/:userId/:courseId',
    handle(async (req, res) => {
        const e = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.params.userId, courseId: intParam(req.params.courseId) } } })
        res.json({ enrolled: Boolean(e) })
    })
)

/** An instructor with other people enrolled cannot delete their account without orphaning those students. */
router.get(
    '/users/:id/can-delete',
    handle(async (req, res) => {
        const students = await prisma.enrollment.count({ where: { course: { instructorId: req.params.id }, userId: { not: req.params.id } } })
        res.json(
            students > 0
                ? { allowed: false, reason: 'You have courses with enrolled students. Unpublish or transfer them before deleting your account.' }
                : { allowed: true }
        )
    })
)

export default router
