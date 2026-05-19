import { logger } from '../config/logger';
import { types as mediasoupTypes } from 'mediasoup';
import { routerConfig, webRtcTransportConfig } from '../config/mediasoup';
import { EventEmitter } from 'events';

interface Room {
    id: string;
    router: mediasoupTypes.Router;
    peers: Map<string, Peer>;
    createdAt: Date;
}

interface Peer {
    id: string;
    socket: any;
    transports: Map<string, mediasoupTypes.WebRtcTransport>;
    producers: Map<string, mediasoupTypes.Producer>;
    consumers: Map<string, mediasoupTypes.Consumer>;
    rtpCapabilities?: mediasoupTypes.RtpCapabilities;
}

interface CallStats {
    roomId: string;
    peerId: string;
    timestamp: Date;
    stats: any;
}

export class VideoService extends EventEmitter {
    private rooms: Map<string, Room> = new Map();
    private workers: mediasoupTypes.Worker[];
    private currentWorkerIndex: number = 0;

    constructor(workers: mediasoupTypes.Worker[]) {
        super();
        this.workers = workers;
    }

    /**
     * Create or get a room
     */
    async getOrCreateRoom(roomId: string): Promise<Room> {
        try {
            // Return existing room
            if (this.rooms.has(roomId)) {
                return this.rooms.get(roomId)!;
            }

            // Create new room with router
            const worker = this.getNextWorker();
            const router = await worker.createRouter(routerConfig);

            const room: Room = {
                id: roomId,
                router,
                peers: new Map(),
                createdAt: new Date(),
            };

            this.rooms.set(roomId, room);
            logger.info(`Created room ${roomId}`);

            return room;
        } catch (error) {
            logger.error('Error creating room:', error);
            throw error;
        }
    }

    /**
     * Add peer to room
     */
    async addPeer(roomId: string, peerId: string, socket: any): Promise<Peer> {
        try {
            const room = await this.getOrCreateRoom(roomId);

            const peer: Peer = {
                id: peerId,
                socket,
                transports: new Map(),
                producers: new Map(),
                consumers: new Map(),
            };

            room.peers.set(peerId, peer);
            logger.info(`Added peer ${peerId} to room ${roomId}`);

            return peer;
        } catch (error) {
            logger.error('Error adding peer:', error);
            throw error;
        }
    }

    /**
     * Remove peer from room
     */
    async removePeer(roomId: string, peerId: string) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) return;

            const peer = room.peers.get(peerId);
            if (!peer) return;

            // Close all transports
            for (const transport of peer.transports.values()) {
                transport.close();
            }

            // Remove peer
            room.peers.delete(peerId);
            logger.info(`Removed peer ${peerId} from room ${roomId}`);

            // Notify other peers
            this.notifyPeersInRoom(roomId, peerId, 'peerLeft');

            // Delete room if empty
            if (room.peers.size === 0) {
                room.router.close();
                this.rooms.delete(roomId);
                logger.info(`Deleted empty room ${roomId}`);
            }
        } catch (error) {
            logger.error('Error removing peer:', error);
            throw error;
        }
    }

    /**
     * Get router RTP capabilities
     */
    async getRouterRtpCapabilities(roomId: string): Promise<mediasoupTypes.RtpCapabilities> {
        const room = await this.getOrCreateRoom(roomId);
        return room.router.rtpCapabilities;
    }

    /**
     * Create WebRTC transport
     */
    async createWebRtcTransport(roomId: string, peerId: string, direction: 'send' | 'recv') {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const transport = await room.router.createWebRtcTransport({
                listenIps: webRtcTransportConfig.listenIps,
                enableUdp: webRtcTransportConfig.enableUdp,
                enableTcp: webRtcTransportConfig.enableTcp,
                preferUdp: webRtcTransportConfig.preferUdp,
                initialAvailableOutgoingBitrate: webRtcTransportConfig.initialAvailableOutgoingBitrate,
            });

            // Set max incoming bitrate
            if (direction === 'recv') {
                await transport.setMaxIncomingBitrate(webRtcTransportConfig.maxIncomingBitrate);
            }

            peer.transports.set(transport.id, transport);

            // Handle transport close
            transport.on('dtlsstatechange', (dtlsState) => {
                if (dtlsState === 'closed') {
                    transport.close();
                    peer.transports.delete(transport.id);
                }
            });

            logger.info(`Created ${direction} transport ${transport.id} for peer ${peerId}`);

            return {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            };
        } catch (error) {
            logger.error('Error creating transport:', error);
            throw error;
        }
    }

    /**
     * Connect transport
     */
    async connectTransport(
        roomId: string,
        peerId: string,
        transportId: string,
        dtlsParameters: mediasoupTypes.DtlsParameters
    ) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const transport = peer.transports.get(transportId);
            if (!transport) throw new Error('Transport not found');

            await transport.connect({ dtlsParameters });
            logger.info(`Connected transport ${transportId} for peer ${peerId}`);
        } catch (error) {
            logger.error('Error connecting transport:', error);
            throw error;
        }
    }

    /**
     * Produce media
     */
    async produce(
        roomId: string,
        peerId: string,
        transportId: string,
        kind: mediasoupTypes.MediaKind,
        rtpParameters: mediasoupTypes.RtpParameters,
        appData?: any
    ) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const transport = peer.transports.get(transportId);
            if (!transport) throw new Error('Transport not found');

            const producer = await transport.produce({
                kind,
                rtpParameters,
                appData: { ...appData, peerId, transportId },
            });

            peer.producers.set(producer.id, producer);

            // Handle producer close
            producer.on('transportclose', () => {
                producer.close();
                peer.producers.delete(producer.id);
            });

            logger.info(`Created producer ${producer.id} (${kind}) for peer ${peerId}`);

            // Notify other peers about new producer
            this.notifyPeersInRoom(roomId, peerId, 'newProducer', {
                producerId: producer.id,
                kind,
                peerId,
            });

            return { id: producer.id };
        } catch (error) {
            logger.error('Error producing:', error);
            throw error;
        }
    }

    /**
     * Consume media
     */
    async consume(
        roomId: string,
        peerId: string,
        producerPeerId: string,
        producerId: string,
        rtpCapabilities: mediasoupTypes.RtpCapabilities
    ) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const producerPeer = room.peers.get(producerPeerId);
            if (!producerPeer) throw new Error('Producer peer not found');

            const producer = producerPeer.producers.get(producerId);
            if (!producer) throw new Error('Producer not found');

            // Check if can consume
            if (!room.router.canConsume({ producerId, rtpCapabilities })) {
                throw new Error('Cannot consume');
            }

            // Get recv transport
            const recvTransport = Array.from(peer.transports.values()).find(
                (t) => t.appData.direction === 'recv'
            );
            if (!recvTransport) throw new Error('Recv transport not found');

            const consumer = await recvTransport.consume({
                producerId,
                rtpCapabilities,
                paused: true, // Start paused
            });

            peer.consumers.set(consumer.id, consumer);

            // Handle consumer close
            consumer.on('transportclose', () => {
                peer.consumers.delete(consumer.id);
            });

            consumer.on('producerclose', () => {
                peer.consumers.delete(consumer.id);
                peer.socket.emit('consumerClosed', { consumerId: consumer.id });
            });

            logger.info(`Created consumer ${consumer.id} for peer ${peerId}`);

            return {
                id: consumer.id,
                producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                producerPeerId,
            };
        } catch (error) {
            logger.error('Error consuming:', error);
            throw error;
        }
    }

    /**
     * Resume consumer
     */
    async resumeConsumer(roomId: string, peerId: string, consumerId: string) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const consumer = peer.consumers.get(consumerId);
            if (!consumer) throw new Error('Consumer not found');

            await consumer.resume();
            logger.info(`Resumed consumer ${consumerId} for peer ${peerId}`);
        } catch (error) {
            logger.error('Error resuming consumer:', error);
            throw error;
        }
    }

    /**
     * Pause producer
     */
    async pauseProducer(roomId: string, peerId: string, producerId: string) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const producer = peer.producers.get(producerId);
            if (!producer) throw new Error('Producer not found');

            await producer.pause();
            logger.info(`Paused producer ${producerId} for peer ${peerId}`);

            this.notifyPeersInRoom(roomId, peerId, 'producerPaused', { producerId });
        } catch (error) {
            logger.error('Error pausing producer:', error);
            throw error;
        }
    }

    /**
     * Resume producer
     */
    async resumeProducer(roomId: string, peerId: string, producerId: string) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const producer = peer.producers.get(producerId);
            if (!producer) throw new Error('Producer not found');

            await producer.resume();
            logger.info(`Resumed producer ${producerId} for peer ${peerId}`);

            this.notifyPeersInRoom(roomId, peerId, 'producerResumed', { producerId });
        } catch (error) {
            logger.error('Error resuming producer:', error);
            throw error;
        }
    }

    /**
     * Close producer
     */
    async closeProducer(roomId: string, peerId: string, producerId: string) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peer = room.peers.get(peerId);
            if (!peer) throw new Error('Peer not found');

            const producer = peer.producers.get(producerId);
            if (!producer) throw new Error('Producer not found');

            producer.close();
            peer.producers.delete(producerId);

            logger.info(`Closed producer ${producerId} for peer ${peerId}`);

            this.notifyPeersInRoom(roomId, peerId, 'producerClosed', { producerId });
        } catch (error) {
            logger.error('Error closing producer:', error);
            throw error;
        }
    }

    /**
     * Get room stats
     */
    async getRoomStats(roomId: string) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) throw new Error('Room not found');

            const peers = Array.from(room.peers.keys());
            const producers = Array.from(room.peers.values()).reduce(
                (acc, peer) => acc + peer.producers.size,
                0
            );
            const consumers = Array.from(room.peers.values()).reduce(
                (acc, peer) => acc + peer.consumers.size,
                0
            );

            return {
                roomId,
                peerCount: peers.length,
                producerCount: producers,
                consumerCount: consumers,
                createdAt: room.createdAt,
            };
        } catch (error) {
            logger.error('Error getting room stats:', error);
            throw error;
        }
    }

    /**
     * Get all rooms
     */
    getAllRooms() {
        return Array.from(this.rooms.keys());
    }

    /**
     * Get peers in room
     */
    getPeersInRoom(roomId: string): string[] {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room.peers.keys()) : [];
    }

    /**
     * Notify other peers in room
     */
    private notifyPeersInRoom(
        roomId: string,
        excludePeerId: string,
        event: string,
        data?: any
    ) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        for (const [peerId, peer] of room.peers) {
            if (peerId !== excludePeerId) {
                peer.socket.emit(event, data);
            }
        }
    }

    /**
     * Get next worker (round-robin)
     */
    private getNextWorker(): mediasoupTypes.Worker {
        const worker = this.workers[this.currentWorkerIndex];
        this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
        return worker;
    }
}
