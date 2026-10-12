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

/** Aggregates for the reporting-service. */
router.get(
    '/stats',
    handle(async (req, res) => {
        const days = Math.min(365, Math.max(1, Number(req.query.days) || 30))
        const since = new Date(Date.now() - days * 86_400_000)
        const [published, drafts, enrollments, newEnrollments, completions, byCategory, perDay, rating, top, revenue] = await Promise.all([
            prisma.course.count({ where: { published: true } }),
            prisma.course.count({ where: { published: false } }),
            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { enrolledAt: { gte: since } } }),
            prisma.enrollment.count({ where: { completedAt: { gte: since } } }),
            prisma.course.groupBy({ by: ['category'], where: { published: true }, _count: true }),
            prisma.$queryRaw<{ day: Date; n: bigint }[]>`SELECT date_trunc('day', "enrolledAt") AS day, count(*) AS n FROM enrollments WHERE "enrolledAt" >= ${since} GROUP BY 1 ORDER BY 1`,
            prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
            prisma.course.findMany({ where: { published: true }, orderBy: { enrollments: { _count: 'desc' } }, take: 10, select: { id: true, title: true, category: true, price: true, _count: { select: { enrollments: true, reviews: true } } } }),
            prisma.coursePayment.groupBy({ by: ['courseId'], where: { paidAt: { gte: since } }, _sum: { amount: true }, _count: true }),
        ])
        res.json({
            days, published, drafts, enrollments, newEnrollments, completions,
            completionRate: newEnrollments ? Number(((completions / newEnrollments) * 100).toFixed(1)) : null,
            averageRating: Number((rating._avg.rating ?? 0).toFixed(2)), reviews: rating._count,
            byCategory: byCategory.map((c) => ({ category: c.category, courses: c._count })),
            enrollmentsPerDay: perDay.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.n) })),
            topCourses: top.map((c) => ({ id: c.id, title: c.title, category: c.category, price: Number(c.price), enrollments: c._count.enrollments, reviews: c._count.reviews, revenue: Number(revenue.find((r) => r.courseId === c.id)?._sum.amount ?? 0) })),
            revenueInPeriod: Number(revenue.reduce((n, r) => n + Number(r._sum.amount ?? 0), 0).toFixed(2)),
        })
    })
)

router.get(
    '/instructors/:id/report',
    handle(async (req, res) => {
        const days = Math.min(365, Math.max(1, Number(req.query.days) || 30))
        const since = new Date(Date.now() - days * 86_400_000)
        const courses = await prisma.course.findMany({ where: { instructorId: req.params.id }, select: { id: true, title: true, published: true, price: true, _count: { select: { enrollments: true, reviews: true } } } })
        const ids = courses.map((c) => c.id)
        const [recent, done, pay, ratings] = await Promise.all([
            prisma.enrollment.groupBy({ by: ['courseId'], where: { courseId: { in: ids }, enrolledAt: { gte: since } }, _count: true }),
            prisma.enrollment.groupBy({ by: ['courseId'], where: { courseId: { in: ids }, completedAt: { gte: since } }, _count: true }),
            prisma.coursePayment.groupBy({ by: ['courseId'], where: { courseId: { in: ids }, paidAt: { gte: since } }, _sum: { amount: true } }),
            prisma.review.groupBy({ by: ['courseId'], where: { courseId: { in: ids } }, _avg: { rating: true } }),
        ])
        res.json({ days, courses: courses.map((c) => ({ id: c.id, title: c.title, published: c.published, price: Number(c.price), students: c._count.enrollments, reviews: c._count.reviews, rating: Number((ratings.find((r) => r.courseId === c.id)?._avg.rating ?? 0).toFixed(2)), newEnrollments: recent.find((r) => r.courseId === c.id)?._count ?? 0, completions: done.find((r) => r.courseId === c.id)?._count ?? 0, revenue: Number(pay.find((r) => r.courseId === c.id)?._sum.amount ?? 0) })) })
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
