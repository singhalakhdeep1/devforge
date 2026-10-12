import { Role } from '../generated/client'
import { prisma } from './prisma'
import { forbidden, notFound } from './errors'
import { TOPICS, emit } from '@devhub/shared'
import { bus, notify } from './notify'

export const QUIZ_PASS_PERCENT = 70

interface Actor {
    id: string
    role: Role
}

/** Enrolled students, the course's instructor and admins may read course content. */
export async function assertCourseAccess(actor: Actor, courseId: number) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, instructorId: true, title: true, published: true } })
    if (!course) throw notFound('Course')

    if (actor.role === 'ADMIN' || course.instructorId === actor.id) return { course, privileged: true }

    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: actor.id, courseId } } })
    if (!enrollment) throw forbidden('Enroll in this course to access its content')
    return { course, privileged: false }
}

/** Instructors manage only their own courses; admins manage any. */
export async function assertCourseOwner(actor: Actor, courseId: number) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, instructorId: true } })
    if (!course) throw notFound('Course')
    if (actor.role !== 'ADMIN' && course.instructorId !== actor.id) throw forbidden('You can only manage your own courses')
    return course
}

export async function courseLessonIds(courseId: number): Promise<number[]> {
    const lessons = await prisma.lesson.findMany({
        where: { module: { courseId } },
        select: { id: true },
        orderBy: [{ module: { position: 'asc' } }, { position: 'asc' }],
    })
    return lessons.map((l) => l.id)
}

export async function getProgress(userId: string, courseId: number) {
    const lessonIds = await courseLessonIds(courseId)
    const done = await prisma.lessonProgress.findMany({
        where: { userId, lessonId: { in: lessonIds } },
        select: { lessonId: true },
    })
    const completedLessonIds = done.map((d) => d.lessonId)
    const completed = new Set(completedLessonIds)
    return {
        totalLessons: lessonIds.length,
        completedLessons: completedLessonIds.length,
        percent: lessonIds.length ? Math.round((completedLessonIds.length / lessonIds.length) * 100) : 0,
        completedLessonIds,
        nextLessonId: lessonIds.find((id) => !completed.has(id)) ?? null,
    }
}

/**
 * Marks a lesson complete (idempotent). When it was the last remaining lesson the
 * enrollment is closed and a certificate is issued.
 */
export async function completeLesson(userId: string, lessonId: number) {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true, module: { select: { courseId: true, course: { select: { title: true } } } } },
    })
    if (!lesson) throw notFound('Lesson')
    const { courseId } = lesson.module

    await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {},
        create: { userId, lessonId },
    })
    await prisma.enrollment.updateMany({ where: { userId, courseId }, data: { lastAccessAt: new Date() } })

    const progress = await getProgress(userId, courseId)
    let certificateId: string | null = null
    emit(bus, TOPICS.lessonCompleted, 'lesson.completed', { userId, lessonId, courseId, percent: progress.percent }, userId)

    if (progress.totalLessons > 0 && progress.completedLessons === progress.totalLessons) {
        const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } })
        if (enrollment && !enrollment.completedAt) {
            await prisma.enrollment.update({ where: { id: enrollment.id }, data: { completedAt: new Date() } })
            const cert = await prisma.certificate.upsert({
                where: { userId_courseId: { userId, courseId } },
                update: {},
                create: { userId, courseId },
            })
            certificateId = cert.id
            emit(bus, TOPICS.courseCompleted, 'course.completed', { userId, courseId, courseTitle: lesson.module.course.title }, userId)
            emit(bus, TOPICS.certificateIssued, 'certificate.issued', { userId, courseId, certificateId: cert.id, courseTitle: lesson.module.course.title }, userId)
            await notify({
                userId,
                type: 'certificate',
                title: 'Certificate earned',
                body: `You completed ${lesson.module.course.title}.`,
                link: `/certificates/${cert.id}`,
            })
        }
    }

    return { ...progress, certificateId }
}
