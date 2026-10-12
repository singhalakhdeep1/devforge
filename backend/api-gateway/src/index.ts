import type { IncomingMessage } from 'node:http'
import type { NextFunction, Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import {
  CircuitBreaker,
  RateLimitingService,
  createLogger,
  env,
  envInt,
  internalKey,
  redisHealthy,
  serviceUrl,
  startService,
  verifyAccessToken,
  type ServiceName,
} from '@devhub/shared'
import { match, monitored, routes, type Route } from './routes'

const log = createLogger('gateway')

/** Headers only the gateway may set. Anything a client sends under these names is discarded. */
const IDENTITY_HEADERS = ['x-user-id', 'x-user-role', 'x-user-email', 'x-user-name', 'x-internal-key']

const breakers = new Map<ServiceName, CircuitBreaker>()
const breaker = (s: ServiceName) => {
  let b = breakers.get(s)
  if (!b) breakers.set(s, (b = new CircuitBreaker(`${s}-service`, 5, 10_000)))
  return b
}

const limiter = new RateLimitingService(envInt('RATE_LIMIT_BUCKET_CAPACITY', 300), parseFloat(env('RATE_LIMIT_REFILL_RATE', '10')))

// One proxy per route; the first route for a service creates its target connection settings
type Proxy = ((req: any, res: any, next: any) => unknown) & { upgrade?: (...args: any[]) => void }
const proxies = new Map<Route, Proxy>()
function proxyFor(route: Route): Proxy {
  let p = proxies.get(route)
  if (!p) {
    p = createProxyMiddleware<any, any>({
      target: serviceUrl(route.service),
      changeOrigin: true,
      xfwd: true,
      ws: route.service === 'websocket',
      proxyTimeout: 30_000,
      timeout: 35_000,
      ...(route.rewrite ? { pathRewrite: (path: string) => route.rewrite!(path) } : {}),
      on: {
        proxyRes: (proxyRes: IncomingMessage) => {
          if ((proxyRes.statusCode ?? 0) >= 500) breaker(route.service).failure()
          else breaker(route.service).success()
        },
        error: (err, _req, res) => {
          breaker(route.service).failure()
          log.logWarning('upstream error', { service: route.service, error: String(err) })
          const r = res as Response
          if (typeof r.writeHead === 'function' && !r.headersSent) {
            r.writeHead(502, { 'content-type': 'application/json' })
            r.end(JSON.stringify({ success: false, error: `The ${route.service} service is not responding`, code: 'BAD_GATEWAY' }))
          }
        },
      },
    }) as unknown as Proxy
    proxies.set(route, p)
  }
  return p
}

/** Removes anything spoofable, then adds identity only from a token this gateway verified. */
function identity(req: Request, res: Response, next: NextFunction) {
  for (const h of IDENTITY_HEADERS) delete req.headers[h]
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try {
      const u = verifyAccessToken(auth.slice(7))
      req.headers['x-internal-key'] = internalKey()
      req.headers['x-user-id'] = u.id
      req.headers['x-user-role'] = u.role
      if (u.email) req.headers['x-user-email'] = u.email
      if (u.name) req.headers['x-user-name'] = encodeURIComponent(u.name) // headers must be ASCII; services decode
      res.locals.verified = true
    } catch {
      res.locals.invalidToken = true
    }
  }
  next()
}

async function rateLimit(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/uploads') || req.path.startsWith('/socket.io') || req.path === '/api/payments/webhook') return next()
  const id = (req.headers['x-user-id'] as string | undefined) ?? req.ip ?? 'anon'
  const d = await limiter.consume(`gw:${id}`)
  res.setHeader('X-RateLimit-Limit', String(limiter.capacity))
  res.setHeader('X-RateLimit-Remaining', String(d.remaining))
  if (!d.allowed) {
    res.setHeader('Retry-After', String(d.retryAfter))
    return res.status(429).json({ success: false, error: 'Too many requests, slow down.', code: 'RATE_LIMITED', retryAfter: d.retryAfter })
  }
  next()
}

async function probe(service: ServiceName) {
  const started = Date.now()
  try {
    const r = await fetch(`${serviceUrl(service)}/health`, { signal: AbortSignal.timeout(1500) })
    return { service, status: r.ok ? 'up' : 'down', ms: Date.now() - started, circuit: breaker(service).status }
  } catch {
    return { service, status: 'down', ms: Date.now() - started, circuit: breaker(service).status }
  }
}

void startService({
  name: 'gateway',
  trustProxy: true,
  cors: true,
  ready: { redis: () => redisHealthy() },
  // No body parsing at the edge: requests stream straight through, so uploads and Stripe's
  // signed webhooks reach their service byte-for-byte.
  beforeBody: (app) => {
    app.get('/', (_req, res) => res.json({ name: 'DevForge API Gateway', version: '2.0.0', docs: '/api/routes', health: '/health/services' }))
    app.get('/api/routes', (_req, res) => res.json(routes.map((r) => ({ prefix: r.prefix, service: r.service, auth: r.auth ?? 'none' }))))
    app.get('/health/services', async (_req, res) => {
      const results = await Promise.all(monitored.map(probe))
      const down = results.filter((r) => r.status !== 'up')
      res.status(down.length ? 207 : 200).json({ status: down.length ? 'degraded' : 'ok', services: results })
    })

    app.use(identity)
    app.use((req, res, next) => void rateLimit(req, res, next).catch(next))

    app.use((req, res, next) => {
      const route = match(req.path)
      if (!route) return next()
      res.locals.metricRoute = route.prefix

      if (route.auth === 'required' && !res.locals.verified) {
        return res.status(401).json({ success: false, error: res.locals.invalidToken ? 'Invalid or expired token' : 'Authentication required', code: 'UNAUTHORIZED' })
      }
      if (!breaker(route.service).allow()) {
        res.setHeader('Retry-After', '10')
        return res.status(503).json({ success: false, error: `The ${route.service} service is temporarily unavailable`, code: 'CIRCUIT_OPEN' })
      }
      proxyFor(route)(req, res, next)
    })
  },
  routes: () => undefined,
  onStart: (server) => {
    // WebSocket upgrades for Socket.IO go to the websocket-server
    const wsRoute = routes.find((r) => r.service === 'websocket')!
    server.on('upgrade', (req, socket, head) => {
      if (req.url?.startsWith('/socket.io')) proxyFor(wsRoute).upgrade?.(req, socket, head)
      else socket.destroy()
    })
  },
}).catch((e) => {
  console.error('api-gateway failed to start', e)
  process.exit(1)
})
