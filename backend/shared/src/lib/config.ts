/** Small typed helpers for reading environment variables. */

export const env = (name: string, fallback = ''): string => process.env[name] ?? fallback;

export const envInt = (name: string, fallback: number): number => {
  const n = parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
};

export const envBool = (name: string, fallback = false): boolean => {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};

export const requireEnv = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  return v;
};

export const isProd = (): boolean => process.env.NODE_ENV === 'production';

/** Where each service lives. Override with <NAME>_URL env vars (docker / k8s). */
export const SERVICE_PORTS = {
  gateway: 4000,
  auth: 4001,
  notification: 4002,
  email: 4003,
  file: 4004,
  analytics: 4005,
  websocket: 4006,
  course: 4007,
  editor: 4008,
  kanban: 4009,
  payment: 4010,
  video: 4011,
  search: 4012,
  project: 4013,
  audit: 4014,
  reporting: 4015,
  backup: 4016,
  monitoring: 4017,
  graphql: 4020,
  grpc: 4021,
  trpc: 4022,
  elasticsearch: 4018,
  kafka: 4023,
} as const;

export type ServiceName = keyof typeof SERVICE_PORTS;

export const serviceUrl = (name: ServiceName): string =>
  process.env[`${name.toUpperCase()}_SERVICE_URL`] ?? `http://localhost:${SERVICE_PORTS[name]}`;
