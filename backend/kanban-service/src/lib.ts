import { AppError, TOPICS, createEventBus, createServiceClient, emit, getRedis, publishRealtime } from '@devhub/shared'
import { prisma } from './db'
import type { Board, Prisma } from './generated/client'

export const bus = createEventBus('kanban')
const projects = createServiceClient('project')

/* ───────────── access: decided by the owning project ───────────── */

export interface ProjectAccess {
  projectId: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null
  canRead: boolean
  canWrite: boolean
  canAdmin: boolean
  ownerId: string
}

/** The project-service is the single source of truth; answers are cached briefly to keep boards snappy. */
export async function projectAccess(projectId: string, userId?: string): Promise<ProjectAccess> {
  const key = `kanban:access:${projectId}:${userId ?? 'anon'}`
  const redis = getRedis()
  const hit = await redis.get(key).catch(() => null)
  if (hit) return JSON.parse(hit)
  const a = await projects.get<ProjectAccess>(`/internal/projects/${projectId}/access/${userId ?? 'anonymous'}`)
  await redis.set(key, JSON.stringify(a), 'EX', 30).catch(() => undefined)
  return a
}

export async function projectMembers(projectId: string): Promise<Set<string>> {
  const key = `kanban:members:${projectId}`
  const redis = getRedis()
  const hit = await redis.get(key).catch(() => null)
  const data: { ownerId: string; members: { userId: string }[] } = hit ? JSON.parse(hit) : await projects.get(`/internal/projects/${projectId}/members`)
  if (!hit) await redis.set(key, JSON.stringify(data), 'EX', 30).catch(() => undefined)
  return new Set([data.ownerId, ...data.members.map((m) => m.userId)])
}

export interface BoardAccess {
  read: boolean
  write: boolean
  admin: boolean
}

export async function boardAccess(board: Pick<Board, 'projectId' | 'visibility'>, userId?: string): Promise<BoardAccess> {
  const a = await projectAccess(board.projectId, userId).catch((e: AppError) => {
    if (e.statusCode === 404) return null
    throw e
  })
  if (!a) return { read: false, write: false, admin: false }
  return { read: a.role !== null || (board.visibility === 'PUBLIC' && a.canRead), write: a.canWrite, admin: a.canAdmin }
}

export async function loadBoard(boardId: string, userId: string | undefined, need: 'read' | 'write' | 'admin') {
  if (!/^[0-9a-f-]{36}$/i.test(boardId)) throw AppError.notFound('Board not found')
  const board = await prisma.board.findUnique({ where: { id: boardId } })
  if (!board) throw AppError.notFound('Board not found')
  const access = await boardAccess(board, userId)
  if (!access.read) throw AppError.notFound('Board not found') // do not reveal private boards
  if (need === 'write' && !access.write) throw AppError.forbidden('You have view-only access to this board')
  if (need === 'admin' && !access.admin) throw AppError.forbidden('Only project admins can change the board structure')
  return { board, access }
}

/* ───────────── people ───────────── */

export type Ref = { id: string; name: string; avatar: string | null }
export async function refs(ids: (string | null | undefined)[]): Promise<Map<string, Ref>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))]
  const rows = unique.length ? await prisma.userRef.findMany({ where: { id: { in: unique } } }) : []
  const map = new Map<string, Ref>(rows.map((r) => [r.id, { id: r.id, name: r.name, avatar: r.avatar }]))
  for (const id of unique) if (!map.has(id)) map.set(id, { id, name: 'Former member', avatar: null })
  return map
}
export const ensureRef = (u: { id: string; name?: string }) => prisma.userRef.upsert({ where: { id: u.id }, update: {}, create: { id: u.id, name: u.name || 'Member' } }).catch(() => undefined)

/* ───────────── ordering ───────────── */

type Orderable = { id: string; order: number }

/**
 * Position for an item dropped at `index` among `siblings` (already ordered, without the moved item).
 * Fractional: only the moved item is written. Returns null when the gap got too small to split, in which
 * case the caller renumbers the list once and asks again.
 */
export function orderAt(siblings: Orderable[], index: number): number | null {
  const i = Math.max(0, Math.min(index, siblings.length))
  const before = siblings[i - 1]?.order
  const after = siblings[i]?.order
  if (before === undefined && after === undefined) return 1
  if (before === undefined) return after! - 1
  if (after === undefined) return before + 1
  const mid = (before + after) / 2
  return Math.abs(after - before) < 1e-6 ? null : mid
}

export async function renumberTasks(tx: Prisma.TransactionClient, columnId: string) {
  const rows = await tx.task.findMany({ where: { columnId }, orderBy: { order: 'asc' }, select: { id: true } })
  for (let i = 0; i < rows.length; i++) await tx.task.update({ where: { id: rows[i].id }, data: { order: i + 1 } })
}

export async function renumberColumns(tx: Prisma.TransactionClient, boardId: string) {
  const rows = await tx.column.findMany({ where: { boardId }, orderBy: { order: 'asc' }, select: { id: true } })
  for (let i = 0; i < rows.length; i++) await tx.column.update({ where: { id: rows[i].id }, data: { order: i + 1 } })
}

/* ───────────── side effects ───────────── */

export async function logActivity(boardId: string, userId: string, action: string, taskId?: string, detail: Record<string, unknown> = {}) {
  await prisma.activity.create({ data: { boardId, userId, taskId, action, detail: detail as Prisma.InputJsonValue } }).catch(() => undefined)
}

/** Tell everyone looking at this board. Best effort: the data is already saved. */
export function live(boardId: string, event: string, payload: unknown) {
  void publishRealtime({ room: `board:${boardId}`, event, payload })
}

export function notify(userId: string, title: string, body: string, link: string) {
  emit(bus, TOPICS.notificationRequested, 'notification.requested', { userId, type: 'task', title, body, link }, userId)
}

export function taskChanged(boardId: string, taskId: string, action: string, actor: string, extra: Record<string, unknown> = {}) {
  emit(bus, TOPICS.taskChanged, 'task.changed', { boardId, taskId, action, actor, ...extra }, taskId)
}

export const initialsPrefix = (name: string) => {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean)
  const p = words.length > 1 ? words.slice(0, 4).map((w) => w[0]).join('') : (words[0] ?? 'TSK').slice(0, 4)
  return p.toUpperCase().slice(0, 5) || 'TSK'
}
