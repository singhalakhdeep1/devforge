/** The shared structured logger, with the winston-style calls this service already uses. */
import { createLogger } from '@devhub/shared';

const log = createLogger('video');
const ctx = (extra: unknown[]) => (extra.length ? { detail: extra.map((e) => (e instanceof Error ? e.message : e)) } : undefined);

export const logger = {
    debug: (msg: string, ...extra: unknown[]) => { if (process.env.LOG_LEVEL === 'debug') log.logInformation(msg, ctx(extra)); },
    info: (msg: string, ...extra: unknown[]) => log.logInformation(msg, ctx(extra)),
    warn: (msg: string, ...extra: unknown[]) => log.logWarning(msg, ctx(extra)),
    error: (msg: string, ...extra: unknown[]) => log.logError(msg, extra[0] instanceof Error ? extra[0].message : String(extra[0] ?? ''), ctx(extra.slice(1))),
};
