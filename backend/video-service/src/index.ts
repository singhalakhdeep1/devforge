import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { createWorkers } from './config/mediasoup';
import { VideoService } from './services/video.service';
import { setupVideoSocketHandlers } from './socket/videoHandlers';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

const PORT = process.env.PORT || 3008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

let videoService: VideoService;

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'video-service',
        timestamp: new Date().toISOString(),
        rooms: videoService ? videoService.getAllRooms().length : 0,
    });
});

// Get all active rooms
app.get('/api/rooms', (req, res) => {
    try {
        const rooms = videoService.getAllRooms();
        res.json({
            success: true,
            data: { rooms, count: rooms.length },
        });
    } catch (error) {
        logger.error('Get rooms error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get rooms',
        });
    }
});

// Get room details
app.get('/api/rooms/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const stats = await videoService.getRoomStats(roomId);
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        logger.error('Get room details error:', error);
        res.status(404).json({
            success: false,
            error: 'Room not found',
        });
    }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// Initialize and start server
async function startServer() {
    try {
        // Create mediasoup workers
        const numWorkers = parseInt(process.env.NUM_WORKERS || '4');
        const workers = await createWorkers(numWorkers);
        logger.info(`Created ${workers.length} mediasoup workers`);

        // Create video service
        videoService = new VideoService(workers);

        // Setup socket handlers
        setupVideoSocketHandlers(io, videoService);

        // Start server
        httpServer.listen(PORT, () => {
            logger.info(`Video service running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

startServer();
