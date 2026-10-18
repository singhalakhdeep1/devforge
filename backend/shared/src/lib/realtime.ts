import type Redis from 'ioredis';
import { getRedis } from './redis';

/** Redis pub/sub channel the websocket-server listens on and fans out to connected browsers. */
export const REALTIME_CHANNEL = 'devforge:realtime';

export interface RealtimeMessage {
  /** Socket.IO room, e.g. `user:<id>` or `board:<id>`. */
  room: string;
  event: string;
  payload: unknown;
}

/** Push an event to every browser tab in a room. Best effort: realtime is a convenience, never a dependency. */
export async function publishRealtime(message: RealtimeMessage, redis: Redis = getRedis()): Promise<void> {
  try {
    await redis.publish(REALTIME_CHANNEL, JSON.stringify(message));
  } catch {
    /* pushes are best-effort; the data is already stored */
  }
}

export const toUser = (userId: string, event: string, payload: unknown) => publishRealtime({ room: `user:${userId}`, event, payload });

/** Presence: the websocket-server keeps open-connection counts per user and announces changes here. */
export const PRESENCE_CHANNEL = 'devforge:presence';
export const PRESENCE_KEY = 'devforge:online';

export interface PresenceChange {
  userId: string;
  name: string;
  online: boolean;
  at: string;
}

/** Users with at least one open connection (any websocket-server instance). */
export async function onlineUsers(redis: Redis = getRedis()): Promise<{ userId: string; name: string }[]> {
  const all = await redis.hgetall(PRESENCE_KEY);
  return Object.entries(all)
    .map(([userId, v]) => { const [count, ...name] = v.split('|'); return { userId, name: name.join('|'), count: Number(count) }; })
    .filter((u) => u.count > 0)
    .map(({ userId, name }) => ({ userId, name }));
}
