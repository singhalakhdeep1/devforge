/**
 * Uniform bootstrap for every HTTP service: security headers, CORS, correlation ids, structured
 * request logs, Prometheus metrics, /health, /ready, /metrics, error handling, graceful shutdown.
 */
import http from 'node:http';
import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { v4 as uuid } from 'uuid';
import { env, envInt, SERVICE_PORTS, type ServiceName } from './config';
import { errorHandler, notFoundHandler } from './errors';
import { metricsHandler, metricsMiddleware } from './metrics';
import { closeRedis } from './redis';
import { createLogger, runWithContext } from '../services/structured-logging/structured-logging.service';

export interface ServiceOptions {
  name: ServiceName | string;
  port?: number;
  /** Mount routes. Runs after the body parser and before the 404 handler. */
  routes: (app: Express, server: http.Server) => void | Promise<void>;
  /** Runs before body parsing (e.g. to mount a raw-body webhook). */
  beforeBody?: (app: Express) => void;
  /** Dependency checks reported by /ready. A rejected promise or `false` means not ready. */
  ready?: Record<string, () => Promise<unknown>>;
  onStart?: (server: http.Server) => void | Promise<void>;
  onStop?: () => void | Promise<void>;
  jsonLimit?: string;
  cors?: boolean;
  trustProxy?: boolean;
}

export async function startService(opts: ServiceOptions): Promise<{ app: Express; server: http.Server }> {
  const name = String(opts.name);
  const log = createLogger(name);
  const port = opts.port ?? envInt('PORT', SERVICE_PORTS[name as ServiceName] ?? 3000);
  const app = express();
  const server = http.createServer(app);
  const startedAt = Date.now();

  app.disable('x-powered-by');
  if (opts.trustProxy) app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  if (opts.cors !== false) {
    const origins = env('CORS_ORIGIN', 'http://localhost:3000').split(',').map((s) => s.trim());
    app.use(cors({ origin: origins, credentials: true }));
  }
  app.use(compression());

  // correlation id + async log context for the whole request
  app.use((req, res, next) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuid();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    runWithContext(
      { correlationId, serviceId: name, requestId: uuid(), ipAddress: req.ip, userAgent: req.headers['user-agent'], userId: req.headers['x-user-id'] as string | undefined },
      next,
    );
  });
  app.use(metricsMiddleware(name));
  app.use((req, res, next) => {
    const t = Date.now();
    res.on('finish', () => {
      if (req.path === '/health' || req.path === '/metrics' || req.path === '/ready') return;
      log.logInformation('request', { method: req.method, path: req.originalUrl.split('?')[0], status: res.statusCode, ms: Date.now() - t });
    });
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: name, uptime: Math.round((Date.now() - startedAt) / 1000) }));
  app.get('/metrics', metricsHandler);
  app.get('/ready', async (_req, res) => {
    const checks: Record<string, string> = {};
    let ok = true;
    for (const [dep, fn] of Object.entries(opts.ready ?? {})) {
      try { checks[dep] = (await fn()) === false ? 'down' : 'up'; } catch { checks[dep] = 'down'; }
      if (checks[dep] === 'down') ok = false;
    }
    res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'degraded', service: name, checks });
  });

  opts.beforeBody?.(app);
  app.use(express.json({ limit: opts.jsonLimit ?? '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: opts.jsonLimit ?? '2mb' }));
  await opts.routes(app, server);
  app.use(notFoundHandler);
  app.use(errorHandler(name));

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve());
  });
  await opts.onStart?.(server);
  log.logInformation(`${name} listening`, { port });

  let stopping = false;
  const stop = async (signal: string) => {
    if (stopping) return;
    stopping = true;
    log.logInformation('shutting down', { signal });
    const force = setTimeout(() => process.exit(1), 15_000);
    force.unref();
    await new Promise<void>((r) => server.close(() => r()));
    try { await opts.onStop?.(); } catch (e) { log.logError('shutdown hook failed', String(e)); }
    await closeRedis();
    process.exit(0);
  };
  process.on('SIGTERM', () => void stop('SIGTERM'));
  process.on('SIGINT', () => void stop('SIGINT'));
  process.on('unhandledRejection', (e) => log.logError('unhandledRejection', String(e)));

  return { app, server };
}
