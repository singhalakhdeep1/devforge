import { Counter, Histogram, Gauge, register } from 'prom-client';

// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// HTTP request total counter
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Active connections gauge
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Database query duration histogram
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Cache hit rate gauge
export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_type'],
});

// Queue size gauge
export const queueSize = new Gauge({
  name: 'queue_size',
  help: 'Current queue size',
  labelNames: ['queue_name'],
});

// Error rate counter
export const errorRate = new Counter({
  name: 'error_rate_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'service'],
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(dbQueryDuration);
register.registerMetric(cacheHitRate);
register.registerMetric(queueSize);
register.registerMetric(errorRate);

export function recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
  httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  httpRequestsTotal.inc({ method, route, status_code: statusCode });
}

export function recordDbQuery(operation: string, table: string, duration: number) {
  dbQueryDuration.observe({ operation, table }, duration);
}

export function incrementErrorCount(errorType: string, service: string) {
  errorRate.inc({ error_type: errorType, service });
}
