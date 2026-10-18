/**
 * Call rooms. A room is created by a signed-in user and is either ad hoc (owner, invited people and
 * holders of its invite code may join) or attached to a board, document or project, in which case
 * everyone who can read that resource may join. Room records live in Redis with a TTL, so every
 * replica sees them; the media itself is routed by mediasoup in ./services/video.service.
 */
import crypto from 'node:crypto'
import { AppError, createServiceClient, envInt, getRedis, type AuthUser } from '@devhub/shared'

export type RoomScope = 'adhoc' | 'board' | 'document' | 'project'

export interface RoomRecord {
  id: string
  name: string
  scope: RoomScope
  resourceId?: string
  ownerId: string
  ownerName?: string
  inviteCode: string
  invited: string[]
  maxPeers: number
  createdAt: string
  closedAt?: string
}

const KEY = (id: string) => `devforge:video:room:${id}`
const USER_KEY = (userId: string) => `devforge:video:user:${userId}:rooms`
const TTL_S = () => envInt('VIDEO_ROOM_TTL_HOURS', 24) * 3600

const kanban = createServiceClient('kanban')
const editor = createServiceClient('editor')
const projects = createServiceClient('project')

export async function createRoom(owner: AuthUser, input: { name: string; scope: RoomScope; resourceId?: string; invite?: string[]; maxPeers?: number }): Promise<RoomRecord> {
  if (input.scope !== 'adhoc') {
    if (!input.resourceId) throw AppError.badRequest(`resourceId is required for a ${input.scope} room`)
    if (!(await canReadResource(input.scope, input.resourceId, owner.id))) throw AppError.forbidden(`You cannot open a call on this ${input.scope}`)
  }
  const room: RoomRecord = {
    id: crypto.randomUUID(),
    name: input.name,
    scope: input.scope,
    resourceId: input.resourceId,
    ownerId: owner.id,
    ownerName: owner.name,
    inviteCode: crypto.randomBytes(12).toString('base64url'),
    invited: [...new Set((input.invite ?? []).filter((id) => id !== owner.id))],
    maxPeers: Math.min(input.maxPeers ?? envInt('VIDEO_MAX_PEERS', 16), envInt('VIDEO_MAX_PEERS', 16)),
    createdAt: new Date().toISOString(),
  }
  await save(room)
  return room
}

async function save(room: RoomRecord) {
  const ttl = TTL_S()
  const multi = getRedis().multi().set(KEY(room.id), JSON.stringify(room), 'EX', ttl)
  for (const uid of [room.ownerId, ...room.invited]) multi.sadd(USER_KEY(uid), room.id).expire(USER_KEY(uid), ttl)
  await multi.exec()
}

export async function getRoom(id: string): Promise<RoomRecord> {
  const raw = /^[0-9a-f-]{36}$/.test(id) ? await getRedis().get(KEY(id)) : null
  if (!raw) throw AppError.notFound('Call not found or ended')
  const room = JSON.parse(raw) as RoomRecord
  if (room.closedAt) throw AppError.notFound('Call not found or ended')
  return room
}

async function canReadResource(scope: RoomScope, resourceId: string, userId: string): Promise<boolean> {
  try {
    if (scope === 'board') return (await kanban.get<{ canRead: boolean }>(`/internal/boards/${resourceId}/access/${userId}`)).canRead
    if (scope === 'document') return Boolean((await editor.get<{ access: string | null }>(`/internal/documents/${resourceId}/access/${userId}`)).access)
    if (scope === 'project') return (await projects.get<{ canRead: boolean }>(`/internal/projects/${resourceId}/access/${userId}`)).canRead
  } catch (e) {
    if ((e as AppError).statusCode === 404) return false
    throw e
  }
  return false
}

const digest = (s: string) => crypto.createHash('sha256').update(s).digest()

export const canManage =(room: RoomRecord, user: AuthUser) => room.ownerId === user.id || user.role === 'ADMIN'

/** Whether the user may join; an ad hoc room also admits whoever presents its invite code. */
export async function canJoin(room: RoomRecord, user: AuthUser, inviteCode?: string): Promise<boolean> {
  if (canManage(room, user) || room.invited.includes(user.id)) return true
  if (room.scope === 'adhoc') return Boolean(inviteCode) && crypto.timingSafeEqual(digest(String(inviteCode)), digest(room.inviteCode))
  return canReadResource(room.scope, room.resourceId!, user.id)
}

export async function invite(room: RoomRecord, userIds: string[]): Promise<string[]> {
  const added = userIds.filter((id) => id !== room.ownerId && !room.invited.includes(id))
  room.invited.push(...added)
  await save(room)
  return added
}

export async function closeRoom(room: RoomRecord) {
  room.closedAt = new Date().toISOString()
  await getRedis().set(KEY(room.id), JSON.stringify(room), 'EX', 3600)
}

/** Rooms the user owns or was invited to that are still open. */
export async function roomsOf(userId: string): Promise<RoomRecord[]> {
  const ids = await getRedis().smembers(USER_KEY(userId))
  if (!ids.length) return []
  const raws = await getRedis().mget(ids.map(KEY))
  const stale = ids.filter((_, i) => !raws[i])
  if (stale.length) await getRedis().srem(USER_KEY(userId), ...stale)
  return raws.filter((r): r is string => Boolean(r)).map((r) => JSON.parse(r) as RoomRecord).filter((r) => !r.closedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** What other people see of a room (the invite code only for those who can manage it). */
export const publicRoom = (room: RoomRecord, viewer: AuthUser) => {
  const { inviteCode, ...rest } = room
  return canManage(room, viewer) ? { ...rest, inviteCode, joinLink: `/video/${room.id}?code=${inviteCode}` } : rest
}
