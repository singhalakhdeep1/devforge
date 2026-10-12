/**
 * Cache Service for DevForge
 * Distributed caching on Redis: get/set with TTL, get-or-set, JSON helpers,
 * pattern invalidation (SCAN, never KEYS) and hit/miss metrics.
 * Cache errors never break a request: a miss is returned and the source of truth is used.
 */
import type Redis from 'ioredis';
import { getRedis } from '../../lib/redis';
import { trackCacheAccess } from '../../lib/metrics';
import { createLogger } from '../structured-logging/structured-logging.service';

export class CacheService {
  private readonly defaultTTL = 3600;
  private readonly log;

  constructor(private readonly namespace = 'cache', private readonly service = 'shared', private readonly redis: Redis = getRedis()) {
    this.log = createLogger(service);
  }

  private k(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redis.get(this.k(key));
      trackCacheAccess('redis', this.namespace, this.service, value !== null);
      return value;
    } catch (e) {
      this.log.logWarning('cache get failed', { key, error: String(e) });
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.redis.set(this.k(key), value, 'EX', ttl || this.defaultTTL);
    } catch (e) {
      this.log.logWarning('cache set failed', { key, error: String(e) });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.k(key));
    } catch (e) {
      this.log.logWarning('cache delete failed', { key, error: String(e) });
    }
  }

  async getOrSet(key: string, factory: () => Promise<string>, ttl?: number): Promise<string> {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw === null) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  async setJSON(key: string, value: unknown, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  /** Cache-aside for JSON-serialisable values. */
  async remember<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
    const hit = await this.getJSON<T>(key);
    if (hit !== null) return hit;
    const value = await factory();
    if (value !== undefined && value !== null) await this.setJSON(key, value, ttl);
    return value;
  }

  /** Deletes every key in this namespace matching `pattern` (glob, e.g. "course:*"). */
  async invalidatePattern(pattern: string): Promise<number> {
    let removed = 0;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.redis.scan(cursor, 'MATCH', this.k(pattern), 'COUNT', 200);
        cursor = next;
        if (keys.length) removed += await this.redis.del(...keys);
      } while (cursor !== '0');
    } catch (e) {
      this.log.logWarning('cache invalidate failed', { pattern, error: String(e) });
    }
    return removed;
  }

  async clearAll(): Promise<number> {
    return this.invalidatePattern('*');
  }
}
