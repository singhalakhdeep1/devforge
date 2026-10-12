import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, attachUser, authenticate, createServiceClient, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import type { Prisma, Task } from './generated/client'
import { ensureRef, live, loadBoard, logActivity, notify, orderAt, projectMembers, refs, renumberTasks, taskChanged } from './lib'

const router = Router()
const files = createServiceClient('file')
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!
const uid = (req: Parameters<typeof userOf>[0]) => userOf(req)?.id

const type = z.enum(['TASK', 'STORY', 'BUG', 'SUBTASK'])
const priority = z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'])

const createSchema = z.object({
  boardId: z.string().uuid(),
  columnId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(20_000).optional(),
  type: type.default('TASK'),
  priority: priority.default('MEDIUM'),
  assigneeId: z.string().min(1).max(64).nullable().optional(),
  sprintId: z.string().uuid().nullable().optional(),
  epicId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  points: z.number().int().min(0).max(100).nullable().optional(),
  estimatedHours: z.number().min(0).max(1000).nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  labelIds: z.array(z.string().uuid()).max(10).optional(),
})
const updateSchema = createSchema.omit({ boardId: true, columnId: true, parentId: true }).partial()

async function loadTask(id: string, userId: string | undefined, need: 'read' | 'write') {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw AppError.notFound('Task not found')
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw AppError.notFound('Task not found')
  const { board, access } = await loadBoard(task.boardId, userId, need)
  return { task, board, access }
}

/** Everything that must belong to the same board as the task it is attached to. */
async function checkRefs(boardId: string, projectId: string, d: { assigneeId?: string | null; sprintId?: string | null; epicId?: string | null; parentId?: string | null; labelIds?: string[] }) {
  if (d.assigneeId && !(await projectMembers(projectId)).has(d.assigneeId)) throw AppError.badRequest('The assignee must be a member of the project')
  if (d.sprintId) {
    const s = await prisma.sprint.findFirst({ where: { id: d.sprintId, boardId } })
    if (!s) throw AppError.badRequest('That sprint is not on this board')
    if (s.status === 'COMPLETED') throw AppError.badRequest('That sprint is already completed')
  }
  if (d.epicId && !(await prisma.epic.findFirst({ where: { id: d.epicId, boardId } }))) throw AppError.badRequest('That epic is not on this board')
  if (d.parentId) {
    const p = await prisma.task.findFirst({ where: { id: d.parentId, boardId } })
    if (!p) throw AppError.badRequest('The parent task is not on this board')
    if (p.parentId) throw AppError.badRequest('Subtasks can only be one level deep')
  }
  if (d.labelIds?.length) {
    const n = await prisma.label.count({ where: { id: { in: d.labelIds }, boardId } })
    if (n !== new Set(d.labelIds).size) throw AppError.badRequest('A label does not belong to this board')
  }
}

const link = (boardId: string, taskId: string) => `/boards/${boardId}?task=${taskId}`

/* ───────────── create / read / update / delete ───────────── */

router.post(
  '/',
  authenticate,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const b = req.body as z.infer<typeof createSchema>
    const { board } = await loadBoard(b.boardId, user.id, 'write')
    const column = await prisma.column.findFirst({ where: { id: b.columnId, boardId: board.id } })
    if (!column) throw AppError.badRequest('That column is not on this board')
    await checkRefs(board.id, board.projectId, b)
    await ensureRef(user)

    const task = await prisma.$transaction(async (tx) => {
      // atomic: two people creating a card at once get different numbers
      const { lastNumber, keyPrefix } = await tx.board.update({ where: { id: board.id }, data: { lastNumber: { increment: 1 } }, select: { lastNumber: true, keyPrefix: true } })
      const last = await tx.task.findFirst({ where: { columnId: column.id }, orderBy: { order: 'desc' }, select: { order: true } })
      const { labelIds, ...data } = b
      const created = await tx.task.create({
        data: {
          ...data,
          type: data.parentId ? 'SUBTASK' : data.type,
          number: lastNumber,
          key: `${keyPrefix}-${lastNumber}`,
          reporterId: user.id,
          status: column.status,
          completedAt: column.status === 'DONE' ? new Date() : null,
          order: (last?.order ?? 0) + 1,
          labels: labelIds?.length ? { create: labelIds.map((labelId) => ({ labelId })) } : undefined,
          watchers: { create: [...new Set([user.id, ...(data.assigneeId ? [data.assigneeId] : [])])].map((userId) => ({ userId })) },
        },
        include: { labels: { include: { label: true } } },
      })
      return created
    })
    await logActivity(board.id, user.id, 'task.created', task.id, { key: task.key, title: task.title })
    live(board.id, 'task:created', { id: task.id, columnId: task.columnId, key: task.key })
    taskChanged(board.id, task.id, 'created', user.id, { assigneeId: task.assigneeId })
    if (task.assigneeId && task.assigneeId !== user.id) notify(task.assigneeId, 'Task assigned to you', `${user.name ?? 'Someone'} assigned ${task.key}: ${task.title}`, link(board.id, task.id))
    res.status(201).json(task)
  })
)

router.get(
  '/:id',
  attachUser,
  asyncHandler(async (req, res) => {
    const viewer = uid(req)
    const { task, access } = await loadTask(req.params.id, viewer, 'read')
    const full = await prisma.task.findUniqueOrThrow({
      where: { id: task.id },
      include: {
        labels: { include: { label: true } },
        column: { select: { id: true, name: true, status: true } },
        sprint: { select: { id: true, name: true, status: true } },
        epic: { select: { id: true, name: true, color: true } },
        parent: { select: { id: true, key: true, title: true } },
        subtasks: { orderBy: { order: 'asc' }, select: { id: true, key: true, title: true, status: true, assigneeId: true } },
        comments: { orderBy: { createdAt: 'asc' }, take: 200 },
        attachments: { orderBy: { createdAt: 'desc' } },
        timeEntries: { orderBy: { date: 'desc' }, take: 100 },
        watchers: true,
      },
    })
    const acts = await prisma.activity.findMany({ where: { taskId: task.id }, orderBy: { createdAt: 'desc' }, take: 30 })
    const people = await refs([full.assigneeId, full.reporterId, ...full.comments.map((c) => c.userId), ...full.timeEntries.map((t) => t.userId), ...full.subtasks.map((s) => s.assigneeId), ...acts.map((a) => a.userId)])
    res.json({
      ...full,
      labels: full.labels.map((l) => l.label),
      assignee: full.assigneeId ? people.get(full.assigneeId) : null,
      reporter: people.get(full.reporterId),
      subtasks: full.subtasks.map((s) => ({ ...s, assignee: s.assigneeId ? people.get(s.assigneeId) : null })),
      comments: full.comments.map((c) => ({ id: c.id, content: c.content, mentions: c.mentions, edited: c.edited, createdAt: c.createdAt, author: people.get(c.userId), mine: c.userId === viewer })),
      timeEntries: full.timeEntries.map((t) => ({ id: t.id, hours: t.hours, description: t.description, date: t.date, user: people.get(t.userId), mine: t.userId === viewer })),
      loggedHours: Number(full.timeEntries.reduce((n, t) => n + t.hours, 0).toFixed(2)),
      watching: Boolean(viewer && full.watchers.some((w) => w.userId === viewer)),
      watchers: full.watchers.length,
      activity: acts.map((a) => ({ id: a.id, action: a.action, detail: a.detail, user: people.get(a.userId), createdAt: a.createdAt })),
      access,
    })
  })
)

router.patch(
  '/:id',
  authenticate,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board } = await loadTask(req.params.id, user.id, 'write')
    const { labelIds, ...b } = req.body as z.infer<typeof updateSchema>
    await checkRefs(board.id, board.projectId, { ...b, labelIds })

    const changes: Record<string, { from: unknown; to: unknown }> = {}
    for (const [k, v] of Object.entries(b)) {
      const before = (task as Record<string, unknown>)[k]
      const same = before instanceof Date && v instanceof Date ? before.getTime() === v.getTime() : before === v
      if (v !== undefined && !same) changes[k] = { from: before ?? null, to: v ?? null }
    }
    const updated = await prisma.$transaction(async (tx) => {
      if (labelIds) {
        await tx.taskLabel.deleteMany({ where: { taskId: task.id } })
        if (labelIds.length) await tx.taskLabel.createMany({ data: labelIds.map((labelId) => ({ taskId: task.id, labelId })) })
      }
      if (b.assigneeId) await tx.taskWatcher.createMany({ data: [{ taskId: task.id, userId: b.assigneeId }], skipDuplicates: true })
      return tx.task.update({ where: { id: task.id }, data: b as Prisma.TaskUncheckedUpdateInput, include: { labels: { include: { label: true } } } })
    })
    if (Object.keys(changes).length) await logActivity(board.id, user.id, 'task.updated', task.id, { changes })
    live(board.id, 'task:updated', { id: task.id, changed: Object.keys(changes) })
    taskChanged(board.id, task.id, 'updated', user.id, { changed: Object.keys(changes) })
    if (changes.assigneeId && updated.assigneeId && updated.assigneeId !== user.id) notify(updated.assigneeId, 'Task assigned to you', `${user.name ?? 'Someone'} assigned ${task.key}: ${task.title}`, link(board.id, task.id))
    res.json({ ...updated, labels: updated.labels.map((l) => l.label) })
  })
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board } = await loadTask(req.params.id, user.id, 'write')
    await prisma.task.delete({ where: { id: task.id } })
    await logActivity(board.id, user.id, 'task.deleted', undefined, { key: task.key, title: task.title })
    live(board.id, 'task:deleted', { id: task.id, columnId: task.columnId })
    taskChanged(board.id, task.id, 'deleted', user.id)
    res.json({ message: 'Task deleted' })
  })
)

/* ───────────── moving cards ───────────── */

router.post(
  '/:id/move',
  authenticate,
  validate(z.object({ columnId: z.string().uuid(), index: z.number().int().min(0).optional(), force: z.boolean().default(false) })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board, access } = await loadTask(req.params.id, user.id, 'write')
    const dest = await prisma.column.findFirst({ where: { id: req.body.columnId, boardId: board.id } })
    if (!dest) throw AppError.badRequest('That column is not on this board')

    const result = await prisma.$transaction(async (tx) => {
      const siblings = await tx.task.findMany({ where: { columnId: dest.id, id: { not: task.id } }, orderBy: { order: 'asc' }, select: { id: true, order: true } })
      if (dest.wipLimit !== null && task.columnId !== dest.id && siblings.length >= dest.wipLimit) {
        if (!(req.body.force && access.admin)) throw new AppError(409, `"${dest.name}" is at its work-in-progress limit (${dest.wipLimit})`, 'WIP_LIMIT')
      }
      const index = req.body.index ?? siblings.length
      let order = orderAt(siblings, index)
      if (order === null) {
        await tx.task.update({ where: { id: task.id }, data: { columnId: dest.id } }) // so it is included in the renumbering
        await renumberTasks(tx, dest.id)
        const again = await tx.task.findMany({ where: { columnId: dest.id, id: { not: task.id } }, orderBy: { order: 'asc' }, select: { id: true, order: true } })
        order = orderAt(again, index) ?? again.length + 1
      }
      const becameDone = dest.status === 'DONE' && task.status !== 'DONE'
      const reopened = dest.status !== 'DONE' && task.status === 'DONE'
      return tx.task.update({
        where: { id: task.id },
        data: { columnId: dest.id, order, status: dest.status, ...(becameDone ? { completedAt: new Date() } : reopened ? { completedAt: null } : {}) },
      })
    })

    if (task.columnId !== dest.id) {
      const from = await prisma.column.findUnique({ where: { id: task.columnId }, select: { name: true } })
      await logActivity(board.id, user.id, 'task.moved', task.id, { from: from?.name, to: dest.name })
      taskChanged(board.id, task.id, 'moved', user.id, { to: dest.name, status: dest.status })
      if (dest.status === 'DONE' && task.assigneeId && task.assigneeId !== user.id) notify(task.assigneeId, 'Task completed', `${task.key} was moved to ${dest.name}`, link(board.id, task.id))
    }
    live(board.id, 'task:moved', { id: task.id, from: task.columnId, columnId: dest.id, order: result.order, status: result.status, by: user.id })
    res.json({ id: result.id, columnId: result.columnId, order: result.order, status: result.status })
  })
)

/* ───────────── labels, watching ───────────── */

router.post(
  '/:id/labels/:labelId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { task, board } = await loadTask(req.params.id, me(req).id, 'write')
    if (!(await prisma.label.findFirst({ where: { id: req.params.labelId, boardId: board.id } }))) throw AppError.badRequest('That label is not on this board')
    await prisma.taskLabel.createMany({ data: [{ taskId: task.id, labelId: req.params.labelId }], skipDuplicates: true })
    live(board.id, 'task:updated', { id: task.id, changed: ['labels'] })
    res.json({ message: 'Label added' })
  })
)

router.delete(
  '/:id/labels/:labelId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { task, board } = await loadTask(req.params.id, me(req).id, 'write')
    await prisma.taskLabel.deleteMany({ where: { taskId: task.id, labelId: req.params.labelId } })
    live(board.id, 'task:updated', { id: task.id, changed: ['labels'] })
    res.json({ message: 'Label removed' })
  })
)

router.post('/:id/watch', authenticate, asyncHandler(async (req, res) => {
  const { task } = await loadTask(req.params.id, me(req).id, 'read')
  await prisma.taskWatcher.createMany({ data: [{ taskId: task.id, userId: me(req).id }], skipDuplicates: true })
  res.json({ watching: true })
}))
router.delete('/:id/watch', authenticate, asyncHandler(async (req, res) => {
  const { task } = await loadTask(req.params.id, me(req).id, 'read')
  await prisma.taskWatcher.deleteMany({ where: { taskId: task.id, userId: me(req).id } })
  res.json({ watching: false })
}))

/* ───────────── comments ───────────── */

router.post(
  '/:id/comments',
  authenticate,
  validate(z.object({ content: z.string().trim().min(1).max(5000), mentions: z.array(z.string().max(64)).max(10).default([]) })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board } = await loadTask(req.params.id, user.id, 'write')
    const members = await projectMembers(board.projectId)
    const mentions = [...new Set<string>(req.body.mentions)].filter((m) => members.has(m))
    await ensureRef(user)
    const c = await prisma.comment.create({ data: { taskId: task.id, userId: user.id, content: req.body.content, mentions } })
    await prisma.taskWatcher.createMany({ data: [{ taskId: task.id, userId: user.id }], skipDuplicates: true })
    await logActivity(board.id, user.id, 'comment.added', task.id, { commentId: c.id })
    const watchers = (await prisma.taskWatcher.findMany({ where: { taskId: task.id } })).map((w) => w.userId)
    for (const target of new Set([...mentions, ...watchers])) {
      if (target === user.id) continue
      const mentioned = mentions.includes(target)
      notify(target, mentioned ? 'You were mentioned' : 'New comment', `${user.name ?? 'Someone'} ${mentioned ? 'mentioned you on' : 'commented on'} ${task.key}: ${task.title}`, link(board.id, task.id))
    }
    live(board.id, 'comment:added', { taskId: task.id, id: c.id, by: user.id })
    res.status(201).json({ id: c.id, content: c.content, mentions, createdAt: c.createdAt })
  })
)

router.patch(
  '/:id/comments/:commentId',
  authenticate,
  validate(z.object({ content: z.string().trim().min(1).max(5000) })),
  asyncHandler(async (req, res) => {
    const { task, board } = await loadTask(req.params.id, me(req).id, 'write')
    const r = await prisma.comment.updateMany({ where: { id: req.params.commentId, taskId: task.id, userId: me(req).id }, data: { content: req.body.content, edited: true } })
    if (r.count === 0) throw AppError.notFound('Comment not found')
    live(board.id, 'comment:updated', { taskId: task.id, id: req.params.commentId })
    res.json({ message: 'Comment updated' })
  })
)

router.delete(
  '/:id/comments/:commentId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board, access } = await loadTask(req.params.id, user.id, 'write')
    const c = await prisma.comment.findFirst({ where: { id: req.params.commentId, taskId: task.id } })
    if (!c) throw AppError.notFound('Comment not found')
    if (c.userId !== user.id && !access.admin) throw AppError.forbidden('You can only delete your own comments')
    await prisma.comment.delete({ where: { id: c.id } })
    live(board.id, 'comment:deleted', { taskId: task.id, id: c.id })
    res.json({ message: 'Comment deleted' })
  })
)

/* ───────────── time tracking ───────────── */

router.post(
  '/:id/time',
  authenticate,
  validate(z.object({ hours: z.number().min(0.1).max(24), description: z.string().trim().max(300).optional(), date: z.coerce.date().optional() })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board } = await loadTask(req.params.id, user.id, 'write')
    const date = req.body.date ?? new Date()
    if (date.getTime() > Date.now() + 86_400_000) throw AppError.badRequest('Time cannot be logged in the future')
    const day = new Date(date); day.setUTCHours(0, 0, 0, 0)
    const total = await prisma.timeEntry.aggregate({ where: { userId: user.id, date: { gte: day, lt: new Date(day.getTime() + 86_400_000) } }, _sum: { hours: true } })
    if ((total._sum.hours ?? 0) + req.body.hours > 24) throw AppError.badRequest('That would be more than 24 hours logged in one day')
    await ensureRef(user)
    const entry = await prisma.timeEntry.create({ data: { taskId: task.id, userId: user.id, hours: req.body.hours, description: req.body.description, date } })
    await logActivity(board.id, user.id, 'time.logged', task.id, { hours: entry.hours })
    live(board.id, 'task:updated', { id: task.id, changed: ['time'] })
    res.status(201).json(entry)
  })
)

router.delete(
  '/:id/time/:entryId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { task } = await loadTask(req.params.id, me(req).id, 'write')
    const r = await prisma.timeEntry.deleteMany({ where: { id: req.params.entryId, taskId: task.id, userId: me(req).id } })
    if (r.count === 0) throw AppError.notFound('Time entry not found')
    res.json({ message: 'Time entry deleted' })
  })
)

/* ───────────── attachments (bytes live in the file-service) ───────────── */

router.post(
  '/:id/attachments',
  authenticate,
  validate(z.object({ fileId: z.string().uuid() })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board } = await loadTask(req.params.id, user.id, 'write')
    const meta = await files.get<{ id: string; ownerId: string; name: string; mimeType: string; size: number }>(`/internal/files/${req.body.fileId}`)
    if (meta.ownerId !== user.id) throw AppError.forbidden('You can only attach files you uploaded')
    const a = await prisma.attachment.upsert({
      where: { taskId_fileId: { taskId: task.id, fileId: meta.id } },
      update: {},
      create: { taskId: task.id, fileId: meta.id, name: meta.name, mimeType: meta.mimeType, size: meta.size, addedBy: user.id },
    })
    await logActivity(board.id, user.id, 'attachment.added', task.id, { name: meta.name })
    live(board.id, 'task:updated', { id: task.id, changed: ['attachments'] })
    res.status(201).json(a)
  })
)

router.delete(
  '/:id/attachments/:attachmentId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { task, board, access } = await loadTask(req.params.id, user.id, 'write')
    const a = await prisma.attachment.findFirst({ where: { id: req.params.attachmentId, taskId: task.id } })
    if (!a) throw AppError.notFound('Attachment not found')
    if (a.addedBy !== user.id && !access.admin) throw AppError.forbidden('Only the person who attached it, or an admin, can remove it')
    await prisma.attachment.delete({ where: { id: a.id } })
    live(board.id, 'task:updated', { id: task.id, changed: ['attachments'] })
    res.json({ message: 'Attachment removed' })
  })
)

export type { Task }
export default router
