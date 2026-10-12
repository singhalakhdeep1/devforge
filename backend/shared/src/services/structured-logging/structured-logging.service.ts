/**
 * Structured Logging Service for DevForge
 * JSON log lines with correlation IDs and request context. The context lives in
 * AsyncLocalStorage, so concurrent requests never see each other's correlation id.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuidv4 } from 'uuid';

export interface LogContext {
  correlationId: string;
  userId?: string;
  projectId?: string;
  serviceId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: LogContext;
  additionalContext?: Record<string, any>;
  error?: string;
}

const storage = new AsyncLocalStorage<LogContext>();

export const runWithContext = <T>(context: LogContext, fn: () => T): T => storage.run(context, fn);
export const currentContext = (): LogContext | undefined => storage.getStore();
export const currentCorrelationId = (): string | undefined => storage.getStore()?.correlationId;

export class StructuredLoggingService {
  constructor(private readonly serviceId?: string) {}

  /** Replace the context for the remainder of the current async flow. */
  setContext(context: LogContext): void {
    storage.enterWith({ serviceId: this.serviceId, ...context });
  }

  getContext(): LogContext | null {
    return storage.getStore() ?? null;
  }

  logInformation(message: string, additionalContext?: Record<string, any>): void {
    console.log(JSON.stringify(this.createLogEntry('Information', message, additionalContext)));
  }

  logWarning(message: string, additionalContext?: Record<string, any>): void {
    console.warn(JSON.stringify(this.createLogEntry('Warning', message, additionalContext)));
  }

  logError(message: string, error: string, additionalContext?: Record<string, any>): void {
    console.error(JSON.stringify(this.createLogEntry('Error', message, additionalContext, error)));
  }

  logAuditEvent(eventType: string, description: string, additionalContext?: Record<string, any>): void {
    const context = { ...additionalContext, auditEventType: eventType, auditDescription: description };
    console.log(JSON.stringify(this.createLogEntry('Audit', `AUDIT: ${description}`, context)));
  }

  static createCorrelationId(): string {
    return uuidv4();
  }

  private createLogEntry(level: string, message: string, additionalContext?: Record<string, any>, error?: string): LogEntry {
    const base = storage.getStore() ?? { correlationId: StructuredLoggingService.createCorrelationId() };
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { serviceId: this.serviceId, ...base },
      additionalContext,
      error,
    };
  }
}

export const createLogger = (serviceId: string) => new StructuredLoggingService(serviceId);
