import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { CacheService } from '../services/cache/cache.service';

/**
 * Redis-backed response cache for public GET endpoints.
 * Personalised requests (bearer token or gateway identity headers) always bypass it, so one user's
 * data can never be served to another. Responses carry X-Cache: HIT | MISS | BYPASS.
 */
export function httpCache(cache: CacheService, ttlSeconds = 60): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const personalised = Boolean(req.headers.authorization || req.headers['x-user-id'] || req.headers.cookie?.includes('refreshToken'));
    if (req.method !== 'GET' || personalised) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }
    const key = `http:${req.originalUrl}`;
    const hit = await cache.getJSON<{ status: number; body: unknown }>(key);
    if (hit) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(hit.status).json(hit.body);
    }
    res.setHeader('X-Cache', 'MISS');
    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode === 200) void cache.setJSON(key, { status: 200, body }, ttlSeconds);
      return json(body);
    };
    next();
  };
}

/** After any successful write, drop the cached public responses so readers never see stale data for long. */
export function invalidateOnWrite(cache: CacheService, pattern = 'http:*'): RequestHandler {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      res.on('finish', () => {
        if (res.statusCode < 400) void cache.invalidatePattern(pattern);
      });
    }
    next();
  };
}
