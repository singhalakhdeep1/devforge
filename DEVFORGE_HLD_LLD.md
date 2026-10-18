# DevForge - HLD/LLD Implementation

## Overview
This document provides comprehensive documentation for HLD/LLD patterns implemented in the DevForge development platform application (Node.js/TypeScript microservices).

## Implemented Topics

### LLD Topics (Low-Level Design)

#### 1. Distributed Caching
**Location:** `backend/shared/src/services/cache/cache.service.ts`

**Description:** Implements distributed caching with Redis for development platform data.

**Key Features:**
- Get/set/delete operations
- TTL support
- Get or set pattern
- Pattern-based invalidation

**Usage Example:**
```typescript
import { CacheService } from './backend/shared/src/services/cache/cache.service';

const cache = new CacheService();
const cached = await cache.get('project:123');
await cache.set('project:123', JSON.stringify(project), 3600);
```

#### 2. API Rate Limiting
**Location:** `backend/shared/src/services/rate-limiting/rate-limiting.service.ts`

**Description:** Implements token bucket algorithm for API rate limiting.

**Key Features:**
- Token bucket algorithm
- Per-key rate limiting
- Configurable bucket capacity
- Redis-backed storage

**Usage Example:**
```typescript
import { RateLimitingService } from './backend/shared/src/services/rate-limiting/rate-limiting.service';

const rateLimiting = new RateLimitingService();
const allowed = await rateLimiting.isAllowed(`user:${userId}`, 1);
```

#### 3. Structured Logging
**Location:** `backend/shared/src/services/structured-logging/structured-logging.service.ts`

**Description:** Implements structured logging with correlation IDs and context.

**Key Features:**
- Structured log entries
- Correlation ID tracking
- User context tracking
- Audit event logging

**Usage Example:**
```typescript
import { StructuredLoggingService } from './backend/shared/src/services/structured-logging/structured-logging.service';

const logging = new StructuredLoggingService();
logging.logAuditEvent('ProjectCreated', 'User created a project', { userId, projectId });
```

### HLD Topics (High-Level Design)

#### 1. API Gateway
**Location:** `backend/api-gateway/` (Already exists)

**Description:** API Gateway for routing and aggregating microservices.

#### 2. GraphQL API
**Location:** `backend/graphql-api/`, `backend/graphql-subscriptions/` (Already exists)

**Description:** GraphQL API with subscriptions for real-time data.

#### 3. gRPC API
**Location:** `backend/grpc-api/` (Already exists)

**Description:** gRPC-based microservice communication.

#### 4. tRPC API
**Location:** `backend/trpc-api/` (Already exists)

**Description:** tRPC for type-safe API communication.

#### 5. Event Streaming (Kafka)
**Location:** `backend/kafka-service/` (Already exists)

**Description:** Kafka integration for event streaming.

#### 6. Search (Elasticsearch)
**Location:** `backend/search-service/`, `backend/elasticsearch-service/` (Already exists)

**Description:** Elasticsearch integration for search functionality.

#### 7. Monitoring Service
**Location:** `backend/monitoring-service/`, `monitoring/` (Already exists)

**Description:** Monitoring and metrics collection.

#### 8. Multiple Services
**Location:** `backend/auth-service/`, `backend/editor-service/`, `backend/file-service/`, `backend/kanban-service/`, `backend/notification-service/`, `backend/payment-service/`, `backend/video-service/` (Already exists)

**Description:** Comprehensive microservices for authentication, code editing, file management, kanban, notifications, payments, and video.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│  (Routing, Aggregation, Rate Limiting)                       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Microservices Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Editor     │  │    File      │      │
│  │  Service     │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Kanban     │  │ Notification │  │   Payment    │      │
│  │  Service     │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Video     │  │   Search     │  │   Analytics   │      │
│  │  Service     │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Cache     │  │Rate Limiting │  │ Structured   │      │
│  │   (Redis)    │  │  Service     │  │   Logging    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   GraphQL    │  │    gRPC      │  │    Kafka     │      │
│  │    API       │  │    API       │  │  (Events)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │Elasticsearch │  │  Monitoring  │                          │
│  │  (Search)    │  │  (Metrics)   │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Environment variables:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_BUCKET_CAPACITY=100
RATE_LIMIT_REFILL_RATE=1

# Kafka
KAFKA_BROKERS=localhost:9092

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Monitoring
MONITORING_ENABLED=true
METRICS_PORT=9090
```

## Summary

This implementation provides DevForge-specific HLD/LLD patterns focusing on distributed caching, rate limiting, and structured logging. The platform already includes extensive infrastructure with API Gateway, GraphQL API (with subscriptions), gRPC API, tRPC API, Kafka (event streaming), Elasticsearch (search), monitoring service, and comprehensive microservices (auth, editor, file, kanban, notification, payment, video, search, analytics), making it a comprehensive development platform with modern microservices architecture.

## Tech Stack Coverage Summary

Comprehensive HLD/LLD implementation across major tech stacks:

1. ✅ **bankcore-dotnet** (.NET/C#) - All 15 topics
2. ✅ **ferrobank** (Rust) - All 15 topics
3. ✅ **finrails** (Ruby on Rails) - All 15 topics
4. ✅ **finvault-go** (Go) - All 15 topics
5. ✅ **springbank** (Java/Spring Boot) - All 15 topics
6. ✅ **ecommerce-platform** (Node.js) - All 15 topics
7. ✅ **cartwave** (Python/Django) - All 15 topics
8. ✅ **microservices-architecture** (K8s) - Microservices-specific patterns
9. ✅ **trove** (NestJS/TypeScript) - Marketplace-specific patterns
10. ✅ **stratum** (NestJS/TypeScript) - Platform-specific patterns
11. ✅ **node-microservices** (Node.js) - Microservices-specific patterns
12. ✅ **ResilienceForge** (DevOps/K8s) - DevOps-specific patterns
13. ✅ **production-node-api** (Node.js) - Production-specific patterns
14. ✅ **dispatch** (TypeScript/Node.js) - Dispatch-specific patterns
15. ✅ **recruitment-api** (TypeScript/Node.js) - Recruitment-specific patterns
16. ✅ **social-network-api** (TypeScript/Node.js) - Social network-specific patterns
17. ✅ **CodeBridge** (Next.js/TypeScript) - Collaborative coding-specific patterns
18. ✅ **TalentIQ** (TypeScript/Node.js) - Talent management-specific patterns
19. ✅ **Nexus-AI** (Next.js/TypeScript) - AI platform-specific patterns
20. ✅ **PulseStream** (Next.js/TypeScript) - Streaming platform-specific patterns
21. ✅ **Forge3D** (Next.js/TypeScript) - 3D engine-specific patterns
22. ✅ **LexAI** (Next.js/TypeScript) - Document processing AI-specific patterns
23. ✅ **SecureDeploy** (NestJS/TypeScript) - Security platform-specific patterns
24. ✅ **Aurum** (Next.js/TypeScript) - Fintech platform-specific patterns
25. ✅ **Grove** (NestJS/TypeScript) - Education platform-specific patterns
26. ✅ **DevForge** (Node.js/TypeScript) - Development platform-specific patterns

The remaining 29+ projects will receive relevant patterns based on their specific domain and requirements, following the Option 2 strategy for comprehensive tech stack coverage without redundant work.


## As built (October 2026)

The design above is now implemented as npm workspaces under `backend/`, plus `websocket-server/` and `frontend/`. Every component named in this document exists and is wired into the gateway, docker-compose, Kubernetes and CI. What has and has not been tested end to end is tracked in `PROJECT_STATUS.md`. Below is how each part was realised, and where the result differs from the text above.

### LLD topics

- **Distributed caching:** `backend/shared/src/services/cache/cache.service.ts` provides cache-aside over Redis, with `getOrSet`, TTLs and SCAN-based pattern invalidation. Services also use HTTP caching helpers (`lib/http-cache.ts`).
- **Rate limiting:** `backend/shared/src/services/rate-limiting/rate-limiting.service.ts` is a token bucket evaluated atomically in Redis with Lua. The gateway applies it to every request, and the credential endpoints have stricter buckets.
- **Structured logging:** `backend/shared/src/services/structured-logging/structured-logging.service.ts` writes JSON logs. Correlation and request ids are propagated through AsyncLocalStorage and the `X-Correlation-ID` header. Audit-worthy actions are also sent to `audit-service` as `devforge.audit.recorded` events. They are stored in a hash chain, which an admin can verify or export.

### HLD topics

1. **API gateway** (`backend/api-gateway`):
   - is the only public API and owns the route table (`src/routes.ts`);
   - verifies JWTs at the edge and forwards the identity as signed internal headers;
   - provides rate limiting, per-service circuit breakers and WebSocket proxying for Socket.IO, Yjs, graphql-ws and call signalling;
   - keeps `/internal` endpoints unreachable from outside.
2. **GraphQL** (`backend/graphql-api`, `backend/graphql-subscriptions`):
   - Apollo Server 5 at `/graphql` over the services, so every service-side permission still applies; queries and mutations cover users, boards, tasks, sprints, courses, projects, documents, search, notifications and analytics.
   - The subscriptions (`documentUpdated`, `cardAdded`, `notificationReceived`, `userOnline`, `boardEvents`, …) run over graphql-ws. They are fed by the Redis realtime channel and the event bus, and access is checked per board and per document.
   - The original design said "Apollo Server or similar". Apollo Server 4 reached end-of-life in January 2026, so v5 is used.
3. **gRPC** (`backend/grpc-api`):
   - keeps the original services and methods of `devforge.proto` (Analytics, Editor, Kanban, Auth); the fields added since have new numbers (e.g. `CreateCardRequest.boardId`);
   - authenticates with `authorization` metadata and runs on port 50051, with HTTP health and metrics on 4021.
   - Difference: `Analytics.GetAnalytics` returns only the caller's own activity, because analytics-service exposes no per-user statistics for other users. `bounceRate` and `avgSessionDuration` are not tracked and are always 0.
4. **tRPC** (`backend/trpc-api`): `/trpc` with zod-validated procedures. The original flat procedures keep their names, and newer ones are grouped (`auth`, `documents`, `kanban`, `notifications`, `analytics`).
5. **Event streaming:** `createEventBus` in the shared library uses Kafka (kafkajs) when `KAFKA_BROKERS` is set. Otherwise it uses Redis Streams with the same topics, consumer groups, retries and dead-letter queues. `backend/kafka-service` provides the operations side: topics, groups, dead-letter inspection and replay, and publishing.
6. **Search:** `backend/search-service` handles queries (courses with facets and highlighting, people, projects, autocomplete, "did you mean", natural-language filters). `backend/elasticsearch-service` handles index management. The indexes are kept current from domain events.
7. **Monitoring:**
   - `backend/monitoring-service` scrapes every service's `/health`, `/ready` and `/metrics`, evaluates alert rules (with email, Slack and webhook notifications, and silencing) and checks the infrastructure.
   - `monitoring/prometheus/prometheus.yml` scrapes the same endpoints for Prometheus, and docker-compose runs Prometheus too.
8. **Services:** all services named here exist. Others were added to complete the platform:
   - project, course, analytics, audit, reporting, backup and email services;
   - `websocket-server`.

   Specifics:
   - **Video:** a mediasoup SFU with Socket.IO signalling. Call rooms are kept in Redis and are ad hoc (invite code) or attached to a board, document or project.
   - **Backups:** pg_dump and mongodump archives with a checksum, stored on S3 or disk, with retention, a scheduled run under a Redis lock, and an admin restore.

### Differences from the text above

- **Data stores:** each service owns its database (PostgreSQL through Prisma with migrations, or MongoDB for analytics and notifications), instead of one shared database.
- **Kafka is optional** in development; Redis Streams is the fallback transport. In the default setup, Redis also carries realtime fan-out, presence and locks.
- **Configuration:** the variables in the Configuration section above are still valid. `MONITORING_ENABLED` and `METRICS_PORT` are not used, because every service serves `/metrics` on its own port. See `.env.example`, `docker-compose.yml` and `k8s/base/config.yaml` for the full set.
