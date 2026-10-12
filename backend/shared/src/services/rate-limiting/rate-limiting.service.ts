/**
 * Rate Limiting Service for DevForge
 * Token bucket on Redis. The refill-and-take step runs as one Lua script, so it is atomic:
 * concurrent requests (and several gateway replicas) cannot overspend the bucket.
 * Defaults come from RATE_LIMIT_BUCKET_CAPACITY / RATE_LIMIT_REFILL_RATE.
 */
import type { NextFunction, Request, Response } from 'express';
import type Redis from 'ioredis';
import { envInt } from '../../lib/config';
import { getRedis } from '../../lib/redis';
import { createLogger } from '../structured-logging/structured-logging.service';

const LUA = `
local cap = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local req = tonumber(ARGV[4])
local d = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(d[1])
local ts = tonumber(d[2])
if tokens == nil then tokens = cap; ts = now end
tokens = math.min(cap, tokens + math.max(0, (now - ts) / 1000) * rate)
local allowed = 0
if tokens >= req then tokens = tokens - req; allowed = 1 end
redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'ts', tostring(now))
redis.call('EXPIRE', KEYS[1], math.ceil(cap / rate) + 60)
return { allowed, tostring(tokens) }
`;

export interface RateDecision {
  allowed: boolean;
  remaining: number;
  /** Seconds until `tokensRequested` tokens are available again (0 when allowed). */
  retryAfter: number;
}

export class RateLimitingService {
  private readonly log = createLogger('rate-limit');

  constructor(
    private readonly bucketCapacity = envInt('RATE_LIMIT_BUCKET_CAPACITY', 100),
    private readonly refillRate = Math.max(0.001, parseFloat(process.env.RATE_LIMIT_REFILL_RATE ?? '1')),
    private readonly redis: Redis = getRedis(),
  ) {}

  async consume(key: string, tokensRequested = 1): Promise<RateDecision> {
    try {
      const [allowed, tokens] = (await this.redis.eval(LUA, 1, `rate_limit:${key}`, this.bucketCapacity, this.refillRate, Date.now(), tokensRequested)) as [number, string];
      const remaining = parseFloat(tokens);
      return {
        allowed: allowed === 1,
        remaining: Math.floor(remaining),
        retryAfter: allowed === 1 ? 0 : Math.ceil((tokensRequested - remaining) / this.refillRate),
      };
    } catch (e) {
      // A cache outage must not take the API down: fail open and say so.
      this.log.logWarning('rate limiter unavailable, allowing request', { error: String(e) });
      return { allowed: true, remaining: this.bucketCapacity, retryAfter: 0 };
    }
  }

  async isAllowed(key: string, tokensRequested = 1): Promise<boolean> {
    return (await this.consume(key, tokensRequested)).allowed;
  }

  async getRemainingTokens(key: string): Promise<number> {
    return (await this.consume(key, 0)).remaining;
  }

  async resetBucket(key: string): Promise<void> {
    await this.redis.del(`rate_limit:${key}`).catch(() => undefined);
  }

  get capacity(): number { return this.bucketCapacity; }
}

export interface RateLimitMiddlewareOptions {
  capacity?: number;
  refillPerSecond?: number;
  /** Bucket key; defaults to the signed-in user id or the client IP. */
  keyFn?: (req: Request) => string;
  prefix?: string;
  skip?: (req: Request) => boolean;
}

export function rateLimitMiddleware(opts: RateLimitMiddlewareOptions = {}) {
  const limiter = new RateLimitingService(opts.capacity, opts.refillPerSecond);
  return async (req: Request, res: Response, next: NextFunction) => {
    if (opts.skip?.(req)) return next();
    const id = opts.keyFn ? opts.keyFn(req) : (req.headers['x-user-id'] as string) || req.ip || 'anon';
    const d = await limiter.consume(`${opts.prefix ?? 'api'}:${id}`);
    res.setHeader('X-RateLimit-Limit', String(limiter.capacity));
    res.setHeader('X-RateLimit-Remaining', String(d.remaining));
    if (!d.allowed) {
      res.setHeader('Retry-After', String(d.retryAfter));
      return res.status(429).json({ success: false, error: 'Too many requests, slow down.', code: 'RATE_LIMITED', retryAfter: d.retryAfter });
    }
    next();
  };
}
