import crypto from 'node:crypto';
import { env, envBool, envInt, isProd } from '@devhub/shared';

export const cfg = {
  frontendUrl: env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, ''),
  /** Public base URL of the gateway: OAuth providers redirect back here. */
  publicApiUrl: env('PUBLIC_API_URL', 'http://localhost:4000').replace(/\/$/, ''),
  refreshDays: envInt('REFRESH_TOKEN_DAYS', 30),
  crossSiteCookies: envBool('CROSS_SITE_COOKIES', false),
  bcryptRounds: envInt('BCRYPT_ROUNDS', 12),
  maxLoginFailures: envInt('MAX_LOGIN_FAILURES', 5),
  lockoutSeconds: envInt('LOGIN_LOCKOUT_SECONDS', 900),
  /** Log verification / reset links when no email service consumes the events (development only). */
  debugLinks: envBool('AUTH_DEBUG_LINKS', !isProd()),
  /** 32-byte key derived from ENCRYPTION_KEY; encrypts TOTP secrets at rest. */
  encryptionKey: crypto.createHash('sha256').update(env('ENCRYPTION_KEY', 'dev-only-encryption-key')).digest(),
  mfaSecret: (process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-only-access-secret-change-me') + ':mfa',
  oauth: {
    google: { id: env('GOOGLE_CLIENT_ID'), secret: env('GOOGLE_CLIENT_SECRET') },
    github: { id: env('GITHUB_CLIENT_ID'), secret: env('GITHUB_CLIENT_SECRET') },
  },
};

export const cookieName = 'refreshToken';
export const cookieOptions = {
  httpOnly: true,
  secure: isProd() || cfg.crossSiteCookies,
  sameSite: (cfg.crossSiteCookies ? 'none' : 'lax') as 'none' | 'lax',
  path: '/api/auth',
  maxAge: cfg.refreshDays * 86_400_000,
};
