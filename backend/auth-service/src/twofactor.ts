import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { cfg } from './config';

/** AES-256-GCM; stored as "iv:tag:ciphertext" (hex). */
export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', cfg.encryptionKey, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv.toString('hex'), cipher.getAuthTag().toString('hex'), data.toString('hex')].join(':');
}

export function decryptSecret(stored: string): string {
  const [iv, tag, data] = stored.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', cfg.encryptionKey, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]).toString('utf8');
}

export async function newSecret(email: string) {
  const s = speakeasy.generateSecret({ name: `DevForge (${email})`, issuer: 'DevForge', length: 20 });
  return { base32: s.base32, otpauthUrl: s.otpauth_url!, qrCode: await QRCode.toDataURL(s.otpauth_url!) };
}

export const verifyTotp = (base32: string, code: string): boolean =>
  /^\d{6}$/.test(code) && speakeasy.totp.verify({ secret: base32, encoding: 'base32', token: code, window: 1 });

export const newBackupCodes = (n = 10): string[] =>
  Array.from({ length: n }, () => {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${hex.slice(0, 4)}-${hex.slice(4)}`;
  });

export const hashBackupCodes = (codes: string[]) => Promise.all(codes.map((c) => bcrypt.hash(c, 8)));

/** Returns the remaining hashes when `code` matched one (it is consumed), otherwise null. */
export async function consumeBackupCode(hashes: string[], code: string): Promise<string[] | null> {
  const normalised = code.trim().toUpperCase();
  if (!/^[A-F0-9]{4}-[A-F0-9]{4}$/.test(normalised)) return null;
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(normalised, hashes[i])) return hashes.filter((_, n) => n !== i);
  }
  return null;
}
