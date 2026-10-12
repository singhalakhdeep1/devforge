import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, authenticate, attachUser, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import type { Prisma } from './generated/client'
import { boardAccess, ensureRef, initialsPrefix, live, loadBoard, logActivity, notify, projectAccess, projectMembers, refs, renumberColumns } from './lib'

const router = Router()
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!
const uid = (req: Parameters<typeof userOf>[0]) => userOf(req)?.id

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #3b82f6')
const status = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])

/* ───────────── boards ───────────── */

router.get(
  '/',
  attachUser,
  asyncHandler(async (req, res) => {
    const projectId = String(req.query.projectId ?? '')
    if (!/^[0-9a-f-]{36}$/i.test(projectId)) throw AppError.badRequest('projectId is required')
    const access = await projectAccess(projectId, uid(req)).catch(() => null)
    if (!access) throw AppError.notFound('Project not found')
    const boards = await prisma.board.findMany({
      where: { projectId, archived: false },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    })
    const visible = boards.filter((b) => access.role !== null || (b.visibility === 'PUBLIC' && access.canRead))
    res.json({ canCreate: access.canAdmin, boards: visible.map((b) => ({ id: b.id, name: b.name, description: b.description, visibility: b.visibility, keyPrefix: b.keyPrefix, tasks: b._count.tasks, updatedAt: b.updatedAt })) })
  })
)

router.post(
  '/',
  authenticate,
  validate(z.object({
    projectId: z.string().uuid(),
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500).optional(),
    visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
    keyPrefix: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9]{1,4}$/, '2 to 5 letters or digits, starting with a letter').optional(),
  })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const access = await projectAccess(req.body.projectId, user.id).catch(() => null)
    if (!access || access.role === null) throw AppError.notFound('Project not found')
    if (!access.canAdmin) throw AppError.forbidden('Only project admins can create boards')
    if ((await prisma.board.count({ where: { projectId: access.projectId, archived: false } })) >= 20) throw AppError.badRequest('A project can have up to 20 boards')
    await ensureRef(user)
    const board = await prisma.board.create({
      data: {
        projectId: access.projectId,
        name: req.body.name,
        description: req.body.description,
        visibility: req.body.visibility,
        keyPrefix: req.body.keyPrefix ?? initialsPrefix(access.name),
        createdBy: user.id,
        columns: {
          create: [
            { name: 'To do', order: 1, color: '#6b7280', status: 'TODO' },
            { name: 'In progress', order: 2, color: '#3b82f6', status: 'IN_PROGRESS' },
            { name: 'In review', order: 3, color: '#f59e0b', status: 'IN_REVIEW' },
            { name: 'Done', order: 4, color: '#10b981', status: 'DONE' },
          ],
        },
      },
      include: { columns: { orderBy: { order: 'asc' } } },
    })
    await logActivity(board.id, user.id, 'board.created', undefined, { name: board.name })
    res.status(201).json(board)
  })
)

const filterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  assignee: z.string().max(40).optional(), // a user id, "me" or "none"
  label: z.string().uuid().optional(),
  sprint: z.string().max(40).optional(), // "active", "backlog" or a sprint id
  epic: z.string().uuid().optional(),
  type: z.enum(['TASK', 'STORY', 'BUG', 'SUBTASK']).optional(),
  priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).optional(),
})

router.get(
  '/:id',
  attachUser,
  validate(filterSchema, 'query'),
  asyncHandler(async (req, res) => {
    const viewer = uid(req)
    const { board, access } = await loadBoard(req.params.id, viewer, 'read')
    const f = req.query as z.infer<typeof filterSchema>

    const where: Prisma.TaskWhereInput = { boardId: board.id }
    if (f.q) where.OR = [{ title: { contains: f.q, mode: 'insensitive' } }, { key: { contains: f.q, mode: 'insensitive' } }, { description: { contains: f.q, mode: 'insensitive' } }]
    if (f.assignee) where.assigneeId = f.assignee === 'me' ? viewer : f.assignee === 'none' ? null : f.assignee
    if (f.label) where.labels = { some: { labelId: f.label } }
    if (f.epic) where.epicId = f.epic
    if (f.type) where.type = f.type
    if (f.priority) where.priority = f.priority
    if (f.sprint === 'backlog') where.sprintId = null
    else if (f.sprint === 'active') where.sprint = { status: 'ACTIVE' }
    else if (f.sprint) where.sprintId = f.sprint

    const [columns, tasks, labels, epics, sprints, memberIds] = await Promise.all([
      prisma.column.findMany({ where: { boardId: board.id }, orderBy: { order: 'asc' } }),
      prisma.task.findMany({
        where,
        orderBy: { order: 'asc' },
        include: { labels: { include: { label: true } }, _count: { select: { comments: true, attachments: true, subtasks: true } }, subtasks: { select: { status: true } } },
      }),
      prisma.label.findMany({ where: { boardId: board.id }, orderBy: { name: 'asc' } }),
      prisma.epic.findMany({ where: { boardId: board.id }, orderBy: { createdAt: 'asc' } }),
      prisma.sprint.findMany({ where: { boardId: board.id }, orderBy: { startDate: 'desc' }, take: 20 }),
      projectMembers(board.projectId).catch(() => new Set<string>()),
    ])
    const people = await refs([...memberIds, ...tasks.map((t) => t.assigneeId)])
    const counts = new Map<string, number>()
    for (const t of tasks) counts.set(t.columnId, (counts.get(t.columnId) ?? 0) + 1)
    const allCounts = await prisma.task.groupBy({ by: ['columnId'], where: { boardId: board.id }, _count: true })

    res.json({
      id: board.id, projectId: board.projectId, name: board.name, description: board.description, keyPrefix: board.keyPrefix, visibility: board.visibility, access,
      columns: columns.map((c) => ({ ...c, count: allCounts.find((x) => x.columnId === c.id)?._count ?? 0 })),
      labels, epics, sprints,
      activeSprint: sprints.find((s) => s.status === 'ACTIVE') ?? null,
      people: [...memberIds].map((id) => people.get(id)!),
      tasks: tasks.map((t) => ({
        id: t.id, key: t.key, title: t.title, type: t.type, priority: t.priority, status: t.status, points: t.points, columnId: t.columnId, order: t.order,
        sprintId: t.sprintId, epicId: t.epicId, parentId: t.parentId, dueDate: t.dueDate, assignee: t.assigneeId ? people.get(t.assigneeId) : null,
        labels: t.labels.map((l) => l.label), comments: t._count.comments, attachments: t._count.attachments, subtasks: t._count.subtasks, subtasksDone: t.subtasks.filter((s) => s.status === 'DONE').length,
        overdue: Boolean(t.dueDate && t.dueDate < new Date() && t.status !== 'DONE'),
      })),
    })
  })
)

router.patch(
  '/:id',
  authenticate,
  validate(z.object({ name: z.string().trim().min(1).max(80).optional(), description: z.string().trim().max(500).nullable().optional(), visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(), archived: z.boolean().optional() })),
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'admin')
    const updated = await prisma.board.update({ where: { id: board.id }, data: req.body })
    live(board.id, 'board:updated', { name: updated.name, description: updated.description, visibility: updated.visibility })
    res.json(updated)
  })
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'admin')
    await prisma.board.delete({ where: { id: board.id } })
    live(board.id, 'board:deleted', { id: board.id })
    res.json({ message: 'Board deleted' })
  })
)

router.get(
  '/:id/activity',
  attachUser,
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, uid(req), 'read')
    const rows = await prisma.activity.findMany({ where: { boardId: board.id }, orderBy: { createdAt: 'desc' }, take: Math.min(100, Number(req.query.limit) || 40) })
    const people = await refs(rows.map((r) => r.userId))
    res.json(rows.map((r) => ({ id: r.id, action: r.action, taskId: r.taskId, detail: r.detail, user: people.get(r.userId), createdAt: r.createdAt })))
  })
)

/* ───────────── columns ───────────── */

router.post(
  '/:id/columns',
  authenticate,
  validate(z.object({ name: z.string().trim().min(1).max(40), color: color.optional(), status: status.default('IN_PROGRESS'), wipLimit: z.number().int().min(1).max(500).nullable().optional() })),
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'admin')
    if ((await prisma.column.count({ where: { boardId: board.id } })) >= 12) throw AppError.badRequest('A board can have up to 12 columns')
    const last = await prisma.column.findFirst({ where: { boardId: board.id }, orderBy: { order: 'desc' }, select: { order: true } })
    const col = await prisma.column.create({ data: { ...req.body, boardId: board.id, order: (last?.order ?? 0) + 1 } })
    live(board.id, 'column:created', col)
    res.status(201).json(col)
  })
)

router.post(
  '/:id/columns/reorder',
  authenticate,
  validate(z.object({ ids: z.array(z.string().uuid()).min(1) })),
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'admin')
    const existing = await prisma.column.findMany({ where: { boardId: board.id }, select: { id: true } })
    const ids: string[] = req.body.ids
    if (ids.length !== existing.length || !existing.every((c) => ids.includes(c.id))) throw AppError.badRequest('Send every column of the board exactly once')
    await prisma.$transaction(ids.map((id, i) => prisma.column.update({ where: { id }, data: { order: i + 1 } })))
    live(board.id, 'columns:reordered', { ids })
    res.json({ ids })
  })
)

async function loadColumn(id: string, userId: string) {
  const col = await prisma.column.findUnique({ where: { id }, include: { board: true } }).catch(() => null)
  if (!col) throw AppError.notFound('Column not found')
  await loadBoard(col.boardId, userId, 'admin')
  return col
}

router.patch(
  '/columns/:columnId',
  authenticate,
  validate(z.object({ name: z.string().trim().min(1).max(40).optional(), color: color.optional(), status: status.optional(), wipLimit: z.number().int().min(1).max(500).nullable().optional() })),
  asyncHandler(async (req, res) => {
    const col = await loadColumn(req.params.columnId, me(req).id)
    const updated = await prisma.column.update({ where: { id: col.id }, data: req.body })
    live(col.boardId, 'column:updated', updated)
    res.json(updated)
  })
)

router.delete(
  '/columns/:columnId',
  authenticate,
  validate(z.object({ moveTo: z.string().uuid().optional() }).passthrough()),
  asyncHandler(async (req, res) => {
    const col = await loadColumn(req.params.columnId, me(req).id)
    const others = await prisma.column.findMany({ where: { boardId: col.boardId, id: { not: col.id } }, orderBy: { order: 'asc' } })
    if (others.length === 0) throw AppError.badRequest('A board needs at least one column')
    const target = req.body.moveTo ? others.find((c) => c.id === req.body.moveTo) : others[0]
    if (!target) throw AppError.badRequest('moveTo must be another column of this board')
    await prisma.$transaction(async (tx) => {
      const last = await tx.task.findFirst({ where: { columnId: target.id }, orderBy: { order: 'desc' }, select: { order: true } })
      const moving = await tx.task.findMany({ where: { columnId: col.id }, orderBy: { order: 'asc' }, select: { id: true } })
      let o = (last?.order ?? 0) + 1
      for (const t of moving) await tx.task.update({ where: { id: t.id }, data: { columnId: target.id, order: o++, status: target.status } })
      await tx.column.delete({ where: { id: col.id } })
      await renumberColumns(tx, col.boardId)
    })
    live(col.boardId, 'column:deleted', { id: col.id, movedTo: target.id })
    res.json({ message: 'Column deleted', movedTo: target.id })
  })
)

/* ───────────── labels and epics ───────────── */

router.post(
  '/:id/labels',
  authenticate,
  validate(z.object({ name: z.string().trim().min(1).max(30), color })),
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'write')
    try {
      const label = await prisma.label.create({ data: { ...req.body, boardId: board.id } })
      live(board.id, 'label:created', label)
      res.status(201).json(label)
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') throw AppError.conflict('A label with that name already exists')
      throw e
    }
  })
)

router.delete(
  '/labels/:labelId',
  authenticate,
  asyncHandler(async (req, res) => {
    const label = await prisma.label.findUnique({ where: { id: req.params.labelId } }).catch(() => null)
    if (!label) throw AppError.notFound('Label not found')
    await loadBoard(label.boardId, me(req).id, 'write')
    await prisma.label.delete({ where: { id: label.id } })
    live(label.boardId, 'label:deleted', { id: label.id })
    res.json({ message: 'Label deleted' })
  })
)

router.post(
  '/:id/epics',
  authenticate,
  validate(z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(500).optional(), color: color.optional() })),
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'write')
    const epic = await prisma.epic.create({ data: { ...req.body, boardId: board.id } })
    live(board.id, 'epic:created', epic)
    res.status(201).json(epic)
  })
)

router.get(
  '/:id/epics',
  attachUser,
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, uid(req), 'read')
    const epics = await prisma.epic.findMany({ where: { boardId: board.id }, orderBy: { createdAt: 'asc' } })
    const stats = await prisma.task.groupBy({ by: ['epicId', 'status'], where: { boardId: board.id, epicId: { not: null } }, _count: true })
    res.json(epics.map((e) => {
      const mine = stats.filter((s) => s.epicId === e.id)
      const total = mine.reduce((n, s) => n + s._count, 0)
      const done = mine.filter((s) => s.status === 'DONE').reduce((n, s) => n + s._count, 0)
      return { ...e, tasks: total, done, progress: total ? Math.round((done / total) * 100) : 0 }
    }))
  })
)

router.delete(
  '/epics/:epicId',
  authenticate,
  asyncHandler(async (req, res) => {
    const epic = await prisma.epic.findUnique({ where: { id: req.params.epicId } }).catch(() => null)
    if (!epic) throw AppError.notFound('Epic not found')
    await loadBoard(epic.boardId, me(req).id, 'write')
    await prisma.epic.delete({ where: { id: epic.id } })
    live(epic.boardId, 'epic:deleted', { id: epic.id })
    res.json({ message: 'Epic deleted' })
  })
)

/* ───────────── sprints ───────────── */

router.post(
  '/:id/sprints',
  authenticate,
  validate(z.object({ name: z.string().trim().min(1).max(80), goal: z.string().trim().max(300).optional(), startDate: z.coerce.date(), endDate: z.coerce.date() }).refine((s) => s.endDate > s.startDate, { message: 'endDate must be after startDate' })),
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, me(req).id, 'admin')
    const sprint = await prisma.sprint.create({ data: { ...req.body, boardId: board.id } })
    live(board.id, 'sprint:created', sprint)
    res.status(201).json(sprint)
  })
)

async function loadSprint(id: string, userId: string | undefined, need: 'read' | 'admin') {
  const sprint = await prisma.sprint.findUnique({ where: { id } }).catch(() => null)
  if (!sprint) throw AppError.notFound('Sprint not found')
  await loadBoard(sprint.boardId, userId, need)
  return sprint
}

router.post(
  '/sprints/:sprintId/start',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const sprint = await loadSprint(req.params.sprintId, user.id, 'admin')
    if (sprint.status !== 'PLANNED') throw AppError.conflict('Only a planned sprint can be started')
    if (await prisma.sprint.findFirst({ where: { boardId: sprint.boardId, status: 'ACTIVE' } })) throw AppError.conflict('Complete the active sprint before starting another')
    const pts = await prisma.task.aggregate({ where: { sprintId: sprint.id }, _sum: { points: true } })
    const started = await prisma.sprint.update({ where: { id: sprint.id }, data: { status: 'ACTIVE', startedAt: new Date(), committedPoints: pts._sum.points ?? 0 } })
    await logActivity(sprint.boardId, user.id, 'sprint.started', undefined, { name: sprint.name, committedPoints: started.committedPoints })
    live(sprint.boardId, 'sprint:started', started)
    res.json(started)
  })
)

router.post(
  '/sprints/:sprintId/complete',
  authenticate,
  validate(z.object({ moveIncompleteTo: z.union([z.literal('backlog'), z.string().uuid()]).default('backlog') })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const sprint = await loadSprint(req.params.sprintId, user.id, 'admin')
    if (sprint.status !== 'ACTIVE') throw AppError.conflict('Only the active sprint can be completed')
    const dest = req.body.moveIncompleteTo === 'backlog' ? null : await prisma.sprint.findFirst({ where: { id: req.body.moveIncompleteTo, boardId: sprint.boardId, status: 'PLANNED' } })
    if (req.body.moveIncompleteTo !== 'backlog' && !dest) throw AppError.badRequest('moveIncompleteTo must be "backlog" or a planned sprint on this board')
    const done = await prisma.task.aggregate({ where: { sprintId: sprint.id, status: 'DONE' }, _sum: { points: true } })
    const [moved, completed] = await prisma.$transaction([
      prisma.task.updateMany({ where: { sprintId: sprint.id, status: { not: 'DONE' } }, data: { sprintId: dest?.id ?? null } }),
      prisma.sprint.update({ where: { id: sprint.id }, data: { status: 'COMPLETED', completedAt: new Date(), completedPoints: done._sum.points ?? 0 } }),
    ])
    await logActivity(sprint.boardId, user.id, 'sprint.completed', undefined, { name: sprint.name, completedPoints: completed.completedPoints, movedTasks: moved.count })
    live(sprint.boardId, 'sprint:completed', completed)
    res.json({ ...completed, movedTasks: moved.count })
  })
)

router.get(
  '/sprints/:sprintId/burndown',
  attachUser,
  asyncHandler(async (req, res) => {
    const sprint = await loadSprint(req.params.sprintId, uid(req), 'read')
    const tasks = await prisma.task.findMany({ where: { sprintId: sprint.id }, select: { points: true, completedAt: true, status: true } })
    const total = sprint.committedPoints ?? tasks.reduce((n, t) => n + (t.points ?? 0), 0)
    const days = Math.max(1, Math.ceil((sprint.endDate.getTime() - sprint.startDate.getTime()) / 86_400_000))
    const series = []
    const now = Date.now()
    for (let i = 0; i <= days; i++) {
      const day = new Date(sprint.startDate.getTime() + i * 86_400_000)
      // the current day counts what is done so far; days that have not started yet have no actual value
      const cutoff = Math.min(day.getTime() + 86_400_000 - 1, now)
      const burned = tasks.filter((t) => t.completedAt && t.completedAt.getTime() <= cutoff).reduce((n, t) => n + (t.points ?? 0), 0)
      series.push({ day: day.toISOString().slice(0, 10), ideal: Number((total - (total / days) * i).toFixed(1)), remaining: day.getTime() > now ? null : total - burned })
    }
    res.json({ sprint: { id: sprint.id, name: sprint.name, status: sprint.status }, totalPoints: total, series, note: 'Scope added after the sprint started is not tracked separately.' })
  })
)

/* ───────────── analytics ───────────── */

router.get(
  '/:id/analytics',
  attachUser,
  asyncHandler(async (req, res) => {
    const { board } = await loadBoard(req.params.id, uid(req), 'read')
    const [byStatus, byPriority, byAssignee, columns, done, overdue, points, sprints] = await Promise.all([
      prisma.task.groupBy({ by: ['status'], where: { boardId: board.id }, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where: { boardId: board.id }, _count: true }),
      prisma.task.groupBy({ by: ['assigneeId', 'status'], where: { boardId: board.id }, _count: true }),
      prisma.column.findMany({ where: { boardId: board.id }, orderBy: { order: 'asc' }, include: { _count: { select: { tasks: true } } } }),
      prisma.task.findMany({ where: { boardId: board.id, completedAt: { not: null } }, select: { createdAt: true, completedAt: true }, orderBy: { completedAt: 'desc' }, take: 500 }),
      prisma.task.count({ where: { boardId: board.id, dueDate: { lt: new Date() }, status: { not: 'DONE' } } }),
      prisma.task.groupBy({ by: ['status'], where: { boardId: board.id }, _sum: { points: true } }),
      prisma.sprint.findMany({ where: { boardId: board.id, status: 'COMPLETED' }, orderBy: { completedAt: 'desc' }, take: 6, select: { name: true, committedPoints: true, completedPoints: true, completedAt: true } }),
    ])
    const cycleDays = done.map((t) => (t.completedAt!.getTime() - t.createdAt.getTime()) / 86_400_000)
    const throughput = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10)
      return { day, completed: done.filter((t) => t.completedAt!.toISOString().slice(0, 10) === day).length }
    })
    const people = await refs(byAssignee.map((a) => a.assigneeId))
    const workload = new Map<string, { open: number; done: number }>()
    for (const a of byAssignee) {
      const key = a.assigneeId ?? 'unassigned'
      const w = workload.get(key) ?? { open: 0, done: 0 }
      if (a.status === 'DONE') w.done += a._count
      else w.open += a._count
      workload.set(key, w)
    }
    res.json({
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      byPriority: Object.fromEntries(byPriority.map((s) => [s.priority, s._count])),
      columns: columns.map((c) => ({ id: c.id, name: c.name, tasks: c._count.tasks, wipLimit: c.wipLimit, overLimit: c.wipLimit !== null && c._count.tasks > c.wipLimit })),
      overdue,
      points: { total: points.reduce((n, p) => n + (p._sum.points ?? 0), 0), done: points.find((p) => p.status === 'DONE')?._sum.points ?? 0 },
      averageCycleDays: cycleDays.length ? Number((cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length).toFixed(1)) : null,
      throughput,
      workload: [...workload.entries()].map(([id, w]) => ({ user: id === 'unassigned' ? null : people.get(id), ...w })),
      velocity: sprints.reverse(),
    })
  })
)

export { boardAccess, notify }
export default router
