# DevForge: implementation summary

This file replaces an earlier summary that described a single Express backend and called the project 100% complete. For the current state of each part, and what has and has not been tested, see [`PROJECT_STATUS.md`](PROJECT_STATUS.md). For the design, see [`DEVFORGE_HLD_LLD.md`](DEVFORGE_HLD_LLD.md).

## How the code is organised

```
devforge/
├── backend/
│   ├── shared/                 @devhub/shared: service bootstrap, auth, event bus, cache, rate limiting,
│   │                           structured logging, Prometheus metrics, realtime publishing, HTTP client
│   ├── api-gateway/            the only public API: JWT verification, identity forwarding, rate limits,
│   │                           circuit breakers, HTTP + WebSocket proxying (routes.ts is the route table)
│   ├── auth-service/           accounts, sessions, refresh-token rotation, 2FA, OAuth, admin user management
│   ├── course-service/         catalogue, enrolment, lessons, quizzes, certificates, discussions, studio
│   ├── payment-service/        Stripe checkout, subscriptions, refunds, invoices, webhook
│   ├── notification-service/   in-app notifications (MongoDB), preferences
│   ├── email-service/          BullMQ queue, templates, SMTP / SendGrid / log outbox
│   ├── file-service/           uploads to S3/MinIO or disk, quotas, public links
│   ├── analytics-service/      event ingest and reports (MongoDB)
│   ├── editor-service/         Yjs documents over WebSocket, snapshots, sharing, snippets, code execution
│   ├── project-service/        projects, teams, invitations, comments, stars, forks, social graph
│   ├── kanban-service/         boards, columns, tasks, sprints, labels, epics, time, comments
│   ├── search-service/         Elasticsearch queries; elasticsearch-service/ manages indices
│   ├── audit-service/          hash-chained audit log
│   ├── reporting-service/      on-demand and scheduled reports (PDF, XLSX, CSV, JSON)
│   ├── backup-service/         pg_dump / mongodump archives, retention, restore
│   ├── monitoring-service/     scrapes every service, alert rules, infrastructure checks
│   ├── kafka-service/          event bus operations: topics, groups, dead letters, replay
│   ├── video-service/          mediasoup SFU, call rooms, Socket.IO signalling
│   ├── graphql-api/            Apollo Server 5 over the services; graphql-subscriptions/ for live data
│   ├── grpc-api/               devforge.proto (Analytics, Editor, Kanban, Auth) over the services
│   └── trpc-api/               tRPC router over the services
├── websocket-server/           Socket.IO hub: per-user and per-resource rooms, presence
├── frontend/                   Next.js 15 app; lib/api/ holds typed clients for every service
├── docker/                     shared service Dockerfile, entrypoint (migrations), Postgres init
├── docker-compose.yml          the whole platform plus its infrastructure
├── k8s/                        kustomization: base/, deployments/, services/, ingress.yaml
├── monitoring/prometheus/      scrape configuration and alert rules
└── .github/workflows/ci.yml    build, migration drift check, frontend build, config validation, images
```

## Conventions

- **Data:** each service owns its database: PostgreSQL through Prisma with committed migrations, or MongoDB for analytics and notifications. No service reads another service's tables.
- **Identity:**
  - The gateway verifies the access token and forwards `x-user-id`, `x-user-role`, `x-user-email` and `x-user-name` together with `x-internal-key`.
  - Services trust those headers only when the internal key matches. Direct calls fall back to the bearer token.
- **Service-to-service calls:** they go through `createServiceClient(name)`. Internal endpoints live under `/internal` and are never routed by the gateway.
- **Events:** domain events go on the `devforge.*` topics, over Kafka when `KAFKA_BROKERS` is set and Redis Streams otherwise. Consumers use groups, and failed events go to `<topic>.dlq`.
- **Live updates:** `publishRealtime({ room, event, payload })` goes to the websocket server through Redis, which delivers to rooms such as `user:<id>` and `board:<id>`.
- **Service endpoints:** every service exposes `/health`, `/ready` (with dependency checks) and `/metrics`.
- **Language:** everything is TypeScript. Files containing JSX use `.tsx`.
