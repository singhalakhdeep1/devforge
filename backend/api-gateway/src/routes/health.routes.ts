import { Router, Request, Response } from 'express';
import { redisClient } from '../index';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        service: 'api-gateway',
        checks: {
            redis: 'unknown',
            memory: {
                used: process.memoryUsage().heapUsed,
                total: process.memoryUsage().heapTotal,
            },
        },
    };

    // Check Redis
    try {
        if (redisClient) {
            await redisClient.ping();
            health.checks.redis = 'connected';
        }
    } catch (error) {
        health.checks.redis = 'disconnected';
        health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

router.get('/ready', (req: Request, res: Response) => {
    res.json({ ready: true });
});

router.get('/live', (req: Request, res: Response) => {
    res.json({ alive: true });
});

export default router;
