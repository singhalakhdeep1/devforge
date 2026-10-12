import crypto from 'node:crypto';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@devhub/shared';
import { cfg } from './config';
import { prisma } from './db';
import type { EmailPurpose } from './generated/client';

export const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const random = (bytes = 48) => crypto.randomBytes(bytes).toString('base64url');

/** Opaque refresh token. Only its hash is stored, so a database leak cannot be replayed. */
export async function issueRefreshToken(userId: string, req: Request, familyId: string = crypto.randomUUID()) {
  const token = random();
  const record = await prisma.refreshToken.create({
    data: {
      tokenHash: sha256(token),
      familyId,
      userId,
      userAgent: String(req.headers['user-agent'] ?? '').slice(0, 250) || null,
      ip: req.ip ?? null,
      expiresAt: new Date(Date.now() + cfg.refreshDays * 86_400_000),
    },
  });
  return { token, id: record.id, familyId };
}

const GRACE_MS = 10_000;

/**
 * Validates and rotates a refresh token.
 * Presenting a token that was already rotated (outside a short grace window for parallel tabs)
 * means it was probably stolen, so the entire family of sessions is revoked.
 */
export async function rotateRefreshToken(token: string, req: Request): Promise<{ userId: string; newToken: string } | null> {
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!record) return null;

  if (record.revokedAt) {
    if (record.replacedById && Date.now() - record.revokedAt.getTime() < GRACE_MS) {
      // two tabs refreshed at once: hand out a sibling token in the same family
      const sibling = await issueRefreshToken(record.userId, req, record.familyId);
      return { userId: record.userId, newToken: sibling.token };
    }
    await prisma.refreshToken.updateMany({ where: { familyId: record.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    return null;
  }
  if (record.expiresAt < new Date()) return null;

  const next = await issueRefreshToken(record.userId, req, record.familyId);
  // conditional update: only one concurrent request can win the rotation
  const won = await prisma.refreshToken.updateMany({
    where: { id: record.id, revokedAt: null },
    data: { revokedAt: new Date(), replacedById: next.id, lastUsedAt: new Date() },
  });
  if (won.count === 0) {
    await prisma.refreshToken.delete({ where: { id: next.id } }).catch(() => undefined);
    return rotateRefreshToken(token, req);
  }
  return { userId: record.userId, newToken: next.token };
}

export const revokeRefreshToken = (token: string) =>
  prisma.refreshToken.updateMany({ where: { tokenHash: sha256(token), revokedAt: null }, data: { revokedAt: new Date() } });

export const revokeAllSessions = (userId: string) =>
  prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

/** One-time token for email links (verify address / reset password). */
export async function createEmailToken(userId: string, purpose: EmailPurpose, ttlMs: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  // a new link invalidates older unused ones of the same kind
  await prisma.emailToken.deleteMany({ where: { userId, purpose, usedAt: null } });
  await prisma.emailToken.create({ data: { userId, purpose, tokenHash: sha256(token), expiresAt: new Date(Date.now() + ttlMs) } });
  return token;
}

export async function consumeEmailToken(token: string, purpose: EmailPurpose): Promise<string> {
  const rec = await prisma.emailToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!rec || rec.purpose !== purpose || rec.usedAt || rec.expiresAt < new Date()) {
    throw AppError.badRequest(purpose === 'VERIFY' ? 'Invalid or expired verification link' : 'Invalid or expired reset link');
  }
  const used = await prisma.emailToken.updateMany({ where: { id: rec.id, usedAt: null }, data: { usedAt: new Date() } });
  if (used.count === 0) throw AppError.badRequest('This link has already been used');
  return rec.userId;
}

/** Short-lived proof that the password step passed; exchanged for a session after the 2FA code. */
export const signMfaChallenge = (userId: string) => jwt.sign({ sub: userId, purpose: 'mfa' }, cfg.mfaSecret, { expiresIn: '5m' });
export const verifyMfaChallenge = (token: string): string => {
  try {
    const p = jwt.verify(token, cfg.mfaSecret) as jwt.JwtPayload;
    if (p.purpose !== 'mfa' || !p.sub) throw new Error('bad');
    return String(p.sub);
  } catch {
    throw AppError.unauthorized('Your sign-in attempt expired, please start again');
  }
};
