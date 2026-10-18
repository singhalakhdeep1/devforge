/**
 * Event bus for inter-service events.
 *  - Kafka (kafkajs) when KAFKA_BROKERS is set: the production transport named in the HLD.
 *  - Redis Streams with consumer groups otherwise: same semantics (at-least-once, consumer groups,
 *    replay, dead-letter topic), so the system runs with only Redis available.
 * Handlers must be idempotent: delivery is at-least-once.
 */
import type Redis from 'ioredis';
import { Kafka, logLevel, type Consumer, type Producer } from 'kafkajs';
import { v4 as uuid } from 'uuid';
import { env } from './config';
import { createRedis, getRedis } from './redis';
import { createLogger, currentCorrelationId, runWithContext } from '../services/structured-logging/structured-logging.service';

export const TOPICS = {
  userRegistered: 'devforge.user.registered',
  userUpdated: 'devforge.user.updated',
  userDeleted: 'devforge.user.deleted',
  courseEnrolled: 'devforge.course.enrolled',
  courseCompleted: 'devforge.course.completed',
  courseChanged: 'devforge.course.changed',
  coursePublished: 'devforge.course.published',
  lessonCompleted: 'devforge.lesson.completed',
  certificateIssued: 'devforge.certificate.issued',
  paymentSucceeded: 'devforge.payment.succeeded',
  paymentRefunded: 'devforge.payment.refunded',
  subscriptionChanged: 'devforge.subscription.changed',
  projectCreated: 'devforge.project.created',
  projectUpdated: 'devforge.project.updated',
  projectChanged: 'devforge.project.changed',
  taskChanged: 'devforge.task.changed',
  fileUploaded: 'devforge.file.uploaded',
  documentChanged: 'devforge.document.changed',
  notificationRequested: 'devforge.notification.requested',
  emailRequested: 'devforge.email.requested',
  auditRecorded: 'devforge.audit.recorded',
  analyticsTracked: 'devforge.analytics.tracked',
} as const;

export interface DomainEvent<T = any> {
  id: string;
  type: string;
  topic: string;
  source: string;
  correlationId?: string;
  timestamp: string;
  data: T;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export interface EventBus {
  readonly kind: 'kafka' | 'redis-streams';
  publish<T>(topic: string, type: string, data: T, key?: string): Promise<DomainEvent<T>>;
  /** Send an existing envelope unchanged (same id), e.g. when replaying dead letters. */
  republish(event: DomainEvent, key?: string): Promise<void>;
  /** `replay`: a brand-new consumer group starts from the oldest retained event instead of from now. */
  subscribe(topic: string, group: string, handler: EventHandler, opts?: { replay?: boolean }): Promise<void>;
  healthy(): Promise<boolean>;
  close(): Promise<void>;
}

const MAX_ATTEMPTS = 3;

async function deliver(handler: EventHandler, event: DomainEvent, log: ReturnType<typeof createLogger>): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await runWithContext({ correlationId: event.correlationId ?? event.id, serviceId: event.source }, () => handler(event));
      return true;
    } catch (e) {
      log.logWarning('event handler failed', { topic: event.topic, eventId: event.id, attempt, error: String(e) });
      await new Promise((r) => setTimeout(r, attempt * 200));
    }
  }
  return false;
}

function envelope<T>(source: string, topic: string, type: string, data: T): DomainEvent<T> {
  return { id: uuid(), type, topic, source, correlationId: currentCorrelationId(), timestamp: new Date().toISOString(), data };
}

/* ───────────────────────────── Kafka ───────────────────────────── */

class KafkaEventBus implements EventBus {
  readonly kind = 'kafka' as const;
  private readonly kafka: Kafka;
  private producer?: Producer;
  private producerReady?: Promise<Producer>;
  private consumers: Consumer[] = [];
  private readonly log;

  constructor(private readonly service: string, brokers: string[]) {
    this.kafka = new Kafka({ clientId: `devforge-${service}`, brokers, logLevel: logLevel.NOTHING, retry: { retries: 8, initialRetryTime: 300 } });
    this.log = createLogger(service);
  }

  private getProducer(): Promise<Producer> {
    this.producerReady ??= (async () => {
      const p = this.kafka.producer({ allowAutoTopicCreation: true, idempotent: true, maxInFlightRequests: 1 });
      await p.connect();
      this.producer = p;
      return p;
    })().catch((e) => { this.producerReady = undefined; throw e; });
    return this.producerReady;
  }

  private async ensureTopic(topic: string): Promise<void> {
    const admin = this.kafka.admin();
    try {
      await admin.connect();
      await admin.createTopics({ waitForLeaders: true, topics: [{ topic, numPartitions: 3, replicationFactor: 1 }] });
    } finally {
      await admin.disconnect().catch(() => undefined);
    }
  }

  async publish<T>(topic: string, type: string, data: T, key?: string): Promise<DomainEvent<T>> {
    const event = envelope(this.service, topic, type, data);
    const producer = await this.getProducer();
    await producer.send({ topic, messages: [{ key: key ?? event.id, value: JSON.stringify(event), headers: { type, ...(event.correlationId ? { correlationId: event.correlationId } : {}) } }] });
    return event;
  }

  async republish(event: DomainEvent, key?: string): Promise<void> {
    const producer = await this.getProducer();
    await producer.send({ topic: event.topic, messages: [{ key: key ?? event.id, value: JSON.stringify(event), headers: { type: event.type } }] });
  }

  async subscribe(topic: string, group: string, handler: EventHandler, opts: { replay?: boolean } = {}): Promise<void> {
    await this.ensureTopic(topic);
    // one group per (service, topic): consumers on different topics must not share a group, or every join rebalances them all
    const consumer = this.kafka.consumer({ groupId: `${group}.${topic}`, allowAutoTopicCreation: true });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: Boolean(opts.replay) });
    this.consumers.push(consumer);
    // resolve only once partitions are assigned: a new group starts at "latest", so events published
    // between subscribe() returning and the join finishing would otherwise be missed
    const joined = new Promise<void>((resolve) => {
      const off = consumer.on(consumer.events.GROUP_JOIN, () => { off(); resolve(); });
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        let event: DomainEvent;
        try { event = JSON.parse(message.value.toString()); } catch { return; }
        if (!(await deliver(handler, event, this.log))) {
          this.log.logError('event moved to dead-letter topic', `${topic}.dlq`, { eventId: event.id });
          await this.publish(`${topic}.dlq`, event.type, event).catch(() => undefined);
        }
      },
    });
    await Promise.race([joined, new Promise<void>((r) => setTimeout(r, 20_000))]);
  }

  async healthy(): Promise<boolean> {
    const admin = this.kafka.admin();
    try { await admin.connect(); await admin.listTopics(); return true; } catch { return false; } finally { await admin.disconnect().catch(() => undefined); }
  }

  async close(): Promise<void> {
    await Promise.all(this.consumers.map((c) => c.disconnect().catch(() => undefined)));
    await this.producer?.disconnect().catch(() => undefined);
  }
}

/* ───────────────────────── Redis Streams ───────────────────────── */

class RedisStreamEventBus implements EventBus {
  readonly kind = 'redis-streams' as const;
  private readers: Redis[] = [];
  private running = true;
  private readonly log;

  constructor(private readonly service: string, private readonly redis: Redis = getRedis()) {
    this.log = createLogger(service);
  }

  private stream(topic: string): string {
    return `evt:${topic}`;
  }

  async publish<T>(topic: string, type: string, data: T, key?: string): Promise<DomainEvent<T>> {
    const event = envelope(this.service, topic, type, data);
    await this.redis.xadd(this.stream(topic), 'MAXLEN', '~', 10000, '*', 'event', JSON.stringify(event), 'key', key ?? '');
    return event;
  }

  async republish(event: DomainEvent, key?: string): Promise<void> {
    await this.redis.xadd(this.stream(event.topic), 'MAXLEN', '~', 10000, '*', 'event', JSON.stringify(event), 'key', key ?? '');
  }

  async subscribe(topic: string, group: string, handler: EventHandler, opts: { replay?: boolean } = {}): Promise<void> {
    const stream = this.stream(topic);
    const consumer = `${this.service}-${process.pid}`;
    const ensureGroup = async () => {
      try {
        await this.redis.xgroup('CREATE', stream, group, opts.replay ? '0' : '$', 'MKSTREAM');
      } catch (e) {
        if (!String(e).includes('BUSYGROUP')) throw e;
      }
    };
    await ensureGroup();
    const reader = createRedis({ name: `${this.service}:${topic}`, blocking: true });
    this.readers.push(reader);

    const handle = async (id: string, fields: string[]) => {
      const raw = fields[fields.indexOf('event') + 1];
      let event: DomainEvent | undefined;
      try { event = JSON.parse(raw); } catch { /* poison message: ack and drop */ }
      if (event && !(await deliver(handler, event, this.log))) {
        this.log.logError('event moved to dead-letter stream', `${stream}.dlq`, { eventId: event.id });
        await this.redis.xadd(`${stream}.dlq`, 'MAXLEN', '~', 1000, '*', 'event', raw).catch(() => undefined);
      }
      await this.redis.xack(stream, group, id);
    };

    const loop = async () => {
      // 1) anything this consumer was handed before a crash, 2) entries stuck on dead consumers, 3) new entries
      let lastClaim = 0;
      let pendingDone = false;
      while (this.running) {
        try {
          if (!pendingDone) {
            const res = (await reader.xreadgroup('GROUP', group, consumer, 'COUNT', 50, 'STREAMS', stream, '0')) as [string, [string, string[]][]][] | null;
            const entries = res?.[0]?.[1] ?? [];
            if (!entries.length) pendingDone = true;
            for (const [id, fields] of entries) await handle(id, fields);
            continue;
          }
          if (Date.now() - lastClaim > 30_000) {
            lastClaim = Date.now();
            const claimed = (await reader.xautoclaim(stream, group, consumer, 60_000, '0', 'COUNT', 50)) as [string, [string, string[]][]];
            for (const [id, fields] of claimed?.[1] ?? []) if (fields) await handle(id, fields);
          }
          const res = (await reader.xreadgroup('GROUP', group, consumer, 'COUNT', 20, 'BLOCK', 2000, 'STREAMS', stream, '>')) as [string, [string, string[]][]][] | null;
          for (const [id, fields] of res?.[0]?.[1] ?? []) await handle(id, fields);
        } catch (e) {
          if (!this.running) return;
          this.log.logWarning('stream read failed, retrying', { topic, error: String(e) });
          // Redis lost the stream/group (restart without persistence, flush, failover): recreate and carry on
          if (String(e).includes('NOGROUP')) {
            await ensureGroup().catch(() => undefined);
            pendingDone = true;
          }
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    };
    void loop();
  }

  async healthy(): Promise<boolean> {
    try { return (await this.redis.ping()) === 'PONG'; } catch { return false; }
  }

  async close(): Promise<void> {
    this.running = false;
    await Promise.all(this.readers.map((r) => r.quit().catch(() => r.disconnect())));
  }
}

const buses = new Map<string, EventBus>();

/** One bus per service. Kafka when KAFKA_BROKERS is configured, Redis Streams otherwise. */
export function createEventBus(service: string): EventBus {
  let bus = buses.get(service);
  if (!bus) {
    const brokers = env('KAFKA_BROKERS').split(',').map((s) => s.trim()).filter(Boolean);
    bus = brokers.length ? new KafkaEventBus(service, brokers) : new RedisStreamEventBus(service);
    buses.set(service, bus);
  }
  return bus;
}

/** Fire-and-forget publish for request handlers: an event outage must not fail the user's request. */
export function emit(bus: EventBus, topic: string, type: string, data: unknown, key?: string): void {
  bus.publish(topic, type, data, key).catch((e) => createLogger('events').logWarning('publish failed', { topic, type, error: String(e) }));
}
