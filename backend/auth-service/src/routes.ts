import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  AppError,
  TOPICS,
  asyncHandler,
  authenticate,
  createEventBus,
  createLogger,
  createServiceClient,
  emit,
  getRedis,
  internalOnly,
  rateLimitMiddleware,
  requireRole,
  signAccessToken,
  validate,
} from '@devhub/shared';
import { cfg, cookieName, cookieOptions } from './config';
import { prisma } from './db';
import type { Role, User } from './generated/client';
import { authorizeUrl, enabledProviders, exchangeCode, isProvider } from './oauth';
import {
  consumeEmailToken,
  createEmailToken,
  issueRefreshToken,
  revokeAllSessions,
  revokeRefreshToken,
  rotateRefreshToken,
  sha256,
  signMfaChallenge,
  verifyMfaChallenge,
} from './tokens';
import { consumeBackupCode, decryptSecret, encryptSecret, hashBackupCodes, newBackupCodes, newSecret, verifyTotp } from './twofactor';

const log = createLogger('auth');
const bus = createEventBus('auth');
const courses = createServiceClient('course');
const router = Router();

/* ───────────────────────── helpers ───────────────────────── */

const credentialLimit = rateLimitMiddleware({ capacity: 20, refillPerSecond: 20 / 900, prefix: 'auth' });

const publicUser = (u: User) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatar: u.avatar,
  role: u.role,
  bio: u.bio,
  location: u.location,
  skills: u.skills,
  githubUrl: u.githubUrl,
  linkedinUrl: u.linkedinUrl,
  portfolioUrl: u.portfolioUrl,
  isVerified: u.isVerified,
  twoFactorEnabled: u.twoFactorEnabled,
  hasPassword: Boolean(u.passwordHash),
  createdAt: u.createdAt,
});

const accessTokenFor = (u: Pick<User, 'id' | 'role' | 'email' | 'name'>) => signAccessToken({ id: u.id, role: u.role, email: u.email, name: u.name });

async function startSession(user: User, req: Request, res: Response) {
  const { token } = await issueRefreshToken(user.id, req);
  res.cookie(cookieName, token, cookieOptions);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  emit(bus, TOPICS.auditRecorded, 'auth.login', { actor: user.id, action: 'login', ip: req.ip, userAgent: req.headers['user-agent'] });
  return accessTokenFor(user);
}

function requestEmail(kind: 'verify' | 'reset' | 'welcome', user: Pick<User, 'id' | 'email' | 'name'>, url?: string) {
  if (url && cfg.debugLinks) log.logInformation(`[dev] ${kind} link for ${user.email}: ${url}`);
  emit(bus, TOPICS.emailRequested, `email.${kind}`, { to: user.email, name: user.name, template: kind, url });
}

async function sendVerification(user: User) {
  const token = await createEmailToken(user.id, 'VERIFY', 24 * 3_600_000);
  requestEmail('verify', user, `${cfg.frontendUrl}/verify/${token}`);
}

const hashPassword = (p: string) => bcrypt.hash(p, cfg.bcryptRounds);

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const emailRule = z.string().trim().toLowerCase().email('Please provide a valid email');

/** Counts failures per key and blocks further attempts once the limit is hit. */
async function guardAttempts(key: string): Promise<void> {
  const fails = Number((await getRedis().get(key).catch(() => null)) ?? 0);
  if (fails >= cfg.maxLoginFailures) {
    const ttl = await getRedis().ttl(key).catch(() => cfg.lockoutSeconds);
    throw new AppError(429, `Too many failed attempts. Try again in ${Math.ceil(Math.max(ttl, 1) / 60)} minute(s).`, 'LOCKED');
  }
}
async function recordFailure(key: string) {
  const r = getRedis();
  await r.multi().incr(key).expire(key, cfg.lockoutSeconds).exec().catch(() => undefined);
}
const clearFailures = (key: string) => getRedis().del(key).catch(() => undefined);

/* ───────────────────────── registration & sign-in ───────────────────────── */

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: emailRule,
  password: passwordRule,
  role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
});

router.post('/register', credentialLimit, validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body as z.infer<typeof registerSchema>;
  if (await prisma.user.findUnique({ where: { email } })) throw AppError.conflict('An account with this email already exists');

  const user = await prisma.user.create({ data: { name, email, role, passwordHash: await hashPassword(password) } });
  emit(bus, TOPICS.userRegistered, 'user.registered', { id: user.id, email, name, role: user.role, avatar: null, createdAt: user.createdAt }, user.id);
  void sendVerification(user).catch((e) => log.logWarning('could not queue verification email', { error: String(e) }));

  const accessToken = await startSession(user, req, res);
  res.status(201).json({ user: publicUser(user), accessToken });
}));

const loginSchema = z.object({ email: emailRule, password: z.string().min(1, 'Password is required') });

router.post('/login', credentialLimit, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const key = `auth:fail:${email}`;
  await guardAttempts(key);

  const user = await prisma.user.findUnique({ where: { email } });
  // identical error for unknown email, wrong password and password-less (OAuth) accounts
  const valid = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    await recordFailure(key);
    emit(bus, TOPICS.auditRecorded, 'auth.login_failed', { actor: user?.id ?? null, email, ip: req.ip });
    throw AppError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw AppError.forbidden('This account has been deactivated');
  await clearFailures(key);

  if (user.twoFactorEnabled) return res.json({ requires2FA: true, challengeToken: signMfaChallenge(user.id) });

  const accessToken = await startSession(user, req, res);
  res.json({ user: publicUser(user), accessToken });
}));

const mfaLoginSchema = z.object({ challengeToken: z.string().min(1), code: z.string().trim().min(6).max(12) });

router.post('/login/2fa', credentialLimit, validate(mfaLoginSchema), asyncHandler(async (req, res) => {
  const { challengeToken, code } = req.body as z.infer<typeof mfaLoginSchema>;
  const userId = verifyMfaChallenge(challengeToken);
  const key = `auth:fail2fa:${userId}`;
  await guardAttempts(key);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) throw AppError.unauthorized('Invalid code');

  let ok = verifyTotp(decryptSecret(user.twoFactorSecret), code);
  if (!ok) {
    const remaining = await consumeBackupCode(user.twoFactorBackupCodes, code);
    if (remaining) {
      ok = true;
      await prisma.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: remaining } });
    }
  }
  if (!ok) {
    await recordFailure(key);
    throw AppError.unauthorized('Invalid code');
  }
  await clearFailures(key);
  const accessToken = await startSession(user, req, res);
  res.json({ user: publicUser(user), accessToken });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = parseCookie(req.headers.cookie)[cookieName];
  if (!token) throw AppError.unauthorized('No session');
  const rotated = await rotateRefreshToken(token, req);
  if (!rotated) {
    res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
    throw AppError.unauthorized('Session expired, please sign in again');
  }
  const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
  if (!user || !user.isActive) throw AppError.unauthorized('Account is no longer available');
  res.cookie(cookieName, rotated.newToken, cookieOptions);
  res.json({ user: publicUser(user), accessToken: accessTokenFor(user) });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const token = parseCookie(req.headers.cookie)[cookieName];
  if (token) await revokeRefreshToken(token);
  res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out' });
}));

router.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  await revokeAllSessions(req.user!.id);
  res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Signed out of all devices' });
}));

/** Minimal cookie parser so the service also works when called without cookie-parser middleware. */
function parseCookie(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/* ───────────────────────── profile ───────────────────────── */

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw AppError.unauthorized('Account no longer exists');
  res.json(publicUser(user));
}));

const optionalUrl = z.union([z.literal(''), z.string().trim().url().max(300)]).transform((v) => (v === '' ? null : v));
const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  location: z.string().trim().max(100).nullable().optional(),
  avatar: z.string().trim().max(500).nullable().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  githubUrl: optionalUrl.optional(),
  linkedinUrl: optionalUrl.optional(),
  portfolioUrl: optionalUrl.optional(),
});

router.patch('/me', authenticate, validate(profileSchema), asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: req.body });
  emit(bus, TOPICS.userUpdated, 'user.updated', { id: user.id, name: user.name, avatar: user.avatar, role: user.role }, user.id);
  res.json(publicUser(user));
}));

const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordRule });

router.post('/change-password', authenticate, credentialLimit, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!user.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw AppError.badRequest('Current password is incorrect');
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
  await revokeAllSessions(user.id);
  emit(bus, TOPICS.auditRecorded, 'auth.password_changed', { actor: user.id });
  // keep this device signed in
  const { token } = await issueRefreshToken(user.id, req);
  res.cookie(cookieName, token, cookieOptions);
  res.json({ message: 'Password updated. Other devices were signed out.' });
}));

router.delete('/me', authenticate, validate(z.object({ password: z.string().optional() })), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (user.passwordHash && !(await bcrypt.compare(String(req.body.password ?? ''), user.passwordHash))) throw AppError.badRequest('Password is incorrect');
  // Deleting an instructor would delete their courses out from under enrolled students.
  // Fails closed: if the course service cannot answer, the account is kept.
  const check = await courses.get<{ allowed: boolean; reason?: string }>(`/internal/users/${user.id}/can-delete`);
  if (!check.allowed) throw AppError.conflict(check.reason ?? 'This account cannot be deleted right now');
  await prisma.user.delete({ where: { id: user.id } });
  emit(bus, TOPICS.userDeleted, 'user.deleted', { id: user.id, email: user.email }, user.id);
  res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Account deleted' });
}));

/* ───────────────────────── email verification & password reset ───────────────────────── */

router.post('/verify', validate(z.object({ token: z.string().min(1) })), asyncHandler(async (req, res) => {
  const userId = await consumeEmailToken(req.body.token, 'VERIFY');
  const user = await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  emit(bus, TOPICS.userUpdated, 'user.verified', { id: user.id, name: user.name, avatar: user.avatar, role: user.role, isVerified: true }, user.id);
  requestEmail('welcome', user);
  res.json({ message: 'Email verified' });
}));

router.post('/resend-verification', authenticate, credentialLimit, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (user.isVerified) return res.json({ message: 'Email already verified' });
  await sendVerification(user);
  res.json({ message: 'Verification email sent' });
}));

router.post('/forgot-password', credentialLimit, validate(z.object({ email: emailRule })), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user && user.isActive) {
    const token = await createEmailToken(user.id, 'RESET', 3_600_000);
    requestEmail('reset', user, `${cfg.frontendUrl}/reset-password/${token}`);
  }
  // same answer whether or not the account exists (no email enumeration)
  res.json({ message: 'If that email exists, a reset link has been sent' });
}));

router.post('/reset-password', credentialLimit, validate(z.object({ token: z.string().min(1), password: passwordRule })), asyncHandler(async (req, res) => {
  const userId = await consumeEmailToken(req.body.token, 'RESET');
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(req.body.password) } });
  await revokeAllSessions(userId);
  emit(bus, TOPICS.auditRecorded, 'auth.password_reset', { actor: userId });
  res.json({ message: 'Password reset. Please sign in with your new password.' });
}));

/* ───────────────────────── sessions ───────────────────────── */

router.get('/sessions', authenticate, asyncHandler(async (req, res) => {
  const current = parseCookie(req.headers.cookie)[cookieName];
  const currentHash = current ? sha256(current) : null;
  const rows = await prisma.refreshToken.findMany({
    where: { userId: req.user!.id, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(rows.map((s) => ({ id: s.id, userAgent: s.userAgent, ip: s.ip, createdAt: s.createdAt, lastUsedAt: s.lastUsedAt, current: s.tokenHash === currentHash })));
}));

router.delete('/sessions/:id', authenticate, asyncHandler(async (req, res) => {
  const r = await prisma.refreshToken.updateMany({ where: { id: req.params.id, userId: req.user!.id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (r.count === 0) throw AppError.notFound('Session not found');
  res.json({ message: 'Session revoked' });
}));

/* ───────────────────────── two-factor ───────────────────────── */

router.get('/2fa/status', authenticate, asyncHandler(async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ enabled: u.twoFactorEnabled, backupCodesRemaining: u.twoFactorBackupCodes.length });
}));

router.post('/2fa/setup', authenticate, asyncHandler(async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (u.twoFactorEnabled) throw AppError.conflict('Two-factor authentication is already enabled');
  const s = await newSecret(u.email);
  await prisma.user.update({ where: { id: u.id }, data: { twoFactorSecret: encryptSecret(s.base32) } });
  res.json({ secret: s.base32, otpauthUrl: s.otpauthUrl, qrCode: s.qrCode });
}));

router.post('/2fa/enable', authenticate, credentialLimit, validate(z.object({ code: z.string().trim().length(6) })), asyncHandler(async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (u.twoFactorEnabled) throw AppError.conflict('Two-factor authentication is already enabled');
  if (!u.twoFactorSecret) throw AppError.badRequest('Start setup first');
  if (!verifyTotp(decryptSecret(u.twoFactorSecret), req.body.code)) throw AppError.badRequest('That code is not valid');
  const codes = newBackupCodes();
  await prisma.user.update({ where: { id: u.id }, data: { twoFactorEnabled: true, twoFactorBackupCodes: await hashBackupCodes(codes) } });
  emit(bus, TOPICS.auditRecorded, 'auth.2fa_enabled', { actor: u.id });
  res.json({ enabled: true, backupCodes: codes });
}));

const disable2faSchema = z.object({ password: z.string().optional(), code: z.string().trim().min(6).max(12) });

router.post('/2fa/disable', authenticate, credentialLimit, validate(disable2faSchema), asyncHandler(async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!u.twoFactorEnabled || !u.twoFactorSecret) throw AppError.badRequest('Two-factor authentication is not enabled');
  if (u.passwordHash && !(await bcrypt.compare(String(req.body.password ?? ''), u.passwordHash))) throw AppError.badRequest('Password is incorrect');
  const ok = verifyTotp(decryptSecret(u.twoFactorSecret), req.body.code) || (await consumeBackupCode(u.twoFactorBackupCodes, req.body.code)) !== null;
  if (!ok) throw AppError.badRequest('That code is not valid');
  await prisma.user.update({ where: { id: u.id }, data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] } });
  emit(bus, TOPICS.auditRecorded, 'auth.2fa_disabled', { actor: u.id });
  res.json({ enabled: false });
}));

router.post('/2fa/backup-codes', authenticate, credentialLimit, validate(z.object({ code: z.string().trim().length(6) })), asyncHandler(async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!u.twoFactorEnabled || !u.twoFactorSecret) throw AppError.badRequest('Two-factor authentication is not enabled');
  if (!verifyTotp(decryptSecret(u.twoFactorSecret), req.body.code)) throw AppError.badRequest('That code is not valid');
  const codes = newBackupCodes();
  await prisma.user.update({ where: { id: u.id }, data: { twoFactorBackupCodes: await hashBackupCodes(codes) } });
  res.json({ backupCodes: codes });
}));

/* ───────────────────────── OAuth ───────────────────────── */

router.get('/oauth/providers', (_req, res) => res.json({ providers: enabledProviders() }));

router.get('/oauth/:provider', asyncHandler(async (req, res) => {
  if (!isProvider(req.params.provider)) throw AppError.notFound('Unknown provider');
  res.redirect(await authorizeUrl(req.params.provider));
}));

router.get('/oauth/:provider/callback', asyncHandler(async (req, res) => {
  const fail = (reason: string) => res.redirect(`${cfg.frontendUrl}/login?error=${encodeURIComponent(reason)}`);
  const provider = req.params.provider;
  if (!isProvider(provider)) return fail('Unknown provider');
  const { code, state, error } = req.query as Record<string, string | undefined>;
  if (error || !code || !state) return fail('Sign-in was cancelled');

  let profile;
  try {
    profile = await exchangeCode(provider, code, state);
  } catch (e) {
    log.logWarning('oauth exchange failed', { provider, error: String(e) });
    return fail('Could not sign in with ' + provider);
  }

  let user: User | null = null;
  const linked = await prisma.oAuthAccount.findUnique({ where: { provider_providerId: { provider, providerId: profile.providerId } }, include: { user: true } });
  if (linked) user = linked.user;
  else {
    // link to an existing account only when the provider vouches for the email
    if (profile.email && profile.emailVerified) user = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });
    if (!user) {
      if (!profile.email || !profile.emailVerified) return fail(`${provider} did not share a verified email address`);
      user = await prisma.user.create({ data: { email: profile.email.toLowerCase(), name: profile.name, avatar: profile.avatar, isVerified: true } });
      emit(bus, TOPICS.userRegistered, 'user.registered', { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, createdAt: user.createdAt }, user.id);
    }
    await prisma.oAuthAccount.create({ data: { provider, providerId: profile.providerId, email: profile.email, userId: user.id } });
  }
  if (!user.isActive) return fail('This account has been deactivated');

  const { token } = await issueRefreshToken(user.id, req);
  res.cookie(cookieName, token, cookieOptions);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  // The SPA exchanges the new refresh cookie for an access token via POST /api/auth/refresh
  res.redirect(`${cfg.frontendUrl}/oauth/callback`);
}));

/* ───────────────────────── admin ───────────────────────── */

const adminOnly = requireRole('ADMIN');

router.get('/admin/users', adminOnly, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = String(req.query.search ?? '').trim();
  const role = String(req.query.role ?? '');
  const where = {
    ...(search ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(['STUDENT', 'INSTRUCTOR', 'MODERATOR', 'ADMIN'].includes(role) ? { role: role as Role } : {}),
  };
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ]);
  res.json({ data: users.map((u) => ({ ...publicUser(u), isActive: u.isActive, lastLoginAt: u.lastLoginAt })), total, page, pageSize: limit, totalPages: Math.ceil(total / limit) });
}));

router.patch('/admin/users/:id/role', adminOnly, validate(z.object({ role: z.enum(['STUDENT', 'INSTRUCTOR', 'MODERATOR', 'ADMIN']) })), asyncHandler(async (req, res) => {
  if (req.params.id === req.user!.id) throw AppError.badRequest('You cannot change your own role');
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } }).catch(() => null);
  if (!user) throw AppError.notFound('User not found');
  emit(bus, TOPICS.userUpdated, 'user.role_changed', { id: user.id, name: user.name, avatar: user.avatar, role: user.role }, user.id);
  emit(bus, TOPICS.auditRecorded, 'admin.role_changed', { actor: req.user!.id, target: user.id, role: user.role });
  res.json(publicUser(user));
}));

router.patch('/admin/users/:id/active', adminOnly, validate(z.object({ active: z.boolean() })), asyncHandler(async (req, res) => {
  if (req.params.id === req.user!.id) throw AppError.badRequest('You cannot deactivate yourself');
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: req.body.active } }).catch(() => null);
  if (!user) throw AppError.notFound('User not found');
  if (!req.body.active) await revokeAllSessions(user.id);
  emit(bus, TOPICS.auditRecorded, 'admin.user_active_changed', { actor: req.user!.id, target: user.id, active: user.isActive });
  res.json({ id: user.id, isActive: user.isActive });
}));

/* ───────────────────────── internal (service to service) ───────────────────────── */

export const internalRouter = Router();
internalRouter.use(internalOnly);

const brief = (u: User) => ({ id: u.id, name: u.name, avatar: u.avatar, role: u.role, email: u.email, isVerified: u.isVerified });

internalRouter.get('/users/:id', asyncHandler(async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) throw AppError.notFound('User not found');
  res.json(brief(u));
}));

/** Called by the file-service after it stored a new avatar; returns the old one so it can be deleted. */
internalRouter.patch('/users/:id/avatar', validate(z.object({ avatar: z.string().max(500).nullable() })), asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id }, select: { avatar: true } });
  if (!existing) throw AppError.notFound('User not found');
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { avatar: req.body.avatar } });
  emit(bus, TOPICS.userUpdated, 'user.updated', { id: user.id, name: user.name, avatar: user.avatar, role: user.role }, user.id);
  res.json({ avatar: user.avatar, previous: existing.avatar });
}));

internalRouter.get('/users/by-email/:email', asyncHandler(async (req, res) => {
  const u = await prisma.user.findUnique({ where: { email: req.params.email.toLowerCase() } });
  if (!u) throw AppError.notFound('User not found');
  res.json(brief(u));
}));

internalRouter.post('/users/lookup', validate(z.object({ ids: z.array(z.string()).max(200) })), asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ where: { id: { in: req.body.ids } } });
  res.json(users.map(brief));
}));

export default router;
