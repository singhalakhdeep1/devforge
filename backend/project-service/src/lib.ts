import crypto from 'node:crypto'
import { AppError, TOPICS, createEventBus, emit } from '@devhub/shared'
import { prisma } from './db'
import type { Project, ProjectMember, ProjectRole, Team, TeamMember } from './generated/client'

export const bus = createEventBus('project')

/* ───────────── people ───────────── */

export type Ref = { id: string; name: string; avatar: string | null }

/** id -> display data. Unknown ids (not synced yet, or deleted) fall back to a neutral label. */
export async function refs(ids: string[]): Promise<Map<string, Ref>> {
  const unique = [...new Set(ids.filter(Boolean))]
  const rows = unique.length ? await prisma.userRef.findMany({ where: { id: { in: unique } } }) : []
  const map = new Map<string, Ref>(rows.map((r) => [r.id, { id: r.id, name: r.name, avatar: r.avatar }]))
  for (const id of unique) if (!map.has(id)) map.set(id, { id, name: 'Former member', avatar: null })
  return map
}

/** Make sure the caller has a UserRef row even before their user.registered event has been processed. */
export async function ensureRef(u: { id: string; name?: string }) {
  await prisma.userRef.upsert({ where: { id: u.id }, update: {}, create: { id: u.id, name: u.name || 'Member' } })
}

/* ───────────── permissions ───────────── */

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
const RANK: Record<Role, number> = { OWNER: 4, ADMIN: 3, MEMBER: 2, VIEWER: 1 }
export const atLeast = (role: Role | null, min: Role) => (role ? RANK[role] >= RANK[min] : false)

type ProjectWith = Project & { members: ProjectMember[] }

/** The caller's effective role on a project: ownership, explicit membership, then the owning team. */
export async function roleOn(project: ProjectWith, userId?: string): Promise<Role | null> {
  if (!userId) return null
  if (project.ownerId === userId) return 'OWNER'
  let best: Role | null = project.members.find((m) => m.userId === userId)?.role ?? null
  if (project.teamId) {
    const tm = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: project.teamId, userId } } })
    if (tm) {
      const viaTeam: Role = tm.role === 'MEMBER' ? 'MEMBER' : 'ADMIN'
      if (!best || RANK[viaTeam] > RANK[best]) best = viaTeam
    }
  }
  return best
}

export function canRead(project: Project, role: Role | null) {
  return project.visibility === 'PUBLIC' || role !== null
}

/** Loads by id or slug. Private projects look non-existent to people who cannot see them. */
export async function loadProject(idOrSlug: string, userId?: string) {
  const isId = /^[0-9a-f-]{36}$/i.test(idOrSlug)
  const project = await prisma.project.findFirst({ where: isId ? { id: idOrSlug } : { slug: idOrSlug }, include: { members: true } })
  if (!project) throw AppError.notFound('Project not found')
  const role = await roleOn(project, userId)
  if (!canRead(project, role)) throw AppError.notFound('Project not found')
  return { project, role }
}

export function need(role: Role | null, min: Role, what = 'do that') {
  if (!atLeast(role, min)) throw AppError.forbidden(min === 'OWNER' ? 'Only the project owner can ' + what : `You need ${min.toLowerCase()} access to ${what}`)
}

export async function teamRole(teamId: string, userId?: string): Promise<TeamMember['role'] | null> {
  if (!userId) return null
  const m = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } })
  return m?.role ?? null
}

export const canSeeTeam = (team: Team, role: TeamMember['role'] | null) => team.isPublic || role !== null

/* ───────────── helpers ───────────── */

export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 48) || 'project'

export async function uniqueSlug(base: string, table: 'project' | 'team'): Promise<string> {
  const root = slugify(base)
  for (let i = 0; i < 6; i++) {
    const slug = i === 0 ? root : `${root}-${crypto.randomBytes(2).toString('hex')}`
    const taken = table === 'project' ? await prisma.project.findUnique({ where: { slug } }) : await prisma.team.findUnique({ where: { slug } })
    if (!taken) return slug
  }
  return `${root}-${crypto.randomBytes(4).toString('hex')}`
}

export const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex')

export async function activity(userId: string, type: string, entityType: string, entityId: string, summary: string, projectId?: string) {
  await prisma.activity.create({ data: { userId, type, entityType, entityId, summary: summary.slice(0, 300), projectId } }).catch(() => undefined)
}

export function notify(userId: string, type: string, title: string, body: string, link: string) {
  emit(bus, TOPICS.notificationRequested, 'notification.requested', { userId, type, title, body, link }, userId)
}

export function audit(actor: string, action: string, data: Record<string, unknown>) {
  emit(bus, TOPICS.auditRecorded, action, { actor, ...data })
}

/** Announce a change so the search index (and anyone else) can catch up. */
export async function announce(projectId: string, action: 'created' | 'updated' | 'deleted') {
  if (action === 'deleted') return emit(bus, TOPICS.projectChanged, 'project.changed', { id: projectId, action, visibility: 'PRIVATE' }, projectId)
  const p = await prisma.project.findUnique({ where: { id: projectId }, include: { _count: { select: { likes: true } } } })
  if (!p) return
  const owner = (await refs([p.ownerId])).get(p.ownerId)
  emit(
    bus,
    TOPICS.projectChanged,
    'project.changed',
    {
      id: p.id,
      action,
      visibility: p.status === 'ARCHIVED' ? 'PRIVATE' : p.visibility, // archived projects drop out of public search
      doc: { id: p.id, name: p.name, slug: p.slug, description: p.description ?? '', readme: (p.readme ?? '').slice(0, 5000), tags: p.tags, visibility: p.visibility, ownerId: p.ownerId, ownerName: owner?.name ?? '', stars: p._count.likes, createdAt: p.createdAt, updatedAt: p.updatedAt },
    },
    p.id
  )
}

export function pageParams(q: { page?: unknown; pageSize?: unknown }, def = 12, max = 50) {
  const page = Math.max(1, Math.floor(Number(q.page) || 1))
  const pageSize = Math.min(max, Math.max(1, Math.floor(Number(q.pageSize) || def)))
  return { page, pageSize, skip: (page - 1) * pageSize }
}

export type { ProjectRole }
