import crypto from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, attachUser, authenticate, createServiceClient, env, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import { audit, canSeeTeam, ensureRef, hashToken, notify, pageParams, refs, teamRole, uniqueSlug } from './lib'
import { emitEmail } from './mail'

const router = Router()
const auth = createServiceClient('auth')
const FRONTEND = env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '')
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!

const teamSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional().transform((v) => v || null),
  isPublic: z.boolean().default(false),
})

async function loadTeam(idOrSlug: string, userId?: string) {
  const isId = /^[0-9a-f-]{36}$/i.test(idOrSlug)
  const team = await prisma.team.findFirst({ where: isId ? { id: idOrSlug } : { slug: idOrSlug }, include: { members: true } })
  if (!team) throw AppError.notFound('Team not found')
  const role = team.members.find((m) => m.userId === userId)?.role ?? null
  if (!canSeeTeam(team, role)) throw AppError.notFound('Team not found')
  return { team, role }
}

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const scope = String(req.query.scope ?? 'mine')
    const { page, pageSize, skip } = pageParams(req.query, 20)
    const where = scope === 'public' ? { isPublic: true } : { members: { some: { userId: user.id } } }
    const [total, rows] = await Promise.all([prisma.team.count({ where }), prisma.team.findMany({ where, orderBy: { updatedAt: 'desc' }, skip, take: pageSize, include: { _count: { select: { members: true, projects: true } }, members: { where: { userId: user.id } } } })])
    res.json({ data: rows.map((t) => ({ id: t.id, name: t.name, slug: t.slug, description: t.description, isPublic: t.isPublic, members: t._count.members, projects: t._count.projects, role: t.members[0]?.role ?? null })), total, page, pageSize })
  })
)

router.post(
  '/',
  authenticate,
  validate(teamSchema),
  asyncHandler(async (req, res) => {
    const user = me(req)
    await ensureRef(user)
    if ((await prisma.team.count({ where: { ownerId: user.id } })) >= 20) throw AppError.badRequest('Team limit reached')
    const team = await prisma.team.create({
      data: { ...req.body, slug: await uniqueSlug(req.body.name, 'team'), ownerId: user.id, members: { create: { userId: user.id, role: 'OWNER' } } },
    })
    res.status(201).json(team)
  })
)

router.get(
  '/:idOrSlug',
  attachUser,
  asyncHandler(async (req, res) => {
    const viewer = userOf(req)?.id
    const { team, role } = await loadTeam(req.params.idOrSlug, viewer)
    const people = await refs(team.members.map((m) => m.userId))
    const projects = await prisma.project.findMany({
      where: { teamId: team.id, ...(role ? {} : { visibility: 'PUBLIC' as const }) },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, name: true, slug: true, visibility: true, description: true },
    })
    res.json({ id: team.id, name: team.name, slug: team.slug, description: team.description, isPublic: team.isPublic, role, members: team.members.map((m) => ({ ...people.get(m.userId)!, role: m.role, joinedAt: m.joinedAt })), projects })
  })
)

router.patch(
  '/:id',
  authenticate,
  validate(teamSchema.partial()),
  asyncHandler(async (req, res) => {
    const { team, role } = await loadTeam(req.params.id, me(req).id)
    if (role !== 'OWNER' && role !== 'ADMIN') throw AppError.forbidden('Team admins only')
    res.json(await prisma.team.update({ where: { id: team.id }, data: req.body }))
  })
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { team, role } = await loadTeam(req.params.id, user.id)
    if (role !== 'OWNER') throw AppError.forbidden('Only the team owner can delete it')
    await prisma.team.delete({ where: { id: team.id } }) // projects keep existing: teamId is set null
    audit(user.id, 'team.deleted', { teamId: team.id })
    res.json({ message: 'Team deleted' })
  })
)

router.post(
  '/:id/invitations',
  authenticate,
  validate(z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER') })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { team, role } = await loadTeam(req.params.id, user.id)
    if (role !== 'OWNER' && role !== 'ADMIN') throw AppError.forbidden('Team admins only')
    if (req.body.role === 'ADMIN' && role !== 'OWNER') throw AppError.forbidden('Only the owner can invite admins')
    const invitee = await auth.get<{ id: string; name: string }>(`/internal/users/by-email/${encodeURIComponent(req.body.email)}`).catch((e: AppError) => {
      if (e.statusCode === 404) return null
      throw e
    })
    if (invitee && team.members.some((m) => m.userId === invitee.id)) throw AppError.conflict('That person is already on the team')
    await prisma.invitation.updateMany({ where: { entityId: team.id, email: req.body.email, status: 'PENDING' }, data: { status: 'EXPIRED' } })
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.invitation.create({ data: { email: req.body.email, senderId: user.id, type: 'TEAM', entityId: team.id, role: req.body.role, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 7 * 86_400_000) } })
    emitEmail({ to: req.body.email, template: 'invite', name: invitee?.name, url: `${FRONTEND}/invitations/${token}`, data: { inviterName: user.name ?? 'A teammate', entityName: team.name, kind: 'team', role: req.body.role } })
    if (invitee) notify(invitee.id, 'invitation', 'Team invitation', `${user.name ?? 'Someone'} invited you to ${team.name}`, `/invitations/${token}`)
    res.status(201).json({ message: 'Invitation sent' })
  })
)

router.patch(
  '/:id/members/:userId',
  authenticate,
  validate(z.object({ role: z.enum(['ADMIN', 'MEMBER']) })),
  asyncHandler(async (req, res) => {
    const { team, role } = await loadTeam(req.params.id, me(req).id)
    if (role !== 'OWNER') throw AppError.forbidden('Only the owner can change roles')
    if (req.params.userId === team.ownerId) throw AppError.badRequest("The owner's role cannot change")
    const r = await prisma.teamMember.updateMany({ where: { teamId: team.id, userId: req.params.userId }, data: { role: req.body.role } })
    if (r.count === 0) throw AppError.notFound('Not a member')
    res.json({ userId: req.params.userId, role: req.body.role })
  })
)

router.delete(
  '/:id/members/:userId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { team, role } = await loadTeam(req.params.id, user.id)
    const target = req.params.userId
    if (target === team.ownerId) throw AppError.badRequest('The owner cannot leave; delete the team or transfer ownership first')
    if (target !== user.id && role !== 'OWNER' && role !== 'ADMIN') throw AppError.forbidden('Team admins only')
    const targetRole = await teamRole(team.id, target)
    if (targetRole === 'ADMIN' && role !== 'OWNER' && target !== user.id) throw AppError.forbidden('Only the owner can remove an admin')
    await prisma.teamMember.deleteMany({ where: { teamId: team.id, userId: target } })
    res.json({ message: 'Member removed' })
  })
)

export default router
