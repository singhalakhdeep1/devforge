import promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import responseTime from 'response-time';

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
    register,
    prefix: 'devhub_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code', 'service'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register]
});

export const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'service'],
    registers: [register]
});

export const httpRequestSize = new promClient.Histogram({
    name: 'http_request_size_bytes',
    help: 'Size of HTTP requests in bytes',
    labelNames: ['method', 'route', 'service'],
    buckets: [100, 1000, 10000, 100000, 1000000],
    registers: [register]
});

export const httpResponseSize = new promClient.Histogram({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'route', 'service'],
    buckets: [100, 1000, 10000, 100000, 1000000],
    registers: [register]
});

export const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['service'],
    registers: [register]
});

export const databaseQueryDuration = new promClient.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'model', 'service'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register]
});

export const cacheHits = new promClient.Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type', 'key_pattern', 'service'],
    registers: [register]
});

export const cacheMisses = new promClient.Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type', 'key_pattern', 'service'],
    registers: [register]
});

export const backgroundJobsCompleted = new promClient.Counter({
    name: 'bullmq_jobs_completed_total',
    help: 'Total number of completed background jobs',
    labelNames: ['queue', 'job_name', 'service'],
    registers: [register]
});

export const backgroundJobsFailed = new promClient.Counter({
    name: 'bullmq_jobs_failed_total',
    help: 'Total number of failed background jobs',
    labelNames: ['queue', 'job_name', 'service'],
    registers: [register]
});

export const backgroundJobDuration = new promClient.Histogram({
    name: 'bullmq_job_duration_seconds',
    help: 'Duration of background jobs in seconds',
    labelNames: ['queue', 'job_name', 'service'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120, 300],
    registers: [register]
});

export const websocketConnections = new promClient.Gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections',
    labelNames: ['service'],
    registers: [register]
});

export const websocketMessages = new promClient.Counter({
    name: 'websocket_messages_total',
    help: 'Total number of WebSocket messages',
    labelNames: ['direction', 'event_type', 'service'],
    registers: [register]
});

export const authAttempts = new promClient.Counter({
    name: 'auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['method', 'status', 'service'],
    registers: [register]
});

export const paymentProcessing = new promClient.Counter({
    name: 'payment_processing_total',
    help: 'Total number of payment processing attempts',
    labelNames: ['status', 'payment_method', 'service'],
    registers: [register]
});

export const emailDelivery = new promClient.Counter({
    name: 'email_delivery_total',
    help: 'Total number of email delivery attempts',
    labelNames: ['status', 'template', 'service'],
    registers: [register]
});

export const fileUploads = new promClient.Counter({
    name: 'file_uploads_total',
    help: 'Total number of file uploads',
    labelNames: ['status', 'file_type', 'service'],
    registers: [register]
});

export const fileUploadSize = new promClient.Histogram({
    name: 'file_upload_size_bytes',
    help: 'Size of uploaded files in bytes',
    labelNames: ['file_type', 'service'],
    buckets: [1000, 10000, 100000, 1000000, 10000000, 100000000],
    registers: [register]
});

/**
 * Metrics middleware for Express
 */
export function metricsMiddleware(serviceName: string) {
    return responseTime((req: Request, res: Response, time: number) => {
        const route = req.route ? `${req.baseUrl || ''}${req.route.path}` : 'unmatched';
        const method = req.method;
        const statusCode = res.statusCode;

        // Record request duration
        httpRequestDuration.observe(
            { method, route, status_code: statusCode, service: serviceName },
            time / 1000 // Convert to seconds
        );

        // Increment request counter
        httpRequestTotal.inc({
            method,
            route,
            status_code: statusCode,
            service: serviceName
        });

        // Record request size
        const requestSize = parseInt(req.get('content-length') || '0', 10);
        if (requestSize > 0) {
            httpRequestSize.observe(
                { method, route, service: serviceName },
                requestSize
            );
        }

        // Record response size
        const responseSize = parseInt(res.get('content-length') || '0', 10);
        if (responseSize > 0) {
            httpResponseSize.observe(
                { method, route, service: serviceName },
                responseSize
            );
        }
    });
}

/**
 * Metrics endpoint handler
 */
export async function metricsHandler(req: Request, res: Response) {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.send(metrics);
    } catch (error) {
        res.status(500).send('Failed to generate metrics');
    }
}

/**
 * Database query metrics wrapper
 */
export function trackDatabaseQuery<T>(
    operation: string,
    model: string,
    serviceName: string,
    queryFn: () => Promise<T>
): Promise<T> {
    const start = Date.now();
    return queryFn()
        .then((result) => {
            const duration = (Date.now() - start) / 1000;
            databaseQueryDuration.observe(
                { operation, model, service: serviceName },
                duration
            );
            return result;
        })
        .catch((error) => {
            const duration = (Date.now() - start) / 1000;
            databaseQueryDuration.observe(
                { operation, model, service: serviceName },
                duration
            );
            throw error;
        });
}

/**
 * Cache metrics helper
 */
export function trackCacheAccess(
    cacheType: string,
    keyPattern: string,
    serviceName: string,
    hit: boolean
) {
    if (hit) {
        cacheHits.inc({ cache_type: cacheType, key_pattern: keyPattern, service: serviceName });
    } else {
        cacheMisses.inc({ cache_type: cacheType, key_pattern: keyPattern, service: serviceName });
    }
}

/**
 * Background job metrics helper
 */
export function trackBackgroundJob(
    queue: string,
    jobName: string,
    serviceName: string,
    status: 'completed' | 'failed',
    duration: number
) {
    if (status === 'completed') {
        backgroundJobsCompleted.inc({ queue, job_name: jobName, service: serviceName });
    } else {
        backgroundJobsFailed.inc({ queue, job_name: jobName, service: serviceName });
    }

    backgroundJobDuration.observe(
        { queue, job_name: jobName, service: serviceName },
        duration
    );
}

/**
 * Health check endpoint
 */
export function healthCheckHandler(req: Request, res: Response) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    });
}
