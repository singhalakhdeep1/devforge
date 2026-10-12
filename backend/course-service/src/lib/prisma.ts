import { TOPICS, createEventBus, emit } from '@devhub/shared'
import { PrismaClient } from '../generated/client'

const base = new PrismaClient()
const bus = createEventBus('course')

// Several edits in a row (reordering a syllabus is dozens of updates) become one event per course
const pending = new Map<number, { action: string; timer: NodeJS.Timeout }>()
export function courseChanged(courseId: number, action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished' = 'updated') {
    const existing = pending.get(courseId)
    if (existing) clearTimeout(existing.timer)
    // a delete or publish change must not be hidden by a later plain update
    const keep = existing && ['deleted', 'published', 'unpublished', 'created'].includes(existing.action) && action === 'updated' ? existing.action : action
    const timer = setTimeout(() => {
        pending.delete(courseId)
        emit(bus, TOPICS.courseChanged, 'course.changed', { courseId, action: keep }, String(courseId))
        if (keep === 'published') emit(bus, TOPICS.coursePublished, 'course.published', { courseId }, String(courseId))
    }, 400)
    pending.set(courseId, { action: keep, timer })
}

/**
 * One client for the process. Writes to courses, modules and lessons announce themselves, so the
 * search index and analytics stay current without every route having to remember to say so.
 */
export const prisma = base.$extends({
    query: {
        course: {
            async create({ args, query }) {
                const r = (await query(args)) as { id: number; published: boolean }
                courseChanged(r.id, 'created')
                return r
            },
            async update({ args, query }) {
                const r = (await query(args)) as { id: number; published: boolean }
                const toggled = typeof (args.data as { published?: unknown }).published === 'boolean'
                courseChanged(r.id, toggled ? (r.published ? 'published' : 'unpublished') : 'updated')
                return r
            },
            async delete({ args, query }) {
                const r = (await query(args)) as { id: number; published: boolean }
                courseChanged(r.id, 'deleted')
                return r
            },
        },
        module: {
            async create({ args, query }) {
                const r = (await query(args)) as { courseId: number }
                courseChanged(r.courseId)
                return r
            },
            async update({ args, query }) {
                const r = (await query(args)) as { courseId: number }
                courseChanged(r.courseId)
                return r
            },
            async delete({ args, query }) {
                const r = (await query(args)) as { courseId: number }
                courseChanged(r.courseId)
                return r
            },
        },
        lesson: {
            async create({ args, query }) {
                const r = (await query(args)) as { moduleId: number }
                void base.module.findUnique({ where: { id: r.moduleId }, select: { courseId: true } }).then((m) => m && courseChanged(m.courseId))
                return r
            },
            async update({ args, query }) {
                const r = (await query(args)) as { moduleId: number }
                void base.module.findUnique({ where: { id: r.moduleId }, select: { courseId: true } }).then((m) => m && courseChanged(m.courseId))
                return r
            },
            async delete({ args, query }) {
                const r = (await query(args)) as { moduleId: number }
                void base.module.findUnique({ where: { id: r.moduleId }, select: { courseId: true } }).then((m) => m && courseChanged(m.courseId))
                return r
            },
        },
    },
})
