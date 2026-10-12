import { Router } from 'express'
import { z } from 'zod'
import { badRequest, handle, intParam, notFound } from '../lib/errors'
import { assertCourseAccess, completeLesson, courseLessonIds, getProgress, QUIZ_PASS_PERCENT } from '../lib/learning'
import { notify } from '../lib/notify'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()
router.use(protect)

// GET /api/learn/my-courses  - courses the user is enrolled in, with progress
router.get(
    '/my-courses',
    handle(async (req, res) => {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            orderBy: { lastAccessAt: 'desc' },
            include: { course: { include: { instructor: { select: { id: true, name: true } } } } },
        })
        const items = await Promise.all(
            enrollments.map(async (e) => {
                const progress = await getProgress(req.user.id, e.courseId)
                return {
                    courseId: e.courseId,
                    title: e.course.title,
                    category: e.course.category,
                    level: e.course.level,
                    instructor: e.course.instructor,
                    enrolledAt: e.enrolledAt,
                    lastAccessAt: e.lastAccessAt,
                    completedAt: e.completedAt,
                    progress: progress.percent,
                    completedLessons: progress.completedLessons,
                    totalLessons: progress.totalLessons,
                    nextLessonId: progress.nextLessonId,
                }
            })
        )
        res.json(items)
    })
)

// GET /api/learn/courses/:courseId  - outline + progress for the learning view
router.get(
    '/courses/:courseId',
    handle(async (req, res) => {
        const courseId = intParam(req.params.courseId, 'course id')
        const { privileged } = await assertCourseAccess(req.user, courseId)

        const course = await prisma.course.findUniqueOrThrow({
            where: { id: courseId },
            select: {
                id: true,
                title: true,
                modules: {
                    orderBy: { position: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        lessons: { orderBy: { position: 'asc' }, select: { id: true, title: true, type: true, durationMin: true } },
                    },
                },
            },
        })
        // `preview` is true for the instructor / admins, who can read lessons but have no progress to track
        res.json({ ...course, preview: privileged, progress: await getProgress(req.user.id, courseId) })
    })
)

// GET /api/learn/lessons/:lessonId
router.get(
    '/lessons/:lessonId',
    handle(async (req, res) => {
        const lessonId = intParam(req.params.lessonId, 'lesson id')
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: { select: { id: true, title: true, courseId: true } },
                questions: { orderBy: { position: 'asc' }, select: { id: true, question: true, options: true } }, // answers stay server-side
            },
        })
        if (!lesson) throw notFound('Lesson')

        const { courseId } = lesson.module
        const { privileged } = await assertCourseAccess(req.user, courseId)

        const ids = await courseLessonIds(courseId)
        const index = ids.indexOf(lessonId)
        const [completed, lastAttempt] = await Promise.all([
            prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: req.user.id, lessonId } } }),
            prisma.quizAttempt.findFirst({ where: { userId: req.user.id, lessonId }, orderBy: { submittedAt: 'desc' } }),
        ])
        if (!privileged) await prisma.enrollment.updateMany({ where: { userId: req.user.id, courseId }, data: { lastAccessAt: new Date() } })

        res.json({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            durationMin: lesson.durationMin,
            module: lesson.module,
            questions: lesson.questions,
            completed: Boolean(completed),
            lastAttempt: lastAttempt && { score: lastAttempt.score, passed: lastAttempt.passed, submittedAt: lastAttempt.submittedAt },
            passPercent: QUIZ_PASS_PERCENT,
            prevLessonId: index > 0 ? ids[index - 1] : null,
            nextLessonId: index >= 0 && index < ids.length - 1 ? ids[index + 1] : null,
        })
    })
)

// POST /api/learn/lessons/:lessonId/complete
router.post(
    '/lessons/:lessonId/complete',
    handle(async (req, res) => {
        const lessonId = intParam(req.params.lessonId, 'lesson id')
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { type: true, module: { select: { courseId: true } } } })
        if (!lesson) throw notFound('Lesson')

        const { privileged } = await assertCourseAccess(req.user, lesson.module.courseId)
        if (privileged) throw badRequest('Progress is only tracked for enrolled students')

        if (lesson.type === 'QUIZ') {
            const passed = await prisma.quizAttempt.findFirst({ where: { userId: req.user.id, lessonId, passed: true } })
            if (!passed) throw badRequest(`Pass the quiz (${QUIZ_PASS_PERCENT}% or higher) to complete this lesson`)
        }
        res.json(await completeLesson(req.user.id, lessonId))
    })
)

// DELETE /api/learn/lessons/:lessonId/complete  - undo
router.delete(
    '/lessons/:lessonId/complete',
    handle(async (req, res) => {
        const lessonId = intParam(req.params.lessonId, 'lesson id')
        await prisma.lessonProgress.deleteMany({ where: { userId: req.user.id, lessonId } })
        res.json({ message: 'Marked as incomplete' })
    })
)

// POST /api/learn/lessons/:lessonId/quiz  { answers: number[] }
router.post(
    '/lessons/:lessonId/quiz',
    validate(z.object({ answers: z.array(z.number().int().min(-1)).max(100) })),
    handle(async (req, res) => {
        const lessonId = intParam(req.params.lessonId, 'lesson id')
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } }, questions: { orderBy: { position: 'asc' } } },
        })
        if (!lesson) throw notFound('Lesson')
        if (lesson.questions.length === 0) throw badRequest('This lesson has no quiz')

        const { privileged } = await assertCourseAccess(req.user, lesson.module.courseId)
        const answers: number[] = req.body.answers

        const review = lesson.questions.map((q, i) => ({
            questionId: q.id,
            selected: answers[i] ?? -1,
            correct: (answers[i] ?? -1) === q.correctAnswer,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
        }))
        const correctAnswers = review.filter((r) => r.correct).length
        const score = Math.round((correctAnswers / lesson.questions.length) * 100)
        const passed = score >= QUIZ_PASS_PERCENT

        let progress = null
        if (!privileged) {
            await prisma.quizAttempt.create({
                data: { userId: req.user.id, lessonId, score, passed, totalQuestions: lesson.questions.length, correctAnswers },
            })
            if (passed) {
                progress = await completeLesson(req.user.id, lessonId)
                await notify({ userId: req.user.id, type: 'quiz', title: 'Quiz passed', body: `${lesson.title}: ${score}%`, link: `/learn/${lesson.module.courseId}/${lessonId}` })
            }
        }

        res.json({ score, passed, passPercent: QUIZ_PASS_PERCENT, correctAnswers, totalQuestions: lesson.questions.length, review, progress })
    })
)

export default router
