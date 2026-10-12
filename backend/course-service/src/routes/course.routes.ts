import { Router } from 'express'
import { Level, Prisma } from '../generated/client'
import { z } from 'zod'
import { badRequest, forbidden, handle, intParam, notFound } from '../lib/errors'
import { getProgress } from '../lib/learning'
import { notify } from '../lib/notify'
import { prisma } from '../lib/prisma'
import { optionalAuth, protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const listQuery = z.object({
    search: z.string().trim().max(100).optional(),
    category: z.string().trim().max(60).optional(),
    level: z.nativeEnum(Level).optional(),
    sort: z.enum(['newest', 'popular', 'price_asc', 'price_desc']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

const orderBy = (sort: z.infer<typeof listQuery>['sort']): Prisma.CourseOrderByWithRelationInput =>
    sort === 'popular'
        ? { enrollments: { _count: 'desc' } }
        : sort === 'price_asc'
          ? { price: 'asc' }
          : sort === 'price_desc'
            ? { price: 'desc' }
            : { createdAt: 'desc' }

/** Average rating for several courses with a single query. */
async function ratingsFor(courseIds: number[]) {
    const rows = await prisma.review.groupBy({ by: ['courseId'], where: { courseId: { in: courseIds } }, _avg: { rating: true }, _count: true })
    return new Map(rows.map((r) => [r.courseId, { rating: Math.round((r._avg.rating ?? 0) * 10) / 10, ratingCount: r._count }]))
}

// GET /api/courses
router.get(
    '/',
    validate(listQuery, 'query'),
    handle(async (req, res) => {
        const { search, category, level, sort, page, pageSize } = req.query as unknown as z.infer<typeof listQuery>

        const where: Prisma.CourseWhereInput = {
            published: true,
            ...(category && category !== 'All' ? { category } : {}),
            ...(level ? { level } : {}),
            ...(search
                ? {
                      OR: [
                          { title: { contains: search, mode: 'insensitive' } },
                          { description: { contains: search, mode: 'insensitive' } },
                          { category: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        }

        const [total, courses] = await Promise.all([
            prisma.course.count({ where }),
            prisma.course.findMany({
                where,
                orderBy: orderBy(sort),
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    instructor: { select: { id: true, name: true, avatar: true } },
                    _count: { select: { enrollments: true } },
                    modules: { select: { lessons: { select: { durationMin: true } } } },
                },
            }),
        ])
        const ratings = await ratingsFor(courses.map((c) => c.id))

        res.json({
            data: courses.map(({ modules, _count, ...c }) => {
                const lessons = modules.flatMap((m) => m.lessons)
                return {
                    ...c,
                    price: Number(c.price),
                    students: _count.enrollments,
                    lessonCount: lessons.length,
                    totalMinutes: lessons.reduce((s, l) => s + l.durationMin, 0),
                    ...(ratings.get(c.id) ?? { rating: 0, ratingCount: 0 }),
                }
            }),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        })
    })
)

// GET /api/courses/categories
router.get(
    '/categories',
    handle(async (_req, res) => {
        const rows = await prisma.course.groupBy({ by: ['category'], where: { published: true }, _count: true, orderBy: { category: 'asc' } })
        res.json(rows.map((r) => ({ name: r.category, count: r._count })))
    })
)

// GET /api/courses/:id   (drafts are visible only to their owner / admins)
router.get(
    '/:id',
    optionalAuth,
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: { select: { id: true, name: true, avatar: true, bio: true } },
                _count: { select: { enrollments: true } },
                modules: {
                    orderBy: { position: 'asc' },
                    include: {
                        lessons: { orderBy: { position: 'asc' }, select: { id: true, title: true, type: true, durationMin: true, position: true } },
                    },
                },
            },
        })
        if (!course) throw notFound('Course')

        const isOwner = req.user && (req.user.id === course.instructorId || req.user.role === 'ADMIN')
        if (!course.published && !isOwner) throw notFound('Course')

        const { _count, ...rest } = course
        const lessons = course.modules.flatMap((m) => m.lessons)
        const rating = (await ratingsFor([id])).get(id) ?? { rating: 0, ratingCount: 0 }

        let enrollment: { enrolled: boolean; completed: boolean; progress?: Awaited<ReturnType<typeof getProgress>> } = { enrolled: false, completed: false }
        if (req.user) {
            const e = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: id } } })
            if (e) enrollment = { enrolled: true, completed: Boolean(e.completedAt), progress: await getProgress(req.user.id, id) }
        }

        res.json({
            ...rest,
            price: Number(course.price),
            students: _count.enrollments,
            lessonCount: lessons.length,
            totalMinutes: lessons.reduce((s, l) => s + l.durationMin, 0),
            ...rating,
            isOwner: Boolean(isOwner),
            enrollment,
        })
    })
)

// POST /api/courses/:id/enroll   (free courses; paid courses go through /api/payments/checkout)
router.post(
    '/:id/enroll',
    protect,
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        const course = await prisma.course.findUnique({ where: { id: courseId } })
        if (!course || !course.published) throw notFound('Course')
        if (course.instructorId === req.user.id) throw badRequest('You cannot enroll in your own course')
        if (Number(course.price) > 0) {
            return res.status(402).json({ error: 'This is a paid course. Purchase it to enroll.', checkoutRequired: true })
        }

        const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId } } })
        if (existing) return res.json({ enrolled: true, alreadyEnrolled: true })

        await prisma.enrollment.create({ data: { userId: req.user.id, courseId } })
        await notify({ userId: course.instructorId, type: 'enrollment', title: 'New student', body: `${req.user.name} enrolled in ${course.title}`, link: `/instructor/courses/${courseId}` })
        res.status(201).json({ enrolled: true })
    })
)

// DELETE /api/courses/:id/enroll   (leave a free course)
router.delete(
    '/:id/enroll',
    protect,
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { price: true } })
        if (!course) throw notFound('Course')
        if (Number(course.price) > 0) throw forbidden('Paid enrollments cannot be cancelled here')

        const result = await prisma.enrollment.deleteMany({ where: { userId: req.user.id, courseId } })
        if (result.count === 0) throw notFound('Enrollment')
        res.json({ message: 'You have left the course' })
    })
)

// ----- Reviews -----
router.get(
    '/:id/reviews',
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        const reviews = await prisma.review.findMany({
            where: { courseId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { user: { select: { id: true, name: true, avatar: true } } },
        })
        res.json(reviews)
    })
)

router.post(
    '/:id/reviews',
    protect,
    validate(z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1000).default('') })),
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId } } })
        if (!enrollment) throw forbidden('Only enrolled students can review a course')

        const review = await prisma.review.upsert({
            where: { userId_courseId: { userId: req.user.id, courseId } },
            update: { rating: req.body.rating, comment: req.body.comment },
            create: { userId: req.user.id, courseId, rating: req.body.rating, comment: req.body.comment },
        })
        res.status(201).json(review)
    })
)

export default router
