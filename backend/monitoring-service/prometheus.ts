import client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

export const activeConnections = new client.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['type']
});

export const databaseQueryDuration = new client.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

export const databaseConnectionPool = new client.Gauge({
    name: 'database_connection_pool',
    help: 'Database connection pool status',
    labelNames: ['status']
});

export const cacheHitRate = new client.Gauge({
    name: 'cache_hit_rate',
    help: 'Cache hit rate percentage',
    labelNames: ['cache_name']
});

export const queueSize = new client.Gauge({
    name: 'queue_size',
    help: 'Number of items in queue',
    labelNames: ['queue_name']
});

export const taskDuration = new client.Histogram({
    name: 'task_duration_seconds',
    help: 'Duration of background tasks',
    labelNames: ['task_name', 'status'],
    buckets: [1, 5, 10, 30, 60, 120, 300]
});

export const errorCounter = new client.Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'service']
});

export const userSessionsActive = new client.Gauge({
    name: 'user_sessions_active',
    help: 'Number of active user sessions'
});

export const apiCallsExternal = new client.Counter({
    name: 'api_calls_external_total',
    help: 'Total external API calls',
    labelNames: ['service', 'endpoint', 'status']
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(databaseConnectionPool);
register.registerMetric(cacheHitRate);
register.registerMetric(queueSize);
register.registerMetric(taskDuration);
register.registerMetric(errorCounter);
register.registerMetric(userSessionsActive);
register.registerMetric(apiCallsExternal);

// Middleware to track HTTP metrics
export const prometheusMiddleware = (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;

        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            duration
        );

        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });
    });

    next();
};
