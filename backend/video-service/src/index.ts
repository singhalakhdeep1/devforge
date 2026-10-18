/**
 * Video calls: a mediasoup SFU with Socket.IO signalling at /video/socket.io (through the gateway)
 * and call rooms under /api/video. Media state lives in this process, so with several replicas a
 * room's participants must reach the same instance (sticky routing by room id).
 */
import os from 'node:os';
import { Router } from 'express';
import { Server as SocketServer } from 'socket.io';
import { z } from 'zod';
import { AppError, TOPICS, asyncHandler, authenticate, createEventBus, env, envInt, redisHealthy, startService, userOf, validate, verifyAccessToken } from '@devhub/shared';
import { logger } from './config/logger';
import { createWorkers } from './config/mediasoup';
import { VideoService } from './services/video.service';
import { setupVideoSocketHandlers } from './socket/videoHandlers';
import { canJoin, canManage, closeRoom, createRoom, getRoom, invite, publicRoom, roomsOf } from './rooms';

const bus = createEventBus('video');
let videoService: VideoService | undefined;
let io: SocketServer | undefined;

const live = () => {
    if (!videoService) throw new AppError(503, 'Media workers are starting', 'STARTING');
    return videoService;
};

const notifyInvited = (room: { id: string; name: string; ownerName?: string }, userIds: string[]) =>
    Promise.all(
        userIds.map((userId) =>
            bus.publish(TOPICS.notificationRequested, 'video.invite', { userId, type: 'video', title: `${room.ownerName ?? 'Someone'} invited you to a call`, body: room.name, link: `/video/${room.id}` }),
        ),
    ).catch((e) => logger.warn('invite notification failed', e));

const router = Router();
router.use(authenticate);

router.post(
    '/rooms',
    validate(z.object({ name: z.string().trim().min(1).max(80), scope: z.enum(['adhoc', 'board', 'document', 'project']).default('adhoc'), resourceId: z.string().min(1).optional(), invite: z.array(z.string().min(1)).max(50).optional(), maxPeers: z.number().int().min(2).max(50).optional() })),
    asyncHandler(async (req, res) => {
        const user = userOf(req)!;
        const room = await createRoom(user, req.body);
        if (room.invited.length) await notifyInvited(room, room.invited);
        res.status(201).json(publicRoom(room, user));
    }),
);

router.get('/rooms', asyncHandler(async (req, res) => {
    const user = userOf(req)!;
    const rooms = await roomsOf(user.id);
    res.json({ items: rooms.map((r) => ({ ...publicRoom(r, user), active: videoService?.getPeersInRoom(r.id).length ?? 0 })) });
}));

router.get('/rooms/:id', asyncHandler(async (req, res) => {
    const user = userOf(req)!;
    const room = await getRoom(req.params.id);
    if (!(await canJoin(room, user, req.query.code as string | undefined))) throw AppError.forbidden('You are not invited to this call');
    const stats = videoService?.hasRoom(room.id) ? await videoService.getRoomStats(room.id) : null;
    res.json({ ...publicRoom(room, user), participants: stats?.participants ?? [], peerCount: stats?.peerCount ?? 0 });
}));

router.post('/rooms/:id/invite', validate(z.object({ userIds: z.array(z.string().min(1)).min(1).max(50) })), asyncHandler(async (req, res) => {
    const user = userOf(req)!;
    const room = await getRoom(req.params.id);
    if (!canManage(room, user)) throw AppError.forbidden('Only the host can invite people');
    const added = await invite(room, req.body.userIds);
    if (added.length) await notifyInvited(room, added);
    res.json({ invited: room.invited, added });
}));

// the host ends the call for everyone
router.delete('/rooms/:id', asyncHandler(async (req, res) => {
    const user = userOf(req)!;
    const room = await getRoom(req.params.id);
    if (!canManage(room, user)) throw AppError.forbidden('Only the host can end the call');
    await closeRoom(room);
    videoService?.closeRoom(room.id);
    res.status(204).end();
}));

// legacy listing: active media rooms on this instance (admins)
router.get('/stats', asyncHandler(async (req, res) => {
    if (userOf(req)!.role !== 'ADMIN') throw AppError.forbidden();
    const svc = live();
    res.json({ rooms: await Promise.all(svc.getAllRooms().map((id) => svc.getRoomStats(id))), workers: envInt('NUM_WORKERS', Math.min(os.cpus().length, 2)) });
}));

void startService({
    name: 'video',
    trustProxy: true,
    routes: (app, server) => {
        app.use('/api/video', router);
        io = new SocketServer(server, {
            path: '/video/socket.io',
            cors: { origin: env('CORS_ORIGIN', env('FRONTEND_URL', 'http://localhost:3000')).split(',').map((s) => s.trim()), credentials: true },
            pingTimeout: 60000,
            pingInterval: 25000,
        });
        io.use((socket, next) => {
            const raw = String(socket.handshake.auth?.token ?? socket.handshake.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
            if (!raw) return next(new Error('Authentication required'));
            try {
                socket.data.user = verifyAccessToken(raw);
                next();
            } catch {
                next(new Error('Invalid or expired token'));
            }
        });
        io.use((_socket, next) => (videoService ? next() : next(new Error('Media workers are starting'))));
    },
    ready: { redis: () => redisHealthy(), media: async () => Boolean(videoService) },
    onStart: async () => {
        const workers = await createWorkers(envInt('NUM_WORKERS', Math.min(os.cpus().length, 2)));
        logger.info(`Created ${workers.length} mediasoup workers`);
        videoService = new VideoService(workers);
        setupVideoSocketHandlers(io!, videoService);
    },
    onStop: async () => {
        io?.close();
        await bus.close();
    },
});
