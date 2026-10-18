import { Server as SocketServer, Socket } from 'socket.io';
import type { AuthUser } from '@devhub/shared';
import { VideoService } from '../services/video.service';
import { logger } from '../config/logger';
import { canJoin, getRoom } from '../rooms';

type Ack = (res: unknown) => void;

/**
 * Signalling for the SFU. The socket is authenticated at connection time (see index.ts), and the
 * room and peer id are fixed by the server when the client joins: `roomId` / `peerId` sent with
 * later events are ignored, so a client can only act as itself in the room it joined.
 */
export function setupVideoSocketHandlers(io: SocketServer, videoService: VideoService) {
    io.on('connection', (socket: Socket) => {
        const user = socket.data.user as AuthUser;
        logger.info(`Client connected: ${socket.id}`, { userId: user.id });

        let currentRoomId: string | null = null;
        let currentPeerId: string | null = null;

        const ack = (cb: unknown): Ack => (typeof cb === 'function' ? (cb as Ack) : () => undefined);

        /** Runs a handler that needs a joined room; errors go back through the acknowledgement. */
        const inRoom = (event: string, fn: (roomId: string, peerId: string, payload: any) => Promise<unknown>) =>
            socket.on(event, async (payload: any, callback?: unknown) => {
                const reply = ack(callback);
                if (!currentRoomId || !currentPeerId) return reply({ error: 'Join a room first' });
                try {
                    reply((await fn(currentRoomId, currentPeerId, payload ?? {})) ?? { success: true });
                } catch (error) {
                    logger.warn(`${event} failed`, error);
                    reply({ error: (error as Error).message || `Failed: ${event}` });
                }
            });

        /**
         * Join a room: { roomId, code? } → { peerId, rtpCapabilities, existingPeers, producers }
         */
        socket.on('join', async ({ roomId, code }: { roomId?: string; code?: string } = {}, callback?: unknown) => {
            const reply = ack(callback);
            try {
                if (currentRoomId) return reply({ error: 'Already in a call; leave it first' });
                const room = await getRoom(String(roomId ?? ''));
                if (!(await canJoin(room, user, code))) return reply({ error: 'You are not invited to this call' });
                if (videoService.getPeersInRoom(room.id).length >= room.maxPeers) return reply({ error: `This call is full (${room.maxPeers} people)` });

                const peerId = `${user.id}:${socket.id}`;
                await videoService.addPeer(room.id, peerId, socket, { userId: user.id, name: user.name });
                currentRoomId = room.id;
                currentPeerId = peerId;
                socket.join(room.id);

                const existingPeers = videoService.getPeersInRoom(room.id).filter((id) => id !== peerId);
                reply({
                    peerId,
                    room: { id: room.id, name: room.name, scope: room.scope, resourceId: room.resourceId, ownerId: room.ownerId },
                    rtpCapabilities: await videoService.getRouterRtpCapabilities(room.id),
                    existingPeers,
                    participants: (await videoService.getRoomStats(room.id)).participants,
                    producers: videoService.getProducersInRoom(room.id, peerId),
                });
                socket.to(room.id).emit('newPeer', { peerId, userId: user.id, name: user.name });
                logger.info(`Peer ${peerId} joined room ${room.id}`);
            } catch (error) {
                logger.warn('Join error', error);
                reply({ error: (error as Error).message || 'Failed to join room' });
            }
        });

        inRoom('createTransport', (roomId, peerId, { direction }) => {
            if (direction !== 'send' && direction !== 'recv') throw new Error('direction must be "send" or "recv"');
            return videoService.createWebRtcTransport(roomId, peerId, direction);
        });

        inRoom('connectTransport', async (roomId, peerId, { transportId, dtlsParameters }) => {
            await videoService.connectTransport(roomId, peerId, transportId, dtlsParameters);
            return { success: true };
        });

        inRoom('produce', async (roomId, peerId, { transportId, kind, rtpParameters, appData }) => {
            if (kind !== 'audio' && kind !== 'video') throw new Error('kind must be "audio" or "video"');
            const source = ['mic', 'webcam', 'screen'].includes(appData?.source) ? appData.source : kind === 'audio' ? 'mic' : 'webcam';
            return videoService.produce(roomId, peerId, transportId, kind, rtpParameters, { source });
        });

        inRoom('consume', (roomId, peerId, { producerPeerId, producerId, rtpCapabilities }) =>
            videoService.consume(roomId, peerId, producerPeerId, producerId, rtpCapabilities),
        );

        inRoom('resumeConsumer', async (roomId, peerId, { consumerId }) => {
            await videoService.resumeConsumer(roomId, peerId, consumerId);
            return { success: true };
        });

        inRoom('pauseProducer', async (roomId, peerId, { producerId }) => {
            await videoService.pauseProducer(roomId, peerId, producerId);
            return { success: true };
        });

        inRoom('resumeProducer', async (roomId, peerId, { producerId }) => {
            await videoService.resumeProducer(roomId, peerId, producerId);
            return { success: true };
        });

        inRoom('closeProducer', async (roomId, peerId, { producerId }) => {
            await videoService.closeProducer(roomId, peerId, producerId);
            return { success: true };
        });

        inRoom('getRoomStats', (roomId) => videoService.getRoomStats(roomId));

        /**
         * In-call chat and status signals, relayed to the others in the room
         */
        socket.on('chatMessage', ({ message }: { message?: string } = {}) => {
            const text = String(message ?? '').trim().slice(0, 2000);
            if (!currentRoomId || !text) return;
            socket.to(currentRoomId).emit('chatMessage', { peerId: currentPeerId, userId: user.id, name: user.name, message: text, timestamp: new Date() });
        });

        const relay = (incoming: string, outgoing: string) =>
            socket.on(incoming, () => {
                if (currentRoomId) socket.to(currentRoomId).emit(outgoing, { peerId: currentPeerId, userId: user.id, name: user.name });
            });
        relay('screenShareStarted', 'screenShareStarted');
        relay('screenShareStopped', 'screenShareStopped');
        relay('raiseHand', 'handRaised');
        relay('lowerHand', 'handLowered');

        const leave = async () => {
            if (!currentRoomId || !currentPeerId) return;
            const roomId = currentRoomId;
            const peerId = currentPeerId;
            currentRoomId = null;
            currentPeerId = null;
            socket.leave(roomId);
            await videoService.removePeer(roomId, peerId);
        };

        socket.on('leave', async (_payload: unknown, callback?: unknown) => {
            try {
                await leave();
                ack(callback)({ success: true });
            } catch (error) {
                logger.error('Leave error:', error);
                ack(callback)({ error: 'Failed to leave room' });
            }
        });

        socket.on('disconnect', async () => {
            logger.info(`Client disconnected: ${socket.id}`);
            await leave().catch((error) => logger.error('Disconnect cleanup error:', error));
        });
    });
}
