import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, attachUser, authenticate, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import { activity, announce, audit, ensureRef, hashToken, notify, pageParams, refs } from './lib'

const router = Router()
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!

/* ───────────── follows ───────────── */

router.post(
  '/follow/:userId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    if (req.params.userId === user.id) throw AppError.badRequest('You cannot follow yourself')
    await ensureRef(user)
    const created = await prisma.follow.createMany({ data: [{ followerId: user.id, followingId: req.params.userId }], skipDuplicates: true })
    if (created.count > 0) {
      notify(req.params.userId, 'follow', 'New follower', `${user.name ?? 'Someone'} started following you`, `/people/${user.id}`)
      await activity(user.id, 'FOLLOW_ADDED', 'user', req.params.userId, 'Followed a member')
    }
    res.json({ following: true })
  })
)

router.delete(
  '/follow/:userId',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.follow.deleteMany({ where: { followerId: me(req).id, followingId: req.params.userId } })
    res.json({ following: false })
  })
)

async function people(ids: string[]) {
  const map = await refs(ids)
  return ids.map((id) => map.get(id)!)
}

router.get(
  '/people/:userId',
  attachUser,
  asyncHandler(async (req, res) => {
    const target = req.params.userId
    const viewer = userOf(req)?.id
    const [followers, following, isFollowing, projects, ref] = await Promise.all([
      prisma.follow.count({ where: { followingId: target } }),
      prisma.follow.count({ where: { followerId: target } }),
      viewer ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewer, followingId: target } } }) : null,
      prisma.project.findMany({ where: { ownerId: target, visibility: 'PUBLIC', status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' }, take: 30, select: { id: true, name: true, slug: true, description: true, tags: true, updatedAt: true, _count: { select: { likes: true } } } }),
      refs([target]),
    ])
    res.json({ user: ref.get(target), followers, following, isFollowing: Boolean(isFollowing), projects: projects.map((p) => ({ ...p, stars: p._count.likes, _count: undefined })) })
  })
)

router.get(
  '/followers',
  authenticate,
  asyncHandler(async (req, res) => {
    const rows = await prisma.follow.findMany({ where: { followingId: me(req).id }, orderBy: { createdAt: 'desc' }, take: 200 })
    res.json(await people(rows.map((r) => r.followerId)))
  })
)

router.get(
  '/following',
  authenticate,
  asyncHandler(async (req, res) => {
    const rows = await prisma.follow.findMany({ where: { followerId: me(req).id }, orderBy: { createdAt: 'desc' }, take: 200 })
    res.json(await people(rows.map((r) => r.followingId)))
  })
)

/** What the people you follow have been doing (public projects only), newest first. */
router.get(
  '/feed',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { page, pageSize, skip } = pageParams(req.query, 20, 50)
    const followed = (await prisma.follow.findMany({ where: { followerId: user.id }, select: { followingId: true } })).map((f) => f.followingId)
    const publicProjects = followed.length ? (await prisma.project.findMany({ where: { visibility: 'PUBLIC', ownerId: { in: followed } }, select: { id: true } })).map((p) => p.id) : []
    const where = { OR: [{ userId: { in: followed }, projectId: { in: publicProjects } }, { userId: user.id }] }
    const [total, rows] = await Promise.all([prisma.activity.count({ where }), prisma.activity.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize })])
    const who = await refs(rows.map((r) => r.userId))
    res.json({ data: rows.map((r) => ({ id: r.id, type: r.type, summary: r.summary, projectId: r.projectId, user: who.get(r.userId), createdAt: r.createdAt })), total, page, pageSize })
  })
)

/* ───────────── invitations the signed-in user received ───────────── */

async function describe(i: { id: string; type: 'PROJECT' | 'TEAM'; entityId: string; senderId: string; role: string; expiresAt: Date; email: string }) {
  const entity = i.type === 'PROJECT'
    ? await prisma.project.findUnique({ where: { id: i.entityId }, select: { name: true, slug: true } })
    : await prisma.team.findUnique({ where: { id: i.entityId }, select: { name: true, slug: true } })
  const sender = (await refs([i.senderId])).get(i.senderId)
  return { id: i.id, type: i.type, entity: entity ? { name: entity.name, slug: entity.slug } : null, role: i.role, invitedBy: sender, expiresAt: i.expiresAt }
}

router.get(
  '/invitations/mine',
  authenticate,
  asyncHandler(async (req, res) => {
    const email = me(req).email?.toLowerCase()
    if (!email) return res.json([])
    const rows = await prisma.invitation.findMany({ where: { email, status: 'PENDING', expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 50 })
    res.json(await Promise.all(rows.map(describe)))
  })
)

/** Looks a link up without consuming it, so the page can say what you are about to join. */
router.get(
  '/invitations/:token',
  authenticate,
  asyncHandler(async (req, res) => {
    const inv = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(req.params.token) } })
    if (!inv || inv.status !== 'PENDING' || inv.expiresAt < new Date()) throw AppError.notFound('This invitation is no longer valid')
    res.json({ ...(await describe(inv)), forYou: inv.email === me(req).email?.toLowerCase() })
  })
)

async function resolveInvitation(token: string, req: Parameters<typeof me>[0]) {
  const user = me(req)
  const inv = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(token) } })
  if (!inv || inv.status !== 'PENDING' || inv.expiresAt < new Date()) throw AppError.notFound('This invitation is no longer valid')
  // an invitation belongs to the address it was sent to: a forwarded link must not work for someone else
  if (inv.email !== user.email?.toLowerCase()) throw AppError.forbidden('This invitation was sent to a different email address')
  return { inv, user }
}

router.post(
  '/invitations/:token/accept',
  authenticate,
  asyncHandler(async (req, res) => {
    const { inv, user } = await resolveInvitation(req.params.token, req)
    await ensureRef(user)
    const claimed = await prisma.invitation.updateMany({ where: { id: inv.id, status: 'PENDING' }, data: { status: 'ACCEPTED' } })
    if (claimed.count === 0) throw AppError.conflict('This invitation was already used')
    if (inv.type === 'PROJECT') {
      const project = await prisma.project.findUnique({ where: { id: inv.entityId } })
      if (!project) throw AppError.notFound('The project no longer exists')
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: user.id } },
        update: { role: inv.role as 'ADMIN' | 'MEMBER' | 'VIEWER' },
        create: { projectId: project.id, userId: user.id, role: inv.role as 'ADMIN' | 'MEMBER' | 'VIEWER' },
      })
      await activity(user.id, 'MEMBER_ADDED', 'project', project.id, 'Joined the project', project.id)
      notify(inv.senderId, 'invitation', 'Invitation accepted', `${user.name ?? 'Someone'} joined ${project.name}`, `/projects/${project.slug}`)
      await announce(project.id, 'updated')
      audit(user.id, 'project.joined', { projectId: project.id })
      return res.json({ type: 'PROJECT', slug: project.slug, name: project.name })
    }
    const team = await prisma.team.findUnique({ where: { id: inv.entityId } })
    if (!team) throw AppError.notFound('The team no longer exists')
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
      update: { role: inv.role as 'ADMIN' | 'MEMBER' },
      create: { teamId: team.id, userId: user.id, role: inv.role as 'ADMIN' | 'MEMBER' },
    })
    notify(inv.senderId, 'invitation', 'Invitation accepted', `${user.name ?? 'Someone'} joined ${team.name}`, `/teams/${team.slug}`)
    res.json({ type: 'TEAM', slug: team.slug, name: team.name })
  })
)

router.post(
  '/invitations/:token/reject',
  authenticate,
  validate(z.object({}).passthrough()),
  asyncHandler(async (req, res) => {
    const { inv } = await resolveInvitation(req.params.token, req)
    await prisma.invitation.update({ where: { id: inv.id }, data: { status: 'REJECTED' } })
    res.json({ message: 'Invitation declined' })
  })
)

export default router
