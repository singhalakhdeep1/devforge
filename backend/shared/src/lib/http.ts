/**
 * Service-to-service HTTP client with timeouts, one retry for idempotent calls and a circuit breaker,
 * so a failing downstream service degrades gracefully instead of cascading.
 */
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { serviceUrl, type ServiceName } from './config';
import { AppError } from './errors';
import { internalKey } from './auth';
import { currentContext } from '../services/structured-logging/structured-logging.service';

type State = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: State = 'closed';
  private failures = 0;
  private openedAt = 0;

  constructor(public readonly name: string, private readonly failureThreshold = 5, private readonly resetMs = 10_000) {}

  get status(): State {
    if (this.state === 'open' && Date.now() - this.openedAt >= this.resetMs) this.state = 'half-open';
    return this.state;
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.status === 'open') throw AppError.unavailable(`${this.name} is temporarily unavailable`);
    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'closed';
      return result;
    } catch (e) {
      if (isServerFault(e)) {
        this.failures++;
        if (this.state === 'half-open' || this.failures >= this.failureThreshold) {
          this.state = 'open';
          this.openedAt = Date.now();
        }
      }
      throw e;
    }
  }
}

const isServerFault = (e: unknown): boolean => {
  if (e instanceof AppError) return e.statusCode >= 500;
  const ax = e as AxiosError;
  return !ax.response || ax.response.status >= 500;
};

export interface ServiceClient {
  readonly breaker: CircuitBreaker;
  request<T = any>(config: AxiosRequestConfig, user?: { id: string; role: string; email?: string; name?: string }): Promise<T>;
  get<T = any>(path: string, params?: object, user?: { id: string; role: string }): Promise<T>;
  post<T = any>(path: string, body?: unknown, user?: { id: string; role: string }): Promise<T>;
  put<T = any>(path: string, body?: unknown, user?: { id: string; role: string }): Promise<T>;
  patch<T = any>(path: string, body?: unknown, user?: { id: string; role: string }): Promise<T>;
  delete<T = any>(path: string, user?: { id: string; role: string }): Promise<T>;
}

export function createServiceClient(name: ServiceName, opts: { baseURL?: string; timeoutMs?: number } = {}): ServiceClient {
  const http: AxiosInstance = axios.create({ baseURL: opts.baseURL ?? serviceUrl(name), timeout: opts.timeoutMs ?? 5000 });
  const breaker = new CircuitBreaker(`${name}-service`);

  const request = async <T>(config: AxiosRequestConfig, user?: { id: string; role: string; email?: string; name?: string }): Promise<T> => {
    const ctx = currentContext();
    const headers: Record<string, string> = {
      'x-internal-key': internalKey(),
      ...(ctx?.correlationId ? { 'x-correlation-id': ctx.correlationId } : {}),
      ...(user ? { 'x-user-id': user.id, 'x-user-role': user.role, ...(user.email ? { 'x-user-email': user.email } : {}), ...(user.name ? { 'x-user-name': user.name } : {}) } : {}),
    };
    const attempts = (config.method ?? 'get').toLowerCase() === 'get' ? 2 : 1;
    return breaker.exec(async () => {
      let last: unknown;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await http.request<T>({ ...config, headers: { ...headers, ...config.headers } });
          return res.data;
        } catch (e) {
          last = e;
          if (!isServerFault(e)) break;
        }
      }
      const ax = last as AxiosError<{ error?: string; code?: string }>;
      if (ax.response) throw new AppError(ax.response.status, ax.response.data?.error ?? ax.message, ax.response.data?.code);
      throw AppError.unavailable(`${name}-service is unreachable`);
    });
  };

  return {
    breaker,
    request,
    get: (path, params, user) => request({ method: 'get', url: path, params }, user),
    post: (path, data, user) => request({ method: 'post', url: path, data }, user),
    put: (path, data, user) => request({ method: 'put', url: path, data }, user),
    patch: (path, data, user) => request({ method: 'patch', url: path, data }, user),
    delete: (path, user) => request({ method: 'delete', url: path }, user),
  };
}
