import crypto from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, attachUser, authenticate, createServiceClient, env, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import { activity, announce, atLeast, audit, ensureRef, hashToken, loadProject, need, notify, pageParams, refs, teamRole, uniqueSlug, type Role } from './lib'
import { emitEmail } from './mail'

const router = Router()
const auth = createServiceClient('auth')
const files = createServiceClient('file')
const FRONTEND = env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '')
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!
const uid = (req: Parameters<typeof userOf>[0]) => userOf(req)?.id

const tagList = z.array(z.string().trim().toLowerCase().min(1).max(30).regex(/^[\w.+#-]+$/, 'Tags may contain letters, numbers and . + # - _')).max(10).transform((t) => [...new Set(t)])
const url = z.union([z.literal(''), z.string().trim().max(300).refine((v) => /^https?:\/\//i.test(v) && URL.canParse(v), 'Must be an http(s) URL')]).transform((v) => v || null)

const base = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().transform((v) => v || null),
  readme: z.string().max(50_000).optional().transform((v) => v || null),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'TEAM']),
  tags: tagList,
  repoUrl: url,
  coverImage: url,
  teamId: z.string().uuid().nullable(),
})
const createSchema = base.partial({ description: true, readme: true, tags: true, repoUrl: true, coverImage: true, teamId: true, visibility: true }).extend({ visibility: base.shape.visibility.default('PRIVATE') })
const updateSchema = base.partial().extend({ status: z.enum(['ACTIVE', 'ARCHIVED']).optional() })

type Row = Awaited<ReturnType<typeof prisma.project.findMany<{ include: { _count: { select: { likes: true; comments: true } } } }>>>[number]
async function shape(rows: Row[], viewer?: string) {
  const owners = await refs(rows.map((r) => r.ownerId))
  const starred = viewer && rows.length ? new Set((await prisma.like.findMany({ where: { userId: viewer, projectId: { in: rows.map((r) => r.id) } }, select: { projectId: true } })).map((l) => l.projectId)) : new Set<string>()
  return rows.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, description: p.description, visibility: p.visibility, status: p.status, tags: p.tags, coverImage: p.coverImage,
    owner: owners.get(p.ownerId), stars: p._count.likes, comments: p._count.comments, forks: p.forkCount, starred: starred.has(p.id), updatedAt: p.updatedAt, createdAt: p.createdAt,
  }))
}
const counts = { select: { likes: true, comments: true } } as const

/* ───────────── browse ───────────── */

router.get(
  '/',
  attachUser,
  asyncHandler(async (req, res) => {
    const viewer = uid(req)
    const q = String(req.query.q ?? '').trim().slice(0, 100)
    const tag = String(req.query.tag ?? '').trim().toLowerCase()
    const scope = String(req.query.scope ?? 'public')
    const sort = String(req.query.sort ?? 'updated')
    const { page, pageSize, skip } = pageParams(req.query)
    if (scope !== 'public' && !viewer) throw AppError.unauthorized()

    const teamIds = viewer && scope !== 'public' ? (await prisma.teamMember.findMany({ where: { userId: viewer }, select: { teamId: true } })).map((t) => t.teamId) : []
    const where = {
      ...(scope === 'mine'
        ? { OR: [{ ownerId: viewer }, { members: { some: { userId: viewer } } }, { teamId: { in: teamIds } }] }
        : { visibility: 'PUBLIC' as const, status: 'ACTIVE' as const }),
      ...(q ? { AND: [{ OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { description: { contains: q, mode: 'insensitive' as const } }, { tags: { has: q.toLowerCase() } }] }] } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    }
    const orderBy = sort === 'stars' ? { likes: { _count: 'desc' as const } } : sort === 'newest' ? { createdAt: 'desc' as const } : { updatedAt: 'desc' as const }
    const [total, rows] = await Promise.all([prisma.project.count({ where }), prisma.project.findMany({ where, orderBy, skip, take: pageSize, include: { _count: counts } })])
    res.json({ data: await shape(rows as Row[], viewer), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) })
  })
)

/** Popular tags across public projects, for filters. */
router.get(
  '/tags',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.$queryRaw<{ tag: string; n: bigint }[]>`SELECT unnest(tags) AS tag, count(*) AS n FROM "Project" WHERE visibility = 'PUBLIC' AND status = 'ACTIVE' GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 30`
    res.json(rows.map((r) => ({ tag: r.tag, count: Number(r.n) })))
  })
)

/* ───────────── create / read / update / delete ───────────── */

router.post(
  '/',
  authenticate,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const b = req.body as z.infer<typeof createSchema>
    if (b.teamId) {
      const r = await teamRole(b.teamId, user.id)
      if (!r) throw AppError.forbidden('You are not a member of that team')
    }
    if (b.visibility === 'TEAM' && !b.teamId) throw AppError.badRequest('Pick a team for a team-visible project')
    await ensureRef(user)
    const count = await prisma.project.count({ where: { ownerId: user.id } })
    if (count >= 200) throw AppError.badRequest('Project limit reached')
    const project = await prisma.project.create({ data: { ...b, tags: b.tags ?? [], slug: await uniqueSlug(b.name, 'project'), ownerId: user.id } })
    await activity(user.id, 'PROJECT_CREATED', 'project', project.id, `Created project ${project.name}`, project.id)
    await announce(project.id, 'created')
    audit(user.id, 'project.created', { projectId: project.id })
    res.status(201).json(project)
  })
)

router.get(
  '/:idOrSlug',
  attachUser,
  asyncHandler(async (req, res) => {
    const viewer = uid(req)
    const { project, role } = await loadProject(req.params.idOrSlug, viewer)
    const full = await prisma.project.findUniqueOrThrow({ where: { id: project.id }, include: { _count: counts, team: { select: { id: true, name: true, slug: true } }, forkedFrom: { select: { id: true, name: true, slug: true, visibility: true } } } })
    const people = await refs([project.ownerId, ...project.members.map((m) => m.userId)])
    const [item] = await shape([full as unknown as Row], viewer)
    res.json({
      ...item,
      readme: project.readme,
      repoUrl: project.repoUrl,
      team: full.team,
      forkedFrom: full.forkedFrom && full.forkedFrom.visibility === 'PUBLIC' ? full.forkedFrom : null,
      role,
      canEdit: atLeast(role, 'ADMIN'),
      owner: people.get(project.ownerId),
      members: project.members.map((m) => ({ ...people.get(m.userId)!, role: m.role, joinedAt: m.joinedAt })),
    })
  })
)

router.patch(
  '/:id',
  authenticate,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    need(role, 'ADMIN', 'edit this project')
    const b = req.body as z.infer<typeof updateSchema>
    if (b.teamId) {
      if (!(await teamRole(b.teamId, user.id))) throw AppError.forbidden('You are not a member of that team')
    }
    const nextVisibility = b.visibility ?? project.visibility
    const nextTeam = b.teamId === undefined ? project.teamId : b.teamId
    if (nextVisibility === 'TEAM' && !nextTeam) throw AppError.badRequest('Pick a team for a team-visible project')
    const { name, ...rest } = b
    const updated = await prisma.project.update({ where: { id: project.id }, data: { ...rest, ...(name ? { name } : {}) } })
    await activity(user.id, 'PROJECT_UPDATED', 'project', project.id, `Updated project ${updated.name}`, project.id)
    await announce(project.id, 'updated')
    res.json(updated)
  })
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    need(role, 'OWNER', 'delete this project')
    await prisma.project.delete({ where: { id: project.id } })
    await prisma.activity.deleteMany({ where: { projectId: project.id } })
    await announce(project.id, 'deleted')
    audit(user.id, 'project.deleted', { projectId: project.id, name: project.name })
    res.json({ message: 'Project deleted' })
  })
)

/* ───────────── stars and forks ───────────── */

router.post(
  '/:id/star',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project } = await loadProject(req.params.id, user.id)
    const created = await prisma.like.createMany({ data: [{ userId: user.id, projectId: project.id }], skipDuplicates: true })
    if (created.count > 0 && project.ownerId !== user.id) {
      notify(project.ownerId, 'project', 'New star', `${user.name ?? 'Someone'} starred ${project.name}`, `/projects/${project.slug}`)
      await activity(user.id, 'LIKE_ADDED', 'project', project.id, `Starred ${project.name}`, project.id)
    }
    await announce(project.id, 'updated')
    res.json({ starred: true, stars: await prisma.like.count({ where: { projectId: project.id } }) })
  })
)

router.delete(
  '/:id/star',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project } = await loadProject(req.params.id, user.id)
    await prisma.like.deleteMany({ where: { userId: user.id, projectId: project.id } })
    await announce(project.id, 'updated')
    res.json({ starred: false, stars: await prisma.like.count({ where: { projectId: project.id } }) })
  })
)

router.post(
  '/:id/fork',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project } = await loadProject(req.params.id, user.id)
    if (project.ownerId === user.id) throw AppError.badRequest('You cannot fork your own project')
    await ensureRef(user)
    const fork = await prisma.project.create({
      data: { name: project.name, slug: await uniqueSlug(project.name, 'project'), description: project.description, readme: project.readme, tags: project.tags, repoUrl: project.repoUrl, visibility: 'PRIVATE', ownerId: user.id, forkedFromId: project.id },
    })
    await prisma.project.update({ where: { id: project.id }, data: { forkCount: { increment: 1 } } })
    await activity(user.id, 'PROJECT_FORKED', 'project', fork.id, `Forked ${project.name}`, fork.id)
    notify(project.ownerId, 'project', 'Your project was forked', `${user.name ?? 'Someone'} forked ${project.name}`, `/projects/${project.slug}`)
    await announce(fork.id, 'created')
    res.status(201).json(fork)
  })
)

/* ───────────── members ───────────── */

router.delete(
  '/:id/members/:userId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    const target = req.params.userId
    if (target === project.ownerId) throw AppError.badRequest('The owner cannot be removed')
    if (target !== user.id) need(role, 'ADMIN', 'remove members')
    const targetRole = project.members.find((m) => m.userId === target)?.role
    if (targetRole === 'ADMIN' && role !== 'OWNER' && target !== user.id) throw AppError.forbidden('Only the owner can remove an admin')
    const r = await prisma.projectMember.deleteMany({ where: { projectId: project.id, userId: target } })
    if (r.count === 0) throw AppError.notFound('Not a member')
    await activity(user.id, 'MEMBER_REMOVED', 'project', project.id, target === user.id ? 'Left the project' : 'Removed a member', project.id)
    if (target !== user.id) notify(target, 'project', 'Removed from a project', `You were removed from ${project.name}`, '/projects')
    res.json({ message: 'Member removed' })
  })
)

router.patch(
  '/:id/members/:userId',
  authenticate,
  validate(z.object({ role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']) })),
  asyncHandler(async (req, res) => {
    const { project, role } = await loadProject(req.params.id, me(req).id)
    need(role, 'OWNER', 'change roles')
    const r = await prisma.projectMember.updateMany({ where: { projectId: project.id, userId: req.params.userId }, data: { role: req.body.role } })
    if (r.count === 0) throw AppError.notFound('Not a member')
    res.json({ userId: req.params.userId, role: req.body.role })
  })
)

/* ───────────── invitations ───────────── */

router.post(
  '/:id/invitations',
  authenticate,
  validate(z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER') })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    need(role, 'ADMIN', 'invite people')
    if (req.body.role === 'ADMIN' && role !== 'OWNER') throw AppError.forbidden('Only the owner can invite admins')
    const pending = await prisma.invitation.count({ where: { entityId: project.id, status: 'PENDING', expiresAt: { gt: new Date() } } })
    if (pending >= 50) throw AppError.badRequest('Too many pending invitations')

    const invitee = await auth.get<{ id: string; name: string }>(`/internal/users/by-email/${encodeURIComponent(req.body.email)}`).catch((e: AppError) => {
      if (e.statusCode === 404) return null
      throw e
    })
    if (invitee && (invitee.id === project.ownerId || project.members.some((m) => m.userId === invitee.id))) throw AppError.conflict('That person is already on the project')

    await prisma.invitation.updateMany({ where: { entityId: project.id, email: req.body.email, status: 'PENDING' }, data: { status: 'EXPIRED' } })
    const token = crypto.randomBytes(32).toString('hex')
    const inv = await prisma.invitation.create({
      data: { email: req.body.email, senderId: user.id, type: 'PROJECT', entityId: project.id, role: req.body.role, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 7 * 86_400_000) },
    })
    const link = `${FRONTEND}/invitations/${token}`
    emitEmail({ to: req.body.email, template: 'invite', name: invitee?.name, url: link, data: { inviterName: user.name ?? 'A teammate', entityName: project.name, kind: 'project', role: req.body.role } })
    if (invitee) notify(invitee.id, 'invitation', 'Project invitation', `${user.name ?? 'Someone'} invited you to ${project.name}`, `/invitations/${token}`)
    audit(user.id, 'project.invited', { projectId: project.id, email: req.body.email })
    res.status(201).json({ id: inv.id, email: inv.email, role: inv.role, expiresAt: inv.expiresAt })
  })
)

router.get(
  '/:id/invitations',
  authenticate,
  asyncHandler(async (req, res) => {
    const { project, role } = await loadProject(req.params.id, me(req).id)
    need(role, 'ADMIN', 'see invitations')
    res.json(await prisma.invitation.findMany({ where: { entityId: project.id, status: 'PENDING', expiresAt: { gt: new Date() } }, select: { id: true, email: true, role: true, createdAt: true, expiresAt: true }, orderBy: { createdAt: 'desc' } }))
  })
)

router.delete(
  '/:id/invitations/:invitationId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { project, role } = await loadProject(req.params.id, me(req).id)
    need(role, 'ADMIN', 'revoke invitations')
    await prisma.invitation.updateMany({ where: { id: req.params.invitationId, entityId: project.id, status: 'PENDING' }, data: { status: 'EXPIRED' } })
    res.json({ message: 'Invitation revoked' })
  })
)

/* ───────────── comments ───────────── */

router.get(
  '/:id/comments',
  attachUser,
  asyncHandler(async (req, res) => {
    const { project } = await loadProject(req.params.id, uid(req))
    const { page, pageSize, skip } = pageParams(req.query, 20, 50)
    const [total, top] = await Promise.all([
      prisma.comment.count({ where: { projectId: project.id, parentId: null } }),
      prisma.comment.findMany({ where: { projectId: project.id, parentId: null }, orderBy: { createdAt: 'desc' }, skip, take: pageSize, include: { replies: { orderBy: { createdAt: 'asc' }, take: 50 } } }),
    ])
    const people = await refs(top.flatMap((c) => [c.userId, ...c.replies.map((r) => r.userId)]))
    const out = (c: { id: string; content: string; userId: string; createdAt: Date; editedAt: Date | null }) => ({ id: c.id, content: c.content, author: people.get(c.userId), createdAt: c.createdAt, edited: Boolean(c.editedAt), mine: c.userId === uid(req) })
    res.json({ data: top.map((c) => ({ ...out(c), replies: c.replies.map(out) })), total, page, pageSize })
  })
)

router.post(
  '/:id/comments',
  authenticate,
  validate(z.object({ content: z.string().trim().min(1).max(2000), parentId: z.string().uuid().optional() })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project } = await loadProject(req.params.id, user.id)
    let parent = null
    if (req.body.parentId) {
      parent = await prisma.comment.findFirst({ where: { id: req.body.parentId, projectId: project.id } })
      if (!parent) throw AppError.notFound('Comment not found')
      if (parent.parentId) throw AppError.badRequest('Replies can only be one level deep')
    }
    await ensureRef(user)
    const c = await prisma.comment.create({ data: { content: req.body.content, projectId: project.id, userId: user.id, parentId: parent?.id } })
    await activity(user.id, 'COMMENT_ADDED', 'project', project.id, `Commented on ${project.name}`, project.id)
    const link = `/projects/${project.slug}#comment-${c.id}`
    if (project.ownerId !== user.id) notify(project.ownerId, 'comment', 'New comment', `${user.name ?? 'Someone'} commented on ${project.name}`, link)
    if (parent && parent.userId !== user.id && parent.userId !== project.ownerId) notify(parent.userId, 'comment', 'New reply', `${user.name ?? 'Someone'} replied to your comment`, link)
    res.status(201).json({ id: c.id, content: c.content, createdAt: c.createdAt, parentId: c.parentId })
  })
)

router.patch(
  '/:id/comments/:commentId',
  authenticate,
  validate(z.object({ content: z.string().trim().min(1).max(2000) })),
  asyncHandler(async (req, res) => {
    const { project } = await loadProject(req.params.id, me(req).id)
    const r = await prisma.comment.updateMany({ where: { id: req.params.commentId, projectId: project.id, userId: me(req).id }, data: { content: req.body.content, editedAt: new Date() } })
    if (r.count === 0) throw AppError.notFound('Comment not found')
    res.json({ message: 'Comment updated' })
  })
)

router.delete(
  '/:id/comments/:commentId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    const c = await prisma.comment.findFirst({ where: { id: req.params.commentId, projectId: project.id } })
    if (!c) throw AppError.notFound('Comment not found')
    if (c.userId !== user.id) need(role, 'ADMIN', 'moderate comments')
    await prisma.comment.delete({ where: { id: c.id } })
    res.json({ message: 'Comment deleted' })
  })
)

/* ───────────── attachments (bytes live in the file-service) ───────────── */

router.get(
  '/:id/files',
  attachUser,
  asyncHandler(async (req, res) => {
    const { project } = await loadProject(req.params.id, uid(req))
    res.json(await prisma.projectFile.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' } }))
  })
)

router.post(
  '/:id/files',
  authenticate,
  validate(z.object({ fileId: z.string().uuid() })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    need(role, 'MEMBER', 'attach files')
    const meta = await files.get<{ id: string; ownerId: string; name: string; mimeType: string; size: number }>(`/internal/files/${req.body.fileId}`)
    if (meta.ownerId !== user.id) throw AppError.forbidden('You can only attach files you uploaded')
    const row = await prisma.projectFile.upsert({
      where: { projectId_fileId: { projectId: project.id, fileId: meta.id } },
      update: {},
      create: { projectId: project.id, fileId: meta.id, name: meta.name, mimeType: meta.mimeType, size: meta.size, addedBy: user.id },
    })
    await activity(user.id, 'FILE_UPLOADED', 'project', project.id, `Attached ${meta.name}`, project.id)
    res.status(201).json(row)
  })
)

router.delete(
  '/:id/files/:fileId',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { project, role } = await loadProject(req.params.id, user.id)
    const f = await prisma.projectFile.findFirst({ where: { projectId: project.id, fileId: req.params.fileId } })
    if (!f) throw AppError.notFound('Attachment not found')
    if (f.addedBy !== user.id) need(role, 'ADMIN', 'remove other people\'s attachments')
    await prisma.projectFile.delete({ where: { projectId_fileId: { projectId: project.id, fileId: f.fileId } } })
    res.json({ message: 'Attachment removed' })
  })
)

/* ───────────── activity ───────────── */

router.get(
  '/:id/activity',
  attachUser,
  asyncHandler(async (req, res) => {
    const { project } = await loadProject(req.params.id, uid(req))
    const rows = await prisma.activity.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' }, take: 50 })
    const people = await refs(rows.map((r) => r.userId))
    res.json(rows.map((r) => ({ id: r.id, type: r.type, summary: r.summary, user: people.get(r.userId), createdAt: r.createdAt })))
  })
)

export default router
export type { Role }
