import { Server as SocketServer, Socket } from 'socket.io';
import { VideoService } from '../services/video.service';
import { logger } from '../config/logger';
import { types as mediasoupTypes } from 'mediasoup';

export function setupVideoSocketHandlers(io: SocketServer, videoService: VideoService) {
    io.on('connection', (socket: Socket) => {
        logger.info(`Client connected: ${socket.id}`);

        let currentRoomId: string | null = null;
        let currentPeerId: string | null = null;

        /**
         * Join a room
         */
        socket.on('join', async ({ roomId, peerId }, callback) => {
            try {
                currentRoomId = roomId;
                currentPeerId = peerId;

                // Join socket room
                socket.join(roomId);

                // Add peer to video service
                await videoService.addPeer(roomId, peerId, socket);

                // Get router RTP capabilities
                const rtpCapabilities = await videoService.getRouterRtpCapabilities(roomId);

                // Get existing peers
                const existingPeers = videoService.getPeersInRoom(roomId).filter(id => id !== peerId);

                logger.info(`Peer ${peerId} joined room ${roomId}`);

                callback({
                    rtpCapabilities,
                    existingPeers,
                });

                // Notify other peers
                socket.to(roomId).emit('newPeer', { peerId });
            } catch (error) {
                logger.error('Join error:', error);
                callback({ error: 'Failed to join room' });
            }
        });

        /**
         * Create WebRTC transport
         */
        socket.on('createTransport', async ({ roomId, peerId, direction }, callback) => {
            try {
                const transportParams = await videoService.createWebRtcTransport(
                    roomId,
                    peerId,
                    direction
                );

                callback(transportParams);
            } catch (error) {
                logger.error('Create transport error:', error);
                callback({ error: 'Failed to create transport' });
            }
        });

        /**
         * Connect transport
         */
        socket.on('connectTransport', async ({ roomId, peerId, transportId, dtlsParameters }, callback) => {
            try {
                await videoService.connectTransport(roomId, peerId, transportId, dtlsParameters);
                callback({ success: true });
            } catch (error) {
                logger.error('Connect transport error:', error);
                callback({ error: 'Failed to connect transport' });
            }
        });

        /**
         * Produce media
         */
        socket.on('produce', async ({ roomId, peerId, transportId, kind, rtpParameters, appData }, callback) => {
            try {
                const { id } = await videoService.produce(
                    roomId,
                    peerId,
                    transportId,
                    kind,
                    rtpParameters,
                    appData
                );

                callback({ id });
            } catch (error) {
                logger.error('Produce error:', error);
                callback({ error: 'Failed to produce' });
            }
        });

        /**
         * Consume media
         */
        socket.on('consume', async ({ roomId, peerId, producerPeerId, producerId, rtpCapabilities }, callback) => {
            try {
                const consumerParams = await videoService.consume(
                    roomId,
                    peerId,
                    producerPeerId,
                    producerId,
                    rtpCapabilities
                );

                callback(consumerParams);
            } catch (error) {
                logger.error('Consume error:', error);
                callback({ error: 'Failed to consume' });
            }
        });

        /**
         * Resume consumer
         */
        socket.on('resumeConsumer', async ({ roomId, peerId, consumerId }, callback) => {
            try {
                await videoService.resumeConsumer(roomId, peerId, consumerId);
                callback({ success: true });
            } catch (error) {
                logger.error('Resume consumer error:', error);
                callback({ error: 'Failed to resume consumer' });
            }
        });

        /**
         * Pause producer
         */
        socket.on('pauseProducer', async ({ roomId, peerId, producerId }, callback) => {
            try {
                await videoService.pauseProducer(roomId, peerId, producerId);
                callback({ success: true });
            } catch (error) {
                logger.error('Pause producer error:', error);
                callback({ error: 'Failed to pause producer' });
            }
        });

        /**
         * Resume producer
         */
        socket.on('resumeProducer', async ({ roomId, peerId, producerId }, callback) => {
            try {
                await videoService.resumeProducer(roomId, peerId, producerId);
                callback({ success: true });
            } catch (error) {
                logger.error('Resume producer error:', error);
                callback({ error: 'Failed to resume producer' });
            }
        });

        /**
         * Close producer
         */
        socket.on('closeProducer', async ({ roomId, peerId, producerId }, callback) => {
            try {
                await videoService.closeProducer(roomId, peerId, producerId);
                callback({ success: true });
            } catch (error) {
                logger.error('Close producer error:', error);
                callback({ error: 'Failed to close producer' });
            }
        });

        /**
         * Get room stats
         */
        socket.on('getRoomStats', async ({ roomId }, callback) => {
            try {
                const stats = await videoService.getRoomStats(roomId);
                callback(stats);
            } catch (error) {
                logger.error('Get room stats error:', error);
                callback({ error: 'Failed to get room stats' });
            }
        });

        /**
         * Send chat message in call
         */
        socket.on('chatMessage', ({ roomId, peerId, message }) => {
            socket.to(roomId).emit('chatMessage', {
                peerId,
                message,
                timestamp: new Date(),
            });
        });

        /**
         * Screen sharing started
         */
        socket.on('screenShareStarted', ({ roomId, peerId }) => {
            socket.to(roomId).emit('screenShareStarted', { peerId });
        });

        /**
         * Screen sharing stopped
         */
        socket.on('screenShareStopped', ({ roomId, peerId }) => {
            socket.to(roomId).emit('screenShareStopped', { peerId });
        });

        /**
         * Raise hand
         */
        socket.on('raiseHand', ({ roomId, peerId }) => {
            socket.to(roomId).emit('handRaised', { peerId });
        });

        /**
         * Lower hand
         */
        socket.on('lowerHand', ({ roomId, peerId }) => {
            socket.to(roomId).emit('handLowered', { peerId });
        });

        /**
         * Leave room
         */
        socket.on('leave', async ({ roomId, peerId }, callback) => {
            try {
                await videoService.removePeer(roomId, peerId);
                socket.leave(roomId);

                currentRoomId = null;
                currentPeerId = null;

                callback({ success: true });
            } catch (error) {
                logger.error('Leave error:', error);
                callback({ error: 'Failed to leave room' });
            }
        });

        /**
         * Disconnect
         */
        socket.on('disconnect', async () => {
            logger.info(`Client disconnected: ${socket.id}`);

            if (currentRoomId && currentPeerId) {
                try {
                    await videoService.removePeer(currentRoomId, currentPeerId);
                } catch (error) {
                    logger.error('Disconnect cleanup error:', error);
                }
            }
        });
    });
}
