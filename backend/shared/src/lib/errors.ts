import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { createLogger } from '../services/structured-logging/structured-logging.service';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
  static badRequest(msg: string, details?: unknown) { return new AppError(400, msg, 'BAD_REQUEST', details); }
  static unauthorized(msg = 'Authentication required') { return new AppError(401, msg, 'UNAUTHORIZED'); }
  static forbidden(msg = 'You do not have access to this resource') { return new AppError(403, msg, 'FORBIDDEN'); }
  static notFound(msg = 'Not found') { return new AppError(404, msg, 'NOT_FOUND'); }
  static conflict(msg: string) { return new AppError(409, msg, 'CONFLICT'); }
  static tooMany(msg = 'Too many requests') { return new AppError(429, msg, 'RATE_LIMITED'); }
  static unavailable(msg = 'Service unavailable') { return new AppError(503, msg, 'UNAVAILABLE'); }
}

/** Wraps an async route so rejected promises reach the error handler. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };

/** Validates req.body / req.query / req.params with a zod schema and replaces them with the parsed value. */
export const validate =
  (schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body'): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      return next(AppError.badRequest('Validation failed', parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))));
    }
    (req as any)[source] = parsed.data;
    next();
  };

export const notFoundHandler: RequestHandler = (req, _res, next) => next(AppError.notFound(`Route ${req.method} ${req.path} not found`));

export const errorHandler = (service: string) => {
  const log = createLogger(service);
  return (err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', code: 'BAD_REQUEST', details: err.issues });
    }
    if (err instanceof AppError) {
      if (err.statusCode >= 500) log.logError(err.message, err.stack ?? '');
      return res.status(err.statusCode).json({ success: false, error: err.message, code: err.code, details: err.details });
    }
    if (err?.type === 'entity.too.large') return res.status(413).json({ success: false, error: 'Payload too large', code: 'TOO_LARGE' });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ success: false, error: 'Invalid JSON body', code: 'BAD_REQUEST' });
    log.logError('Unhandled error', err?.stack ?? String(err));
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL' });
  };
};
