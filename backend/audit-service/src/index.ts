import { Router } from 'express'
import { z } from 'zod'
import { AppError, TOPICS, asyncHandler, authenticate, createEventBus, createLogger, createServiceClient, redisHealthy, requireRole, startService, userOf, validate, type DomainEvent } from '@devhub/shared'
import { append, verify } from './chain'
import { prisma } from './db'
import type { Prisma } from './generated/client'

const log = createLogger('audit')
const GROUP = 'audit-service'
const auth = createServiceClient('auth')

/* ───────────── recording ───────────── */

const str = (v: unknown, max = 200): string | null => (typeof v === 'string' && v ? v.slice(0, max) : null)

/** auth.login_failed, project.created, admin.role_changed...: the first word is the resource, the rest the verb. */
const resourceOf = (action: string) => action.split('.')[0] || 'system'
const RESOURCE_ID_KEYS = ['projectId', 'teamId', 'target', 'courseId', 'orderId', 'userId', 'boardId', 'fileId', 'id']

function fromAuditEvent(e: DomainEvent) {
  const d = (e.data ?? {}) as Record<string, unknown>
  const { actor, ip, userAgent, ...details } = d
  const key = RESOURCE_ID_KEYS.find((k) => details[k] !== undefined)
  return {
    at: new Date(e.timestamp),
    actorId: str(actor, 64),
    action: e.type.slice(0, 80),
    resource: resourceOf(e.type),
    resourceId: key ? str(String(details[key]), 80) : null,
    status: /failed|denied|rejected/.test(e.type) ? 'FAILURE' : 'SUCCESS',
    ip: str(ip, 64),
    userAgent: str(userAgent, 300),
    details: details as Prisma.InputJsonValue,
  }
}

/** Business events that matter for accountability even though no service explicitly "audited" them. */
function fromDomainEvent(action: string, resource: string, e: DomainEvent, actor: string | null, resourceId: string | null) {
  const { email: _email, name: _name, ...details } = (e.data ?? {}) as Record<string, unknown> // no personal data in the trail
  return { at: new Date(e.timestamp), actorId: actor, action, resource, resourceId, status: 'SUCCESS', ip: null, userAgent: null, details: details as Prisma.InputJsonValue }
}

async function startConsumers() {
  const bus = createEventBus('audit')
  const replay = { replay: true } // the trail must not have holes: a new instance catches up on retained events
  await bus.subscribe(TOPICS.auditRecorded, GROUP, async (e) => void (await append(fromAuditEvent(e), e.id)), replay)
  await bus.subscribe(TOPICS.paymentSucceeded, GROUP, async (e) => void (await append(fromDomainEvent('payment.succeeded', 'payment', e, str(e.data.userId, 64), str(e.data.orderId, 80)), e.id)), replay)
  await bus.subscribe(TOPICS.paymentRefunded, GROUP, async (e) => void (await append(fromDomainEvent('payment.refunded', 'payment', e, str(e.data.userId, 64), str(e.data.orderId, 80)), e.id)), replay)
  await bus.subscribe(TOPICS.userRegistered, GROUP, async (e) => void (await append(fromDomainEvent('user.registered', 'user', e, str(e.data.id, 64), str(e.data.id, 64)), e.id)), replay)
  await bus.subscribe(TOPICS.userDeleted, GROUP, async (e) => void (await append(fromDomainEvent('user.deleted', 'user', e, str(e.data.id, 64), str(e.data.id, 64)), e.id)), replay)
  await bus.subscribe(TOPICS.subscriptionChanged, GROUP, async (e) => void (await append(fromDomainEvent('subscription.changed', 'payment', e, str(e.data.userId, 64), null), e.id)), replay)
  await bus.subscribe(TOPICS.coursePublished, GROUP, async (e) => void (await append(fromDomainEvent('course.published', 'course', e, null, str(String(e.data.courseId), 80)), e.id)), replay)
  log.logInformation('audit consumers started')
}

/* ───────────── reading ───────────── */

const filters = z.object({
  actor: z.string().max(64).optional(),
  action: z.string().max(80).optional(), // exact, or a prefix ending in a dot: "auth."
  resource: z.string().max(40).optional(),
  resourceId: z.string().max(80).optional(),
  status: z.enum(['SUCCESS', 'FAILURE']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
})

const whereOf = (f: z.infer<typeof filters>): Prisma.AuditLogWhereInput => ({
  ...(f.actor ? { actorId: f.actor } : {}),
  ...(f.action ? (f.action.endsWith('.') ? { action: { startsWith: f.action } } : { action: f.action }) : {}),
  ...(f.resource ? { resource: f.resource } : {}),
  ...(f.resourceId ? { resourceId: f.resourceId } : {}),
  ...(f.status ? { status: f.status } : {}),
  ...(f.from || f.to ? { at: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) } } : {}),
})

const shape = (r: { id: bigint; at: Date; actorId: string | null; action: string; resource: string; resourceId: string | null; status: string; ip: string | null; userAgent: string | null; details: unknown }, names: Map<string, string>) => ({
  id: r.id.toString(), at: r.at, actor: r.actorId ? { id: r.actorId, name: names.get(r.actorId) ?? null } : null, action: r.action, resource: r.resource, resourceId: r.resourceId, status: r.status, ip: r.ip, userAgent: r.userAgent, details: r.details,
})

async function nameMap(ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))]
  if (!unique.length) return new Map<string, string>()
  const people = await auth.post<{ id: string; name: string }[]>('/internal/users/lookup', { ids: unique.slice(0, 200) }).catch(() => [])
  return new Map(people.map((p) => [p.id, p.name]))
}

const router = Router()

// What the signed-in person did that touches their own account security: logins, password and 2FA changes
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const rows = await prisma.auditLog.findMany({ where: { actorId: userOf(req)!.id, resource: 'auth' }, orderBy: { id: 'desc' }, take: 50 })
    res.json(rows.map((r) => ({ id: r.id.toString(), at: r.at, action: r.action, status: r.status, ip: r.ip, userAgent: r.userAgent })))
  })
)

const admin = Router()
admin.use(requireRole('ADMIN'))

admin.get(
  '/logs',
  validate(filters, 'query'),
  asyncHandler(async (req, res) => {
    const f = req.query as unknown as z.infer<typeof filters>
    const where = whereOf(f)
    const [total, rows] = await Promise.all([prisma.auditLog.count({ where }), prisma.auditLog.findMany({ where, orderBy: { id: 'desc' }, skip: (f.page - 1) * f.pageSize, take: f.pageSize })])
    const names = await nameMap(rows.map((r) => r.actorId))
    res.json({ data: rows.map((r) => shape(r, names)), total, page: f.page, pageSize: f.pageSize, totalPages: Math.max(1, Math.ceil(total / f.pageSize)) })
  })
)

admin.get(
  '/logs/:id',
  asyncHandler(async (req, res) => {
    if (!/^\d{1,18}$/.test(req.params.id)) throw AppError.badRequest('Invalid id')
    const r = await prisma.auditLog.findUnique({ where: { id: BigInt(req.params.id) } })
    if (!r) throw AppError.notFound('Entry not found')
    res.json({ ...shape(r, await nameMap([r.actorId])), prevHash: r.prevHash, hash: r.hash })
  })
)

admin.get(
  '/actions',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.auditLog.groupBy({ by: ['action'], _count: true, orderBy: { _count: { action: 'desc' } }, take: 100 })
    res.json(rows.map((r) => ({ action: r.action, count: r._count })))
  })
)

admin.get(
  '/stats',
  validate(z.object({ days: z.coerce.number().int().min(1).max(365).default(7) }), 'query'),
  asyncHandler(async (req, res) => {
    const days = (req.query as unknown as { days: number }).days
    const since = new Date(Date.now() - days * 86_400_000)
    const [byResource, failures, byDay, topActors] = await Promise.all([
      prisma.auditLog.groupBy({ by: ['resource'], where: { at: { gte: since } }, _count: true }),
      prisma.auditLog.count({ where: { at: { gte: since }, status: 'FAILURE' } }),
      prisma.$queryRaw<{ day: Date; n: bigint }[]>`SELECT date_trunc('day', "at") AS day, count(*) AS n FROM "AuditLog" WHERE "at" >= ${since} GROUP BY 1 ORDER BY 1`,
      prisma.auditLog.groupBy({ by: ['actorId'], where: { at: { gte: since }, actorId: { not: null } }, _count: true, orderBy: { _count: { actorId: 'desc' } }, take: 5 }),
    ])
    const names = await nameMap(topActors.map((a) => a.actorId))
    res.json({
      days,
      total: byResource.reduce((n, r) => n + r._count, 0),
      failures,
      byResource: Object.fromEntries(byResource.map((r) => [r.resource, r._count])),
      byDay: byDay.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.n) })),
      topActors: topActors.map((a) => ({ id: a.actorId, name: names.get(a.actorId!) ?? null, count: a._count })),
    })
  })
)

const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

admin.get(
  '/export',
  validate(filters.omit({ page: true, pageSize: true }), 'query'),
  asyncHandler(async (req, res) => {
    const where = whereOf({ ...(req.query as object), page: 1, pageSize: 1 } as z.infer<typeof filters>)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="audit-${new Date().toISOString().slice(0, 10)}.csv"`)
    res.write('id,at,actor,action,resource,resource_id,status,ip,details\n')
    let cursor = 0n
    let sent = 0
    while (sent < 50_000) {
      const rows = await prisma.auditLog.findMany({ where: { ...where, id: { gt: cursor } }, orderBy: { id: 'asc' }, take: 1000 })
      if (!rows.length) break
      for (const r of rows) res.write([r.id, r.at.toISOString(), r.actorId, r.action, r.resource, r.resourceId, r.status, r.ip, JSON.stringify(r.details)].map(csv).join(',') + '\n')
      cursor = rows[rows.length - 1].id
      sent += rows.length
    }
    res.end()
  })
)

admin.get(
  '/verify',
  validate(z.object({ from: z.string().regex(/^\d{1,18}$/).optional() }), 'query'),
  asyncHandler(async (req, res) => {
    const from = (req.query as { from?: string }).from
    res.json(await verify(from ? BigInt(from) : undefined))
  })
)

router.use('/', admin)

void startService({
  name: 'audit',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/audit', router)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
  onStart: () => startConsumers(),
  onStop: async () => {
    await createEventBus('audit').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('audit-service failed to start', e)
  process.exit(1)
})
