import { createAdapter } from '@socket.io/redis-adapter'
import { Server, type Socket } from 'socket.io'
import {
    PRESENCE_CHANNEL,
    PRESENCE_KEY,
    REALTIME_CHANNEL,
    createLogger,
    createRedis,
    createServiceClient,
    env,
    getRedis,
    redisHealthy,
    startService,
    verifyAccessToken,
    websocketConnections,
    websocketMessages,
    type RealtimeMessage,
} from '@devhub/shared'

const log = createLogger('websocket')

interface Participant {
    userId: string
    name: string
    color: string
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const ROOM_ID = /^[a-zA-Z0-9_-]{1,64}$/
const MAX_CODE_LENGTH = 200_000
const ROOM_TTL_SECONDS = 6 * 3600
const roomKey = (id: string) => `editor:room:${id}`

void startService({
    name: 'websocket',
    cors: false,
    trustProxy: true,
    ready: { redis: () => redisHealthy() },
    routes: async (_app, server) => {
        const origins = env('CORS_ORIGIN', 'http://localhost:3000').split(',').map((s) => s.trim())
        const io = new Server(server, {
            cors: { origin: origins, credentials: true },
            pingTimeout: 60_000,
            pingInterval: 25_000,
            maxHttpBufferSize: 1_000_000,
        })

        // Several websocket-server instances share rooms through Redis
        const pub = createRedis({ name: 'ws-adapter-pub' })
        const sub = pub.duplicate()
        sub.on('error', () => undefined)
        io.adapter(createAdapter(pub, sub))

        // Every connection must present a valid access token
        io.use((socket, next) => {
            try {
                const u = verifyAccessToken(String(socket.handshake.auth?.token ?? ''))
                socket.data.user = { id: u.id, name: u.name || u.email || 'Anonymous', role: u.role }
                next()
            } catch {
                next(new Error('Unauthorized'))
            }
        })

        // Presence: open connections per user, shared by every instance; changes are announced for GraphQL subscribers
        const presence = createRedis({ name: 'ws-presence' })
        const announce = (u: { id: string; name: string }, online: boolean) =>
            presence.publish(PRESENCE_CHANNEL, JSON.stringify({ userId: u.id, name: u.name, online, at: new Date().toISOString() })).catch(() => undefined)
        const adjust = async (u: { id: string; name: string }, by: 1 | -1) => {
            const prev = Number(((await presence.hget(PRESENCE_KEY, u.id)) ?? '0').split('|')[0]) || 0
            const next = Math.max(prev + by, 0)
            await presence.hset(PRESENCE_KEY, u.id, `${next}|${u.name}`)
            if ((prev === 0) !== (next === 0)) await announce(u, next > 0)
        }

        io.on('connection', (socket) => {
            const user = socket.data.user as { id: string; name: string; role: string }
            socket.join(`user:${user.id}`) // personal channel: notifications and anything addressed to this user
            websocketConnections.inc({ service: 'websocket' })
            void adjust(user, 1).catch(() => undefined)
            socket.on('disconnect', () => {
                websocketConnections.dec({ service: 'websocket' })
                void adjust(user, -1).catch(() => undefined)
            })
            registerEditorHandlers(io, socket, user)
            registerGenericRooms(io, socket, user)
        })

        // Services publish to this channel; we deliver to whoever is in the room, on any instance
        const bridge = createRedis({ name: 'ws-bridge' })
        await bridge.subscribe(REALTIME_CHANNEL)
        bridge.on('message', (_channel, raw) => {
            try {
                const m = JSON.parse(raw) as RealtimeMessage
                if (typeof m.room === 'string' && typeof m.event === 'string') {
                    io.to(m.room).emit(m.event, m.payload)
                    websocketMessages.inc({ direction: 'out', event_type: m.event, service: 'websocket' })
                }
            } catch {
                log.logWarning('dropped malformed realtime message')
            }
        })
        log.logInformation('realtime hub ready')
    },
}).catch((e) => {
    console.error('websocket-server failed to start', e)
    process.exit(1)
})

/* ───────────────────────── collaborative editor rooms ───────────────────────── */

async function presence(io: Server, roomId: string): Promise<Participant[]> {
    const sockets = await io.in(`room:${roomId}`).fetchSockets()
    return sockets.map((s) => s.data.participant as Participant).filter(Boolean)
}

function registerEditorHandlers(io: Server, socket: Socket, user: { id: string; name: string }) {
    const redis = getRedis()

    socket.on('room:join', async (roomId: unknown) => {
        if (typeof roomId !== 'string' || !ROOM_ID.test(roomId)) return
        const name = `room:${roomId}`
        if (socket.rooms.has(name)) return

        const count = (await io.in(name).fetchSockets()).length
        socket.data.participant = { userId: user.id, name: user.name, color: COLORS[count % COLORS.length] } satisfies Participant
        await socket.join(name)

        const state = await redis.hgetall(roomKey(roomId))
        socket.emit('room:state', { code: state.code ?? '', language: state.language ?? 'javascript', version: Number(state.version ?? 0) })
        io.to(name).emit('room:presence', await presence(io, roomId))
    })

    socket.on('room:leave', async (roomId: unknown) => {
        if (typeof roomId !== 'string' || !ROOM_ID.test(roomId)) return
        await socket.leave(`room:${roomId}`)
        io.to(`room:${roomId}`).emit('room:presence', await presence(io, roomId))
    })

    // Whole-document sync: the last writer wins, which suits short pair-programming sessions
    socket.on('code:change', async (payload: { roomId?: string; code?: string; language?: string }) => {
        const { roomId, code, language } = payload ?? {}
        if (typeof roomId !== 'string' || !ROOM_ID.test(roomId) || typeof code !== 'string' || code.length > MAX_CODE_LENGTH) return
        if (!socket.rooms.has(`room:${roomId}`)) return
        const key = roomKey(roomId)
        const lang = typeof language === 'string' ? language.slice(0, 32) : undefined
        const version = await redis.hincrby(key, 'version', 1)
        await redis.hset(key, 'code', code, ...(lang ? ['language', lang] : []))
        await redis.expire(key, ROOM_TTL_SECONDS)
        socket.to(`room:${roomId}`).emit('code:update', { code, language: lang ?? (await redis.hget(key, 'language')) ?? 'javascript', version, from: user.id })
        websocketMessages.inc({ direction: 'in', event_type: 'code:change', service: 'websocket' })
    })

    socket.on('room:output', (payload: { roomId?: string; output?: string }) => {
        const { roomId, output } = payload ?? {}
        if (typeof roomId !== 'string' || typeof output !== 'string' || output.length > 50_000) return
        if (!socket.rooms.has(`room:${roomId}`)) return
        socket.to(`room:${roomId}`).emit('room:output', { output, from: user.name })
    })

    socket.on('disconnecting', () => {
        for (const name of socket.rooms) {
            if (!name.startsWith('room:')) continue
            const roomId = name.slice(5)
            // the socket is still counted while "disconnecting"; recompute after it has left
            setTimeout(() => void presence(io, roomId).then((p) => io.to(name).emit('room:presence', p)), 50)
        }
    })
}

/* ───────────────────── generic rooms (boards, projects, chat) ───────────────────── */

/**
 * Rooms other than editor rooms are scoped to a resource ("board:<id>", "project:<id>"). Joining
 * is allowed only if the owning service confirms membership; until a resource type is wired to a
 * checker, joins for it are refused.
 */
type Checker = (user: { id: string; role: string }, resourceId: string) => Promise<boolean>
export const roomCheckers: Record<string, Checker> = {}

// Boards and projects: the owning service decides who may listen in (and says no if it cannot answer)
const kanban = createServiceClient('kanban')
const projects = createServiceClient('project')
roomCheckers.board = async (user, id) => (await kanban.get<{ canRead: boolean }>(`/internal/boards/${id}/access/${user.id}`)).canRead
roomCheckers.project = async (user, id) => (await projects.get<{ canRead: boolean }>(`/internal/projects/${id}/access/${user.id}`)).canRead

function registerGenericRooms(io: Server, socket: Socket, user: { id: string; name: string; role: string }) {
    socket.on('join_room', async (roomId: unknown, ack?: (r: { ok: boolean }) => void) => {
        const m = typeof roomId === 'string' ? /^([a-z]+):([\w-]{1,64})$/.exec(roomId) : null
        const checker = m && roomCheckers[m[1]]
        let ok = false
        try {
            ok = Boolean(checker && (await checker(user, m![2])))
        } catch {
            ok = false
        }
        if (ok) {
            await socket.join(roomId as string)
            socket.to(roomId as string).emit('user_joined', { userId: user.id })
        }
        ack?.({ ok })
    })

    socket.on('leave_room', async (roomId: unknown) => {
        if (typeof roomId !== 'string') return
        await socket.leave(roomId)
        socket.to(roomId).emit('user_left', { userId: user.id })
    })

    socket.on('typing', (data: { roomId?: string; isTyping?: boolean }) => {
        if (typeof data?.roomId === 'string' && socket.rooms.has(data.roomId)) {
            socket.to(data.roomId).emit('typing', { userId: user.id, isTyping: Boolean(data.isTyping) })
        }
    })
}
