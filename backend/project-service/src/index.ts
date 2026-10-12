import { Router } from 'express'
import { AppError, TOPICS, asyncHandler, createEventBus, createLogger, internalOnly, redisHealthy, startService } from '@devhub/shared'
import { prisma } from './db'
import { atLeast, announce, bus, roleOn } from './lib'
import projects from './projects'
import social from './social'
import teams from './teams'

const log = createLogger('project')
const GROUP = 'project-service'

async function startConsumers() {
  // people: keep display names and avatars current
  const upsert = async ({ data }: { data: { id: string; name: string; avatar?: string | null } }) => {
    await prisma.userRef.upsert({ where: { id: data.id }, update: { name: data.name, avatar: data.avatar ?? null }, create: { id: data.id, name: data.name, avatar: data.avatar ?? null } })
  }
  await bus.subscribe(TOPICS.userRegistered, GROUP, upsert)
  await bus.subscribe(TOPICS.userUpdated, GROUP, upsert)

  // a deleted account takes its personal data with it; shared work is handed to the next person or removed
  await bus.subscribe(TOPICS.userDeleted, GROUP, async ({ data }) => {
    const id: string = data.id
    const owned = await prisma.project.findMany({ where: { ownerId: id }, include: { members: true } })
    for (const p of owned) {
      const heir = p.members.find((m) => m.role === 'ADMIN') ?? p.members.find((m) => m.role === 'MEMBER')
      if (heir) {
        await prisma.$transaction([
          prisma.project.update({ where: { id: p.id }, data: { ownerId: heir.userId } }),
          prisma.projectMember.delete({ where: { projectId_userId: { projectId: p.id, userId: heir.userId } } }),
        ])
        await announce(p.id, 'updated')
      } else {
        await prisma.project.delete({ where: { id: p.id } })
        await announce(p.id, 'deleted')
      }
    }
    await Promise.all([
      prisma.projectMember.deleteMany({ where: { userId: id } }),
      prisma.teamMember.deleteMany({ where: { userId: id } }),
      prisma.comment.deleteMany({ where: { userId: id } }),
      prisma.like.deleteMany({ where: { userId: id } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: id }, { followingId: id }] } }),
      prisma.activity.deleteMany({ where: { userId: id } }),
      prisma.userRef.deleteMany({ where: { id } }),
    ])
    // teams that lost their owner and have no one else are removed
    const orphans = await prisma.team.findMany({ where: { ownerId: id }, include: { members: true } })
    for (const t of orphans) {
      const next = t.members.find((m) => m.role === 'ADMIN') ?? t.members[0]
      if (next) await prisma.team.update({ where: { id: t.id }, data: { ownerId: next.userId, members: { update: { where: { teamId_userId: { teamId: t.id, userId: next.userId } }, data: { role: 'OWNER' } } } } })
      else await prisma.team.delete({ where: { id: t.id } })
    }
  })
  log.logInformation('project consumers started')
}

/** For other services: who may do what on a project. */
const internal = Router()
internal.use(internalOnly)

internal.get('/projects/:id/access/:userId', asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { members: true } })
  if (!project) throw AppError.notFound('Project not found')
  const role = await roleOn(project, req.params.userId === 'anonymous' ? undefined : req.params.userId)
  res.json({ projectId: project.id, name: project.name, role, canRead: project.visibility === 'PUBLIC' || role !== null, canWrite: atLeast(role, 'MEMBER'), canAdmin: atLeast(role, 'ADMIN'), ownerId: project.ownerId })
}))

internal.get('/projects/:id/members', asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { members: true } })
  if (!project) throw AppError.notFound('Project not found')
  res.json({ ownerId: project.ownerId, members: project.members.map((m) => ({ userId: m.userId, role: m.role })) })
}))

/** Pages of public project docs for building the search index. */
internal.get('/projects', asyncHandler(async (req, res) => {
  const after = String(req.query.after ?? '')
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100))
  const rows = await prisma.project.findMany({ where: { visibility: 'PUBLIC', status: 'ACTIVE', ...(after ? { id: { gt: after } } : {}) }, orderBy: { id: 'asc' }, take: limit, include: { _count: { select: { likes: true } } } })
  const owners = new Map((await prisma.userRef.findMany({ where: { id: { in: rows.map((r) => r.ownerId) } } })).map((u) => [u.id, u.name]))
  res.json({
    projects: rows.map((p) => ({ id: p.id, name: p.name, slug: p.slug, description: p.description ?? '', readme: (p.readme ?? '').slice(0, 5000), tags: p.tags, visibility: p.visibility, ownerId: p.ownerId, ownerName: owners.get(p.ownerId) ?? '', stars: p._count.likes, createdAt: p.createdAt, updatedAt: p.updatedAt })),
    next: rows.length === limit ? rows[rows.length - 1].id : null,
  })
}))

void startService({
  name: 'project',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/projects', projects)
    app.use('/api/teams', teams)
    app.use('/api/social', social)
    app.use('/internal', internal)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
  onStart: () => startConsumers(),
  onStop: async () => {
    await createEventBus('project').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('project-service failed to start', e)
  process.exit(1)
})
