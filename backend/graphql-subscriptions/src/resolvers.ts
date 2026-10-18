/**
 * Subscription resolvers for the GraphQL API. One RealtimeHub per process listens to:
 *  - the Redis realtime channel every service publishes to (board rooms, user rooms),
 *  - the presence channel the websocket-server announces online/offline changes on,
 *  - the event bus (document changes, analytics events),
 * and fans them out to subscribers through an in-memory PubSub. Access is checked when a
 * subscription starts (board / document access via the owning service) and per event.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PubSub, withFilter } from 'graphql-subscriptions'
import {
  AppError,
  PRESENCE_CHANNEL,
  REALTIME_CHANNEL,
  TOPICS,
  createEventBus,
  createLogger,
  createRedis,
  createServiceClient,
  type AuthUser,
  type PresenceChange,
  type RealtimeMessage,
} from '@devhub/shared'

/** The SDL in schema.graphql (read once; it ships next to the compiled code). */
export const subscriptionTypeDefs = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8')

const log = createLogger('graphql-subscriptions')

export const TRIGGERS = {
  board: 'BOARD_EVENT',
  notification: 'NOTIFICATION',
  document: 'DOCUMENT_CHANGED',
  analytics: 'ANALYTICS_TRACKED',
  presence: 'PRESENCE_CHANGED',
} as const

export interface SubscriptionContext {
  user?: AuthUser
}

export class RealtimeHub {
  readonly pubsub = new PubSub()
  private started = false
  private readonly closers: (() => Promise<unknown>)[] = []

  async start() {
    if (this.started) return
    this.started = true
    const sub = createRedis({ name: 'graphql-realtime' })
    await sub.subscribe(REALTIME_CHANNEL, PRESENCE_CHANNEL)
    sub.on('message', (channel, raw) => {
      try {
        if (channel === PRESENCE_CHANNEL) return void this.pubsub.publish(TRIGGERS.presence, JSON.parse(raw) as PresenceChange)
        const m = JSON.parse(raw) as RealtimeMessage
        if (m.room.startsWith('board:')) void this.pubsub.publish(TRIGGERS.board, { boardId: m.room.slice(6), type: m.event, payload: m.payload })
        else if (m.room.startsWith('user:') && m.event === 'notification') void this.pubsub.publish(TRIGGERS.notification, { userId: m.room.slice(5), notification: m.payload })
      } catch {
        log.logWarning('dropped a malformed realtime message')
      }
    })
    this.closers.push(() => sub.quit())

    // a consumer group per graphql-api instance: every instance must see every event for its own subscribers
    const bus = createEventBus('graphql-api')
    const group = `graphql-api-${process.env.HOSTNAME ?? process.pid}`
    await bus.subscribe(TOPICS.documentChanged, group, (e) => this.pubsub.publish(TRIGGERS.document, e.data))
    await bus.subscribe(TOPICS.analyticsTracked, group, (e) => this.pubsub.publish(TRIGGERS.analytics, { ...e.data, at: e.timestamp }))
    this.closers.push(() => bus.close())
    log.logInformation('realtime hub listening')
  }

  async close() {
    for (const c of this.closers) await c().catch(() => undefined)
  }
}

const kanban = createServiceClient('kanban')
const editor = createServiceClient('editor')

const signedIn = (ctx: SubscriptionContext): AuthUser => {
  if (!ctx.user) throw AppError.unauthorized('Sign in to subscribe')
  return ctx.user
}

async function assertBoard(boardId: string, user: AuthUser | undefined) {
  const a = await kanban.get<{ canRead: boolean }>(`/internal/boards/${boardId}/access/${user?.id ?? 'anonymous'}`).catch(() => ({ canRead: false }))
  if (!a.canRead) throw AppError.forbidden('You cannot view this board')
}

async function canSeeDocument(documentId: string, userId: string) {
  const r = await editor.get<{ access: string | null }>(`/internal/documents/${documentId}/access/${userId}`).catch(() => ({ access: null }))
  return Boolean(r.access)
}

type BoardPayload = { boardId: string; type: string; payload: any }
const card = (p: BoardPayload) => {
  const t = p.payload?.task ?? p.payload ?? {}
  return { id: t.id ?? p.payload?.id, boardId: p.boardId, title: t.title, description: t.description, columnId: t.columnId, position: t.position, priority: t.priority, assigneeId: t.assigneeId ?? t.assignee?.id, updatedAt: t.updatedAt, raw: p.payload }
}

/** Builds a subscription that checks access once at start, then filters each event. */
const filtered = <A>(hub: RealtimeHub, trigger: string, start: (args: A, ctx: SubscriptionContext) => Promise<void> | void, filter: (payload: any, args: A, ctx: SubscriptionContext) => boolean | Promise<boolean>) => ({
  subscribe: async (_: unknown, args: A, ctx: SubscriptionContext, info: unknown) => {
    await start(args, ctx)
    return withFilter(() => hub.pubsub.asyncIterator(trigger), (payload, a, c) => filter(payload, a as A, c as SubscriptionContext))(_, args, ctx, info as never)
  },
})

export function createSubscriptionResolvers(hub: RealtimeHub) {
  return {
    Subscription: {
      documentUpdated: {
        ...filtered<{ documentId: string }>(hub, TRIGGERS.document,
          async ({ documentId }, ctx) => { if (!(await canSeeDocument(documentId, signedIn(ctx).id))) throw AppError.forbidden('You cannot view this document') },
          (d, { documentId }) => d.id === documentId && d.action !== 'created'),
        resolve: (d: any) => ({ documentId: d.id, action: d.action, title: d.title, ownerId: d.ownerId, updatedBy: d.userId, updatedAt: new Date().toISOString() }),
      },
      documentCreated: {
        ...filtered<{ userId: string }>(hub, TRIGGERS.document,
          ({ userId }, ctx) => { if (signedIn(ctx).id !== userId && ctx.user?.role !== 'ADMIN') throw AppError.forbidden('You can only follow your own documents') },
          (d, { userId }) => d.action === 'created' && d.ownerId === userId),
        resolve: (d: any) => ({ documentId: d.id, action: d.action, title: d.title, ownerId: d.ownerId, updatedBy: d.userId, updatedAt: new Date().toISOString() }),
      },
      cardAdded: {
        ...filtered<{ boardId: string }>(hub, TRIGGERS.board, ({ boardId }, ctx) => assertBoard(boardId, ctx.user), (p: BoardPayload, { boardId }) => p.boardId === boardId && p.type === 'task:created'),
        resolve: card,
      },
      cardUpdated: {
        ...filtered<{ boardId: string; cardId?: string }>(hub, TRIGGERS.board, ({ boardId }, ctx) => assertBoard(boardId, ctx.user),
          (p: BoardPayload, { boardId, cardId }) => p.boardId === boardId && (p.type === 'task:updated' || p.type === 'task:moved') && (!cardId || card(p).id === cardId)),
        resolve: card,
      },
      cardDeleted: {
        ...filtered<{ boardId: string }>(hub, TRIGGERS.board, ({ boardId }, ctx) => assertBoard(boardId, ctx.user), (p: BoardPayload, { boardId }) => p.boardId === boardId && p.type === 'task:deleted'),
        resolve: (p: BoardPayload) => card(p).id,
      },
      boardEvents: {
        ...filtered<{ boardId: string }>(hub, TRIGGERS.board, ({ boardId }, ctx) => assertBoard(boardId, ctx.user), (p: BoardPayload, { boardId }) => p.boardId === boardId),
        resolve: (p: BoardPayload) => p,
      },
      notificationReceived: {
        ...filtered<{ userId: string }>(hub, TRIGGERS.notification,
          ({ userId }, ctx) => { if (signedIn(ctx).id !== userId) throw AppError.forbidden('You can only receive your own notifications') },
          (p, { userId }) => p.userId === userId),
        resolve: (p: any) => {
          const n = p.notification ?? {}
          return { id: n.id ?? n._id, userId: p.userId, type: n.type, title: n.title, message: n.message ?? n.body, link: n.link ?? n.actionUrl, read: Boolean(n.read ?? n.readAt), createdAt: n.createdAt }
        },
      },
      analyticsUpdated: {
        ...filtered<{ userId?: string }>(hub, TRIGGERS.analytics,
          (_a, ctx) => { if (signedIn(ctx).role !== 'ADMIN') throw AppError.forbidden('Only admins can watch analytics') },
          (e, { userId }) => !userId || e.userId === userId),
        resolve: (e: any) => ({ userId: e.userId ?? null, type: e.type ?? e.event ?? 'event', name: e.name ?? e.event ?? null, path: e.path ?? e.page ?? null, properties: e.properties ?? null, at: e.at }),
      },
      userOnline: {
        ...filtered<{ userId?: string }>(hub, TRIGGERS.presence, (_a, ctx) => void signedIn(ctx), (p: PresenceChange, { userId }) => p.online && (!userId || p.userId === userId)),
        resolve: (p: PresenceChange) => ({ userId: p.userId, name: p.name, status: 'online', lastSeen: p.at }),
      },
      userOffline: {
        ...filtered<{ userId?: string }>(hub, TRIGGERS.presence, (_a, ctx) => void signedIn(ctx), (p: PresenceChange, { userId }) => !p.online && (!userId || p.userId === userId)),
        resolve: (p: PresenceChange) => ({ userId: p.userId, name: p.name, status: 'offline', lastSeen: p.at }),
      },
    },
  }
}
