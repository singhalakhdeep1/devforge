import { Router } from 'express'
import { Level, LessonType } from '@prisma/client'
import { z } from 'zod'
import { badRequest, conflict, handle, intParam, notFound } from '../lib/errors'
import { assertCourseOwner } from '../lib/learning'
import { prisma } from '../lib/prisma'
import { authorize, protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()
router.use(protect, authorize('INSTRUCTOR', 'ADMIN'))

const courseSchema = z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
    category: z.string().trim().min(1).max(60).default('General'),
    level: z.nativeEnum(Level).default('BEGINNER'),
    price: z.number().min(0).max(100000).default(0),
    thumbnailUrl: z
        .string()
        .trim()
        .max(500)
        .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Must be an http(s) URL')
        .transform((v) => v || null)
        .optional(),
})

const lessonSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(150),
    type: z.nativeEnum(LessonType).default('ARTICLE'),
    content: z.string().max(50_000).default(''),
    videoUrl: z
        .string()
        .trim()
        .max(500)
        .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Must be an http(s) URL')
        .transform((v) => v || null)
        .optional(),
    durationMin: z.number().int().min(1).max(600).default(5),
})

// ---------- Courses ----------

router.get(
    '/courses',
    handle(async (req, res) => {
        const courses = await prisma.course.findMany({
            where: req.user.role === 'ADMIN' ? {} : { instructorId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            include: { modules: { select: { lessons: { select: { id: true } } } } },
        })
        const ids = courses.map((c) => c.id)

        const [enrolled, completed, revenue, ratings] = await Promise.all([
            prisma.enrollment.groupBy({ by: ['courseId'], where: { courseId: { in: ids } }, _count: true }),
            prisma.enrollment.groupBy({ by: ['courseId'], where: { courseId: { in: ids }, completedAt: { not: null } }, _count: true }),
            prisma.order.groupBy({ by: ['courseId'], where: { courseId: { in: ids }, status: 'PAID' }, _sum: { amount: true } }),
            prisma.review.groupBy({ by: ['courseId'], where: { courseId: { in: ids } }, _avg: { rating: true }, _count: true }),
        ])
        const pick = <T extends { courseId: number }>(rows: T[], id: number) => rows.find((r) => r.courseId === id)

        res.json(
            courses.map(({ modules, ...c }) => ({
                ...c,
                price: Number(c.price),
                lessonCount: modules.reduce((s, m) => s + m.lessons.length, 0),
                students: pick(enrolled, c.id)?._count ?? 0,
                completions: pick(completed, c.id)?._count ?? 0,
                revenue: Number(pick(revenue, c.id)?._sum.amount ?? 0),
                rating: Math.round((pick(ratings, c.id)?._avg.rating ?? 0) * 10) / 10,
                ratingCount: pick(ratings, c.id)?._count ?? 0,
            }))
        )
    })
)

router.post(
    '/courses',
    validate(courseSchema),
    handle(async (req, res) => {
        const course = await prisma.course.create({ data: { ...req.body, instructorId: req.user.id } })
        res.status(201).json({ ...course, price: Number(course.price) })
    })
)

// Full course for the editor (includes lesson bodies and quiz answers)
router.get(
    '/courses/:id',
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await assertCourseOwner(req.user, id)
        const course = await prisma.course.findUniqueOrThrow({
            where: { id },
            include: {
                modules: {
                    orderBy: { position: 'asc' },
                    include: { lessons: { orderBy: { position: 'asc' }, include: { questions: { orderBy: { position: 'asc' } } } } },
                },
            },
        })
        res.json({ ...course, price: Number(course.price) })
    })
)

router.put(
    '/courses/:id',
    validate(courseSchema.partial()),
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await assertCourseOwner(req.user, id)
        const course = await prisma.course.update({ where: { id }, data: req.body })
        res.json({ ...course, price: Number(course.price) })
    })
)

router.delete(
    '/courses/:id',
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await assertCourseOwner(req.user, id)
        const students = await prisma.enrollment.count({ where: { courseId: id } })
        if (students > 0 && req.user.role !== 'ADMIN') {
            throw conflict('This course has enrolled students. Unpublish it instead of deleting it.')
        }
        await prisma.course.delete({ where: { id } })
        res.json({ message: 'Course deleted' })
    })
)

router.post(
    '/courses/:id/publish',
    validate(z.object({ published: z.boolean() })),
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await assertCourseOwner(req.user, id)

        if (req.body.published) {
            const lessons = await prisma.lesson.count({ where: { module: { courseId: id } } })
            if (lessons === 0) throw badRequest('Add at least one lesson before publishing')
            const emptyQuizzes = await prisma.lesson.count({ where: { module: { courseId: id }, type: 'QUIZ', questions: { none: {} } } })
            if (emptyQuizzes > 0) throw badRequest('Every quiz lesson needs at least one question before publishing')
        }
        const course = await prisma.course.update({ where: { id }, data: { published: req.body.published } })
        res.json({ id: course.id, published: course.published })
    })
)

// ---------- Modules ----------

router.post(
    '/courses/:id/modules',
    validate(z.object({ title: z.string().trim().min(1).max(150) })),
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        await assertCourseOwner(req.user, courseId)
        const last = await prisma.module.aggregate({ where: { courseId }, _max: { position: true } })
        const module = await prisma.module.create({ data: { courseId, title: req.body.title, position: (last._max.position ?? -1) + 1 } })
        res.status(201).json({ ...module, lessons: [] })
    })
)

async function moduleOwned(req: { user: { id: string; role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' } }, moduleId: number) {
    const module = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!module) throw notFound('Module')
    await assertCourseOwner(req.user, module.courseId)
    return module
}

async function lessonOwned(req: { user: { id: string; role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' } }, lessonId: number) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { select: { courseId: true } } } })
    if (!lesson) throw notFound('Lesson')
    await assertCourseOwner(req.user, lesson.module.courseId)
    return lesson
}

router.put(
    '/modules/:id',
    validate(z.object({ title: z.string().trim().min(1).max(150) })),
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await moduleOwned(req, id)
        res.json(await prisma.module.update({ where: { id }, data: { title: req.body.title } }))
    })
)

router.delete(
    '/modules/:id',
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await moduleOwned(req, id)
        await prisma.module.delete({ where: { id } })
        res.json({ message: 'Module deleted' })
    })
)

// ---------- Lessons ----------

router.post(
    '/modules/:id/lessons',
    validate(lessonSchema),
    handle(async (req, res) => {
        const moduleId = intParam(req.params.id)
        await moduleOwned(req, moduleId)
        const last = await prisma.lesson.aggregate({ where: { moduleId }, _max: { position: true } })
        const lesson = await prisma.lesson.create({ data: { ...req.body, moduleId, position: (last._max.position ?? -1) + 1 } })
        res.status(201).json({ ...lesson, questions: [] })
    })
)

router.put(
    '/lessons/:id',
    validate(lessonSchema.partial()),
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await lessonOwned(req, id)
        res.json(await prisma.lesson.update({ where: { id }, data: req.body }))
    })
)

router.delete(
    '/lessons/:id',
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        await lessonOwned(req, id)
        await prisma.lesson.delete({ where: { id } })
        res.json({ message: 'Lesson deleted' })
    })
)

// Replaces all quiz questions of a lesson in one call
router.put(
    '/lessons/:id/questions',
    validate(
        z.object({
            questions: z
                .array(
                    z
                        .object({
                            question: z.string().trim().min(1, 'Question text is required').max(500),
                            options: z.array(z.string().trim().min(1).max(200)).min(2, 'At least 2 options').max(6),
                            correctAnswer: z.number().int().min(0),
                            explanation: z.string().trim().max(500).optional(),
                        })
                        .refine((q) => q.correctAnswer < q.options.length, { message: 'correctAnswer must point at one of the options' })
                )
                .max(50),
        })
    ),
    handle(async (req, res) => {
        const lessonId = intParam(req.params.id)
        const lesson = await lessonOwned(req, lessonId)
        if (lesson.type !== 'QUIZ') throw badRequest('Only QUIZ lessons can have questions')

        const questions = await prisma.$transaction(async (tx) => {
            await tx.quizQuestion.deleteMany({ where: { lessonId } })
            await tx.quizQuestion.createMany({
                data: (req.body.questions as { question: string; options: string[]; correctAnswer: number; explanation?: string }[]).map((q, position) => ({ ...q, lessonId, position })),
            })
            return tx.quizQuestion.findMany({ where: { lessonId }, orderBy: { position: 'asc' } })
        })
        res.json(questions)
    })
)

// ---------- Ordering ----------

// Sets module order and lesson order (including moving lessons between modules) in one call
router.put(
    '/courses/:id/order',
    validate(z.object({ modules: z.array(z.object({ id: z.number().int(), lessonIds: z.array(z.number().int()) })).max(200) })),
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        await assertCourseOwner(req.user, courseId)
        const modules: { id: number; lessonIds: number[] }[] = req.body.modules

        const [ownModules, ownLessons] = await Promise.all([
            prisma.module.findMany({ where: { courseId }, select: { id: true } }),
            prisma.lesson.findMany({ where: { module: { courseId } }, select: { id: true } }),
        ])
        const moduleIds = new Set(ownModules.map((m) => m.id))
        const lessonIds = new Set(ownLessons.map((l) => l.id))
        const sentLessons = modules.flatMap((m) => m.lessonIds)

        if (modules.some((m) => !moduleIds.has(m.id)) || sentLessons.some((id) => !lessonIds.has(id))) {
            throw badRequest('Order contains modules or lessons that do not belong to this course')
        }
        if (new Set(sentLessons).size !== sentLessons.length) throw badRequest('A lesson appears more than once')

        await prisma.$transaction([
            ...modules.map((m, mi) => prisma.module.update({ where: { id: m.id }, data: { position: mi } })),
            ...modules.flatMap((m) => m.lessonIds.map((lessonId, li) => prisma.lesson.update({ where: { id: lessonId }, data: { moduleId: m.id, position: li } }))),
        ])
        res.json({ message: 'Order saved' })
    })
)

// ---------- Students ----------

router.get(
    '/courses/:id/students',
    handle(async (req, res) => {
        const courseId = intParam(req.params.id)
        await assertCourseOwner(req.user, courseId)
        const total = await prisma.lesson.count({ where: { module: { courseId } } })
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            orderBy: { enrolledAt: 'desc' },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        })
        const done = await prisma.lessonProgress.groupBy({
            by: ['userId'],
            where: { userId: { in: enrollments.map((e) => e.userId) }, lesson: { module: { courseId } } },
            _count: true,
        })
        const doneBy = new Map(done.map((d) => [d.userId, d._count]))
        res.json(
            enrollments.map((e) => ({
                user: e.user,
                enrolledAt: e.enrolledAt,
                completedAt: e.completedAt,
                progress: total ? Math.round(((doneBy.get(e.userId) ?? 0) / total) * 100) : 0,
            }))
        )
    })
)

export default router
