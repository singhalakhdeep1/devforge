import { Router } from 'express'
import { AppError, TOPICS, asyncHandler, createEventBus, createLogger, internalOnly, redisHealthy, startService } from '@devhub/shared'
import boards from './boards'
import { prisma } from './db'
import { boardAccess, bus } from './lib'
import tasks from './tasks'

const log = createLogger('kanban')
const GROUP = 'kanban-service'

async function startConsumers() {
  const upsert = async ({ data }: { data: { id: string; name: string; avatar?: string | null } }) => {
    await prisma.userRef.upsert({ where: { id: data.id }, update: { name: data.name, avatar: data.avatar ?? null }, create: { id: data.id, name: data.name, avatar: data.avatar ?? null } })
  }
  await bus.subscribe(TOPICS.userRegistered, GROUP, upsert)
  await bus.subscribe(TOPICS.userUpdated, GROUP, upsert)

  // A deleted account: its cards become unassigned and its personal records go; shared work stays
  await bus.subscribe(TOPICS.userDeleted, GROUP, async ({ data }) => {
    const id: string = data.id
    await Promise.all([
      prisma.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
      prisma.taskWatcher.deleteMany({ where: { userId: id } }),
      prisma.timeEntry.deleteMany({ where: { userId: id } }),
      prisma.userRef.deleteMany({ where: { id } }),
    ])
  })

  // A deleted project takes its boards with it
  await bus.subscribe(TOPICS.projectChanged, GROUP, async ({ data }) => {
    if (data.action === 'deleted') await prisma.board.deleteMany({ where: { projectId: data.id } })
  })
  log.logInformation('kanban consumers started')
}

/** For the websocket-server: may this user subscribe to a board's live updates? */
const internal = Router()
internal.use(internalOnly)
internal.get('/boards/:id/access/:userId', asyncHandler(async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw AppError.notFound('Board not found')
  const board = await prisma.board.findUnique({ where: { id: req.params.id } })
  if (!board) throw AppError.notFound('Board not found')
  const a = await boardAccess(board, req.params.userId === 'anonymous' ? undefined : req.params.userId)
  res.json({ canRead: a.read, canWrite: a.write, canAdmin: a.admin })
}))

internal.get('/stats', asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30))
  const since = new Date(Date.now() - days * 86_400_000)
  const [boards, byStatus, created, completed, overdue, hours, perDayCreated, perDayDone, sprints] = await Promise.all([
    prisma.board.count({ where: { archived: false } }),
    prisma.task.groupBy({ by: ['status'], _count: true }),
    prisma.task.count({ where: { createdAt: { gte: since } } }),
    prisma.task.count({ where: { completedAt: { gte: since } } }),
    prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { not: 'DONE' } } }),
    prisma.timeEntry.aggregate({ where: { date: { gte: since } }, _sum: { hours: true } }),
    prisma.$queryRaw<{ day: Date; n: bigint }[]>`SELECT date_trunc('day', "createdAt") AS day, count(*) AS n FROM "Task" WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<{ day: Date; n: bigint }[]>`SELECT date_trunc('day', "completedAt") AS day, count(*) AS n FROM "Task" WHERE "completedAt" >= ${since} GROUP BY 1 ORDER BY 1`,
    prisma.sprint.count({ where: { status: 'COMPLETED', completedAt: { gte: since } } }),
  ])
  res.json({
    days, boards, tasksByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])), created, completed, overdue, hoursLogged: Number((hours._sum.hours ?? 0).toFixed(1)), sprintsCompleted: sprints,
    createdPerDay: perDayCreated.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.n) })),
    completedPerDay: perDayDone.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.n) })),
  })
}))

void startService({
  name: 'kanban',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/boards', boards)
    app.use('/api/tasks', tasks)
    app.use('/internal', internal)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
  onStart: () => startConsumers(),
  onStop: async () => {
    await createEventBus('kanban').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('kanban-service failed to start', e)
  process.exit(1)
})
