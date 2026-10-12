import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import projectRoutes from './routes/project.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) }
    }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Request correlation ID
app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-correlation-id'] = req.headers['x-correlation-id'] ||
        `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    res.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] as string);
    next();
});

// ==================== ROUTES ====================

app.use('/health', healthRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/users', userRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'DevHub API Gateway',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
    });
});

// ==================== ERROR HANDLING ====================

app.use(notFoundHandler);
app.use(errorHandler);

// ==================== REDIS CONNECTION ====================

let redisClient: any;

const connectRedis = async () => {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });

        redisClient.on('error', (err: Error) => logger.error('Redis Client Error', err));
        redisClient.on('connect', () => logger.info('Redis Client Connected'));

        await redisClient.connect();
    } catch (error) {
        logger.error('Redis connection failed:', error);
    }
};

// ==================== SERVER STARTUP ====================

const startServer = async () => {
    try {
        // Connect to Redis
        await connectRedis();

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`🚀 API Gateway running on port ${PORT}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                // Close Redis connection
                if (redisClient) {
                    await redisClient.quit();
                    logger.info('Redis connection closed');
                }

                process.exit(0);
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error('Forceful shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
export { redisClient };
