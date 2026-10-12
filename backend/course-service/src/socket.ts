import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { env } from './config/env'
import { prisma } from './lib/prisma'
import { verifyAccessToken } from './lib/tokens'

let io: Server | null = null

interface Participant {
    userId: string
    name: string
    color: string
}

interface RoomState {
    code: string
    language: string
    version: number
    participants: Map<string, Participant> // socket id -> participant
}

const rooms = new Map<string, RoomState>()
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const ROOM_ID = /^[a-zA-Z0-9_-]{1,64}$/
const MAX_CODE_LENGTH = 200_000

const presence = (room: RoomState) => [...room.participants.values()]

export function initSocket(server: HttpServer): Server {
    io = new Server(server, { cors: { origin: env.FRONTEND_URL, credentials: true } })

    // Every connection must present a valid access token
    io.use(async (socket, next) => {
        try {
            const { userId } = verifyAccessToken(String(socket.handshake.auth?.token ?? ''))
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } })
            if (!user) return next(new Error('Unauthorized'))
            socket.data.user = user
            next()
        } catch {
            next(new Error('Unauthorized'))
        }
    })

    io.on('connection', (socket) => {
        const user = socket.data.user as { id: string; name: string }
        socket.join(`user:${user.id}`) // personal channel for notifications

        socket.on('room:join', (roomId: unknown) => {
            if (typeof roomId !== 'string' || !ROOM_ID.test(roomId)) return
            const name = `room:${roomId}`
            if (socket.rooms.has(name)) return
            socket.join(name)

            const room = rooms.get(roomId) ?? { code: '', language: 'javascript', version: 0, participants: new Map() }
            room.participants.set(socket.id, { userId: user.id, name: user.name, color: COLORS[room.participants.size % COLORS.length] })
            rooms.set(roomId, room)

            socket.emit('room:state', { code: room.code, language: room.language, version: room.version })
            io!.to(name).emit('room:presence', presence(room))
        })

        socket.on('room:leave', (roomId: unknown) => {
            if (typeof roomId === 'string') leaveRoom(socket, roomId)
        })

        // Whole-document sync: the last writer wins, which is fine for short pair-programming sessions
        socket.on('code:change', (payload: { roomId?: string; code?: string; language?: string }) => {
            const { roomId, code, language } = payload ?? {}
            if (typeof roomId !== 'string' || typeof code !== 'string' || code.length > MAX_CODE_LENGTH) return
            const room = rooms.get(roomId)
            if (!room || !room.participants.has(socket.id)) return
            room.code = code
            if (typeof language === 'string') room.language = language.slice(0, 32)
            room.version += 1
            socket.to(`room:${roomId}`).emit('code:update', { code: room.code, language: room.language, version: room.version, from: user.id })
        })

        socket.on('room:output', (payload: { roomId?: string; output?: string }) => {
            const { roomId, output } = payload ?? {}
            if (typeof roomId !== 'string' || typeof output !== 'string' || output.length > 50_000) return
            if (!rooms.get(roomId)?.participants.has(socket.id)) return
            socket.to(`room:${roomId}`).emit('room:output', { output, from: user.name })
        })

        socket.on('disconnecting', () => {
            for (const name of socket.rooms) {
                if (name.startsWith('room:')) leaveRoom(socket, name.slice(5), false)
            }
        })
    })

    return io
}

function leaveRoom(socket: Socket, roomId: string, leave = true) {
    const room = rooms.get(roomId)
    if (!room) return
    room.participants.delete(socket.id)
    if (leave) socket.leave(`room:${roomId}`)
    if (room.participants.size === 0) rooms.delete(roomId)
    else io?.to(`room:${roomId}`).emit('room:presence', presence(room))
}

/** Pushes a realtime event to every open tab of a user. No-op before the socket server starts. */
export function emitToUser(userId: string, event: string, payload: unknown) {
    io?.to(`user:${userId}`).emit(event, payload)
}
