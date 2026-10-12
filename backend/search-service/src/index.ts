import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import searchRoutes from './routes/search.routes';
import { logger } from './config/logger';
import { initializeIndices, checkElasticsearchHealth } from './config/elasticsearch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', async (req, res) => {
    const esHealthy = await checkElasticsearchHealth();
    res.json({
        status: esHealthy ? 'healthy' : 'degraded',
        service: 'search-service',
        elasticsearch: esHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Initialize and start server
async function startServer() {
    try {
        // Initialize Elasticsearch indices
        await initializeIndices();
        logger.info('Elasticsearch indices initialized');

        // Start server
        app.listen(PORT, () => {
            logger.info(`Search service running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startServer();
