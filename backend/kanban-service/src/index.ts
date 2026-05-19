import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import kanbanRoutes from './routes/kanban.routes';
import kanbanService from './services/kanban.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
    }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/kanban', kanbanRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'kanban-service' });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join board room
    socket.on('join:board', (boardId: string) => {
        socket.join(`board:${boardId}`);
        console.log(`Socket ${socket.id} joined board:${boardId}`);
    });

    // Leave board room
    socket.on('leave:board', (boardId: string) => {
        socket.leave(`board:${boardId}`);
        console.log(`Socket ${socket.id} left board:${boardId}`);
    });

    // Task drag start
    socket.on('task:drag-start', (data: { boardId: string; taskId: string; userId: string }) => {
        socket.to(`board:${data.boardId}`).emit('task:dragging', {
            taskId: data.taskId,
            userId: data.userId
        });
    });

    // Task drag end
    socket.on('task:drag-end', (data: { boardId: string; taskId: string }) => {
        socket.to(`board:${data.boardId}`).emit('task:drag-stopped', {
            taskId: data.taskId
        });
    });

    // User typing in comment
    socket.on('comment:typing', (data: { boardId: string; taskId: string; userId: string; isTyping: boolean }) => {
        socket.to(`board:${data.boardId}`).emit('comment:typing-status', {
            taskId: data.taskId,
            userId: data.userId,
            isTyping: data.isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Set socket server in kanban service
kanbanService.setSocketServer(io);

const PORT = process.env.PORT || 3011;

httpServer.listen(PORT, () => {
    console.log(`Kanban Service running on port ${PORT}`);
});

export { io };
