import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from './config/logger';

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

const PORT = process.env.WEBSOCKET_PORT || 4006;

// Authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (socket as any).user = decoded;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

// Connection handler
io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`User connected: ${user.userId}`);

    // Join user's personal room
    socket.join(`user:${user.userId}`);

    // Handle joining rooms
    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        logger.info(`User ${user.userId} joined room: ${roomId}`);
        socket.to(roomId).emit('user_joined', { userId: user.userId });
    });

    // Handle leaving rooms
    socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        logger.info(`User ${user.userId} left room: ${roomId}`);
        socket.to(roomId).emit('user_left', { userId: user.userId });
    });

    // Handle messages
    socket.on('message', (data: { roomId: string; content: string; type: string }) => {
        const message = {
            id: Math.random().toString(36).substring(7),
            userId: user.userId,
            ...data,
            timestamp: new Date().toISOString(),
        };

        io.to(data.roomId).emit('message', message);
        logger.info(`Message sent to room ${data.roomId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('typing', {
            userId: user.userId,
            isTyping: data.isTyping,
        });
    });

    // Handle presence
    socket.on('presence', (status: string) => {
        io.emit('presence', { userId: user.userId, status });
    });

    // Handle notifications
    socket.on('notification', (data: any) => {
        if (data.targetUserId) {
            io.to(`user:${data.targetUserId}`).emit('notification', data);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${user.userId}`);
        io.emit('presence', { userId: user.userId, status: 'offline' });
    });
});

httpServer.listen(PORT, () => {
    logger.info(`🔌 WebSocket Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing WebSocket server');
    httpServer.close(() => {
        logger.info('WebSocket server closed');
        process.exit(0);
    });
});

export default io;
