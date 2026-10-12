import { Router } from 'express'
import { handle } from '../lib/errors'
import { getProgress } from '../lib/learning'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'

const router = Router()

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

/** Consecutive days (ending today or yesterday) with at least one completed lesson. */
function streak(dates: Date[]): number {
    const days = new Set(dates.map(dayKey))
    const cursor = new Date()
    if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
    let count = 0
    while (days.has(dayKey(cursor))) {
        count++
        cursor.setUTCDate(cursor.getUTCDate() - 1)
    }
    return count
}

// GET /api/dashboard
router.get(
    '/',
    protect,
    handle(async (req, res) => {
        const userId = req.user.id

        const [enrollments, completedLessons, certificates, quizAttempts] = await Promise.all([
            prisma.enrollment.findMany({
                where: { userId },
                orderBy: { lastAccessAt: 'desc' },
                include: { course: { select: { id: true, title: true, category: true, instructor: { select: { name: true } } } } },
            }),
            prisma.lessonProgress.findMany({
                where: { userId },
                orderBy: { completedAt: 'desc' },
                include: { lesson: { select: { title: true, durationMin: true, module: { select: { course: { select: { id: true, title: true } } } } } } },
            }),
            prisma.certificate.count({ where: { userId } }),
            prisma.quizAttempt.findMany({ where: { userId }, orderBy: { submittedAt: 'desc' }, take: 5, include: { lesson: { select: { title: true, module: { select: { course: { select: { id: true, title: true } } } } } } } }),
        ])

        const courses = await Promise.all(
            enrollments.map(async (e) => {
                const p = await getProgress(userId, e.courseId)
                return {
                    id: e.course.id,
                    title: e.course.title,
                    category: e.course.category,
                    instructor: e.course.instructor.name,
                    progress: p.percent,
                    completedLessons: p.completedLessons,
                    totalLessons: p.totalLessons,
                    nextLessonId: p.nextLessonId,
                    lastAccessed: e.lastAccessAt,
                    completed: Boolean(e.completedAt),
                }
            })
        )

        const activity = [
            ...completedLessons.slice(0, 8).map((p) => ({
                action: `Completed "${p.lesson.title}"`,
                course: p.lesson.module.course.title,
                courseId: p.lesson.module.course.id,
                timestamp: p.completedAt,
            })),
            ...quizAttempts.map((a) => ({
                action: `${a.passed ? 'Passed' : 'Attempted'} quiz "${a.lesson.title}" (${a.score}%)`,
                course: a.lesson.module.course.title,
                courseId: a.lesson.module.course.id,
                timestamp: a.submittedAt,
            })),
        ]
            .sort((a, b) => +b.timestamp - +a.timestamp)
            .slice(0, 8)

        res.json({
            stats: {
                enrolledCourses: enrollments.length,
                completedCourses: enrollments.filter((e) => e.completedAt).length,
                lessonsCompleted: completedLessons.length,
                hoursLearned: Math.round((completedLessons.reduce((s, p) => s + p.lesson.durationMin, 0) / 60) * 10) / 10,
                streak: streak(completedLessons.map((p) => p.completedAt)),
                certificates,
            },
            courses,
            activity,
        })
    })
)

export default router
