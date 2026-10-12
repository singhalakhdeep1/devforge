import Redis from 'ioredis';
import { env, envInt } from './config';

let shared: Redis | null = null;

/** Builds a new connection from REDIS_URL, or REDIS_HOST / REDIS_PORT / REDIS_PASSWORD. */
export function createRedis(opts: { name?: string; blocking?: boolean } = {}): Redis {
  const common = {
    connectionName: opts.name,
    maxRetriesPerRequest: opts.blocking ? null : 2,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy: (times: number) => Math.min(times * 200, 3000),
  };
  const client = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, common)
    : new Redis({ host: env('REDIS_HOST', 'localhost'), port: envInt('REDIS_PORT', 6379), password: process.env.REDIS_PASSWORD || undefined, ...common });
  // Without a listener ioredis would crash the process on connection errors; callers handle failures per command.
  client.on('error', () => undefined);
  return client;
}

/** Process-wide connection for ordinary commands. */
export function getRedis(): Redis {
  if (!shared) shared = createRedis({ name: 'devforge' });
  return shared;
}

export async function closeRedis(): Promise<void> {
  if (shared) {
    await shared.quit().catch(() => undefined);
    shared = null;
  }
}

export async function redisHealthy(client: Redis = getRedis()): Promise<boolean> {
  try {
    return (await client.ping()) === 'PONG';
  } catch {
    return false;
  }
}

export type { Redis };
