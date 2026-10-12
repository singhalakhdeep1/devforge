import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { EditorService } from './services/editor.service';
import { setupEditorWebSocket } from './websocket/editorHandlers';
import { createEditorRoutes } from './routes/editor.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws/editor'
});

const PORT = process.env.PORT || 3009;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Create editor service
const editorService = new EditorService();

// Setup WebSocket
setupEditorWebSocket(wss, editorService);

// Routes
app.use('/api/editor', createEditorRoutes(editorService));

// Health check
app.get('/health', (req, res) => {
    const documents = editorService.getAllDocuments();
    res.json({
        status: 'healthy',
        service: 'editor-service',
        timestamp: new Date().toISOString(),
        activeDocuments: documents.length,
        wsConnections: wss.clients.size,
    });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// Start server
httpServer.listen(PORT, () => {
    logger.info(`Editor service running on port ${PORT}`);
    logger.info(`WebSocket server listening on ws://localhost:${PORT}/ws/editor`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    wss.close(() => {
        httpServer.close(() => {
            logger.info('Server closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    wss.close(() => {
        httpServer.close(() => {
            logger.info('Server closed');
            process.exit(0);
        });
    });
});
