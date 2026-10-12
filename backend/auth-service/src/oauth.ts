import crypto from 'node:crypto';
import axios from 'axios';
import { AppError, getRedis } from '@devhub/shared';
import { cfg } from './config';

export type Provider = 'google' | 'github';

interface ProviderDef {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
}

const defs: Record<Provider, ProviderDef> = {
  google: { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scope: 'openid email profile' },
  github: { authorizeUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token', scope: 'read:user user:email' },
};

export const isProvider = (p: string): p is Provider => p === 'google' || p === 'github';
export const enabledProviders = (): Provider[] => (['google', 'github'] as Provider[]).filter((p) => cfg.oauth[p].id && cfg.oauth[p].secret);
const redirectUri = (p: Provider) => `${cfg.publicApiUrl}/api/auth/oauth/${p}/callback`;

export async function authorizeUrl(provider: Provider): Promise<string> {
  if (!enabledProviders().includes(provider)) throw new AppError(501, `Sign in with ${provider} is not configured on this server`, 'OAUTH_DISABLED');
  const state = crypto.randomBytes(24).toString('hex');
  await getRedis().set(`oauth:state:${state}`, provider, 'EX', 600);
  const q = new URLSearchParams({ client_id: cfg.oauth[provider].id, redirect_uri: redirectUri(provider), response_type: 'code', scope: defs[provider].scope, state });
  return `${defs[provider].authorizeUrl}?${q}`;
}

export interface OAuthProfile {
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  avatar: string | null;
}

export async function exchangeCode(provider: Provider, code: string, state: string): Promise<OAuthProfile> {
  const key = `oauth:state:${state}`;
  const stored = await getRedis().get(key);
  if (!stored || stored !== provider) throw AppError.badRequest('Sign-in session expired, please try again');
  await getRedis().del(key); // single use

  const { id, secret } = cfg.oauth[provider];
  const tokenRes = await axios.post(
    defs[provider].tokenUrl,
    new URLSearchParams({ client_id: id, client_secret: secret, code, redirect_uri: redirectUri(provider), grant_type: 'authorization_code' }).toString(),
    { headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 },
  );
  const accessToken = tokenRes.data?.access_token as string | undefined;
  if (!accessToken) throw AppError.badRequest('The provider did not return an access token');
  const auth = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'User-Agent': 'devforge-auth' };

  if (provider === 'google') {
    const u = (await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: auth, timeout: 8000 })).data;
    return { providerId: String(u.sub), email: u.email ?? null, emailVerified: Boolean(u.email_verified), name: u.name ?? u.email ?? 'Google user', avatar: u.picture ?? null };
  }
  const u = (await axios.get('https://api.github.com/user', { headers: auth, timeout: 8000 })).data;
  const emails = (await axios.get('https://api.github.com/user/emails', { headers: auth, timeout: 8000 }).catch(() => ({ data: [] }))).data as { email: string; primary: boolean; verified: boolean }[];
  const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
  return { providerId: String(u.id), email: primary?.email ?? null, emailVerified: Boolean(primary), name: u.name ?? u.login, avatar: u.avatar_url ?? null };
}
