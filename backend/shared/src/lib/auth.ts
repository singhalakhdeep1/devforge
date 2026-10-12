import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './config';
import { AppError } from './errors';

export interface AuthUser {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const accessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-only-access-secret-change-me';

export const signAccessToken = (user: AuthUser, expiresIn: string = env('JWT_ACCESS_TTL', '15m')): string =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email, name: user.name }, accessSecret(), { expiresIn } as jwt.SignOptions);

export const verifyAccessToken = (token: string): AuthUser => {
  const p = jwt.verify(token, accessSecret()) as jwt.JwtPayload;
  return { id: String(p.sub), role: String(p.role ?? 'USER'), email: p.email as string | undefined, name: p.name as string | undefined };
};

/** Shared secret between the gateway and services. Requests carrying it are trusted to carry x-user-* headers. */
export const internalKey = (): string => process.env.INTERNAL_API_KEY || 'dev-only-internal-key';

export const userFromHeaders = (req: Request): AuthUser | undefined => {
  if (req.headers['x-internal-key'] !== internalKey()) return undefined;
  const id = req.headers['x-user-id'];
  if (!id) return undefined;
  return { id: String(id), role: String(req.headers['x-user-role'] ?? 'USER'), email: req.headers['x-user-email'] as string | undefined, name: req.headers['x-user-name'] as string | undefined };
};

/** Identify the caller if possible but do not require it. */
export const attachUser: RequestHandler = (req, _res, next) => {
  req.user = userFromHeaders(req);
  if (!req.user) {
    const h = req.headers.authorization;
    if (h?.startsWith('Bearer ')) {
      try { req.user = verifyAccessToken(h.slice(7)); } catch { /* invalid token: treated as anonymous */ }
    }
  }
  next();
};

/** Requires a signed-in user (via gateway headers or a bearer token). */
export const authenticate: RequestHandler = (req, res, next) => {
  attachUser(req, res, () => (req.user ? next() : next(AppError.unauthorized())));
};

export const requireRole = (...roles: string[]): RequestHandler => (req, res, next) => {
  authenticate(req, res, (err?: unknown) => {
    if (err) return next(err);
    return roles.includes(req.user!.role) ? next() : next(AppError.forbidden());
  });
};

/** Service-to-service endpoints: only callers that present the internal key. */
export const internalOnly: RequestHandler = (req: Request, _res: Response, next: NextFunction) =>
  req.headers['x-internal-key'] === internalKey() ? next() : next(AppError.forbidden('Internal endpoint'));
