import { Router } from 'express'
import { z } from 'zod'
import { forbidden, handle, intParam, notFound } from '../lib/errors'
import { assertCourseAccess } from '../lib/learning'
import { notify } from '../lib/notify'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()
router.use(protect)

const author = { select: { id: true, name: true, avatar: true, role: true } }

async function withVotes<T extends { id: number; accepted: boolean; votes: { userId: string }[] }>(answers: T[], userId: string) {
    return answers
        .map(({ votes, ...a }) => ({ ...a, upvotes: votes.length, voted: votes.some((v) => v.userId === userId) }))
        .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.upvotes - a.upvotes)
}

const discussionInclude = {
    user: author,
    lesson: { select: { id: true, title: true } },
    answers: { orderBy: { createdAt: 'asc' as const }, include: { user: author, votes: { select: { userId: true } } } },
}

// GET /api/discussions/course/:courseId
router.get(
    '/course/:courseId',
    handle(async (req, res) => {
        const courseId = intParam(req.params.courseId, 'course id')
        await assertCourseAccess(req.user, courseId)

        const lessonId = req.query.lessonId ? intParam(String(req.query.lessonId), 'lesson id') : undefined
        const items = await prisma.discussion.findMany({
            where: { courseId, ...(lessonId ? { lessonId } : {}) },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: discussionInclude,
        })
        res.json(await Promise.all(items.map(async (d) => ({ ...d, answers: await withVotes(d.answers, req.user.id) }))))
    })
)

// POST /api/discussions
router.post(
    '/',
    validate(
        z.object({
            courseId: z.number().int(),
            lessonId: z.number().int().optional(),
            title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
            content: z.string().trim().min(1, 'Please describe your question').max(5000),
        })
    ),
    handle(async (req, res) => {
        const { courseId, lessonId, title, content } = req.body
        const { course } = await assertCourseAccess(req.user, courseId)

        if (lessonId) {
            const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, module: { courseId } }, select: { id: true } })
            if (!lesson) throw notFound('Lesson')
        }

        const discussion = await prisma.discussion.create({
            data: { courseId, lessonId, userId: req.user.id, title, content },
            include: discussionInclude,
        })

        const instructorId = (await prisma.course.findUniqueOrThrow({ where: { id: courseId }, select: { instructorId: true } })).instructorId
        if (instructorId !== req.user.id) {
            await notify({ userId: instructorId, type: 'discussion', title: 'New question', body: `${req.user.name} asked "${title}" in ${course.title}`, link: `/learn/${courseId}?tab=discussion` })
        }
        res.status(201).json({ ...discussion, answers: [] })
    })
)

// POST /api/discussions/:id/answers
router.post(
    '/:id/answers',
    validate(z.object({ content: z.string().trim().min(1, 'Answer cannot be empty').max(5000) })),
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        const discussion = await prisma.discussion.findUnique({ where: { id } })
        if (!discussion) throw notFound('Discussion')
        await assertCourseAccess(req.user, discussion.courseId)

        const answer = await prisma.answer.create({
            data: { discussionId: id, userId: req.user.id, content: req.body.content },
            include: { user: author, votes: { select: { userId: true } } },
        })
        if (discussion.userId !== req.user.id) {
            await notify({ userId: discussion.userId, type: 'answer', title: 'New answer', body: `${req.user.name} answered "${discussion.title}"`, link: `/learn/${discussion.courseId}?tab=discussion` })
        }
        const [shaped] = await withVotes([answer], req.user.id)
        res.status(201).json(shaped)
    })
)

// POST /api/discussions/answers/:answerId/vote  - toggles the caller's vote
router.post(
    '/answers/:answerId/vote',
    handle(async (req, res) => {
        const answerId = intParam(req.params.answerId, 'answer id')
        const answer = await prisma.answer.findUnique({ where: { id: answerId }, include: { discussion: { select: { courseId: true } } } })
        if (!answer) throw notFound('Answer')
        await assertCourseAccess(req.user, answer.discussion.courseId)
        if (answer.userId === req.user.id) throw forbidden('You cannot vote for your own answer')

        const key = { userId_answerId: { userId: req.user.id, answerId } }
        const existing = await prisma.answerVote.findUnique({ where: key })
        if (existing) await prisma.answerVote.delete({ where: key })
        else await prisma.answerVote.create({ data: { userId: req.user.id, answerId } })

        res.json({ voted: !existing, upvotes: await prisma.answerVote.count({ where: { answerId } }) })
    })
)

// POST /api/discussions/answers/:answerId/accept  - question author or the instructor
router.post(
    '/answers/:answerId/accept',
    handle(async (req, res) => {
        const answerId = intParam(req.params.answerId, 'answer id')
        const answer = await prisma.answer.findUnique({ where: { id: answerId }, include: { discussion: { include: { course: { select: { instructorId: true } } } } } })
        if (!answer) throw notFound('Answer')

        const { discussion } = answer
        const allowed = discussion.userId === req.user.id || discussion.course.instructorId === req.user.id || req.user.role === 'ADMIN'
        if (!allowed) throw forbidden('Only the question author or the instructor can accept an answer')

        const accepted = !answer.accepted
        await prisma.$transaction([
            prisma.answer.updateMany({ where: { discussionId: discussion.id }, data: { accepted: false } }),
            ...(accepted ? [prisma.answer.update({ where: { id: answerId }, data: { accepted: true } })] : []),
        ])
        if (accepted && answer.userId !== req.user.id) {
            await notify({ userId: answer.userId, type: 'answer', title: 'Answer accepted', body: `Your answer to "${discussion.title}" was accepted`, link: `/learn/${discussion.courseId}?tab=discussion` })
        }
        res.json({ accepted })
    })
)

// DELETE /api/discussions/:id  - author, instructor or admin
router.delete(
    '/:id',
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        const discussion = await prisma.discussion.findUnique({ where: { id }, include: { course: { select: { instructorId: true } } } })
        if (!discussion) throw notFound('Discussion')
        if (discussion.userId !== req.user.id && discussion.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') throw forbidden()
        await prisma.discussion.delete({ where: { id } })
        res.json({ message: 'Discussion deleted' })
    })
)

export default router
