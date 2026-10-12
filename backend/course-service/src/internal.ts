import { Router } from 'express'
import { internalOnly } from '@devhub/shared'
import { handle, intParam, notFound } from './lib/errors'
import { prisma } from './lib/prisma'

/** Endpoints other services call (payment-service, auth-service, search, analytics). Guarded by the internal key. */
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

/** Denormalised view of a course for the search index and reports. */
router.get(
    '/courses/:id/doc',
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        const c = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: { select: { id: true, name: true } },
                modules: { orderBy: { position: 'asc' }, include: { lessons: { orderBy: { position: 'asc' }, select: { title: true, type: true, durationMin: true } } } },
                _count: { select: { enrollments: true } },
            },
        })
        if (!c) throw notFound('Course')
        const rating = await prisma.review.aggregate({ where: { courseId: id }, _avg: { rating: true }, _count: true })
        const lessons = c.modules.flatMap((m) => m.lessons)
        res.json({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            level: c.level,
            price: Number(c.price),
            published: c.published,
            thumbnailUrl: c.thumbnailUrl,
            instructor: c.instructor,
            modules: c.modules.map((m) => m.title),
            lessons: lessons.map((l) => l.title),
            lessonCount: lessons.length,
            totalMinutes: lessons.reduce((s, l) => s + l.durationMin, 0),
            students: c._count.enrollments,
            rating: Number((rating._avg.rating ?? 0).toFixed(2)),
            ratingCount: rating._count,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        })
    })
)

/** Course ids in pages, for (re)building indexes: ?after=<id>&limit=100 */
router.get(
    '/courses',
    handle(async (req, res) => {
        const after = Number(req.query.after) || 0
        const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100))
        const rows = await prisma.course.findMany({ where: { id: { gt: after } }, orderBy: { id: 'asc' }, take: limit, select: { id: true } })
        res.json({ ids: rows.map((r) => r.id), next: rows.length === limit ? rows[rows.length - 1].id : null })
    })
)

router.get(
    '/instructors/:id/courses',
    handle(async (req, res) => {
        const rows = await prisma.course.findMany({ where: { instructorId: req.params.id }, select: { id: true } })
        res.json({ ids: rows.map((r) => r.id) })
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
