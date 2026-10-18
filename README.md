# DevForge

A developer platform for learning and building together. Students take project-based courses with quizzes and earn verifiable certificates; instructors build and sell courses; teams run projects with Kanban boards and sprints, edit code and notes together in real time, share files and meet in video calls. Administrators get monitoring, an audit log, reports and backups.

DevForge is a set of TypeScript microservices behind an API gateway (npm workspaces), with a Next.js 15 / React 19 frontend. The design follows [`DEVFORGE_HLD_LLD.md`](DEVFORGE_HLD_LLD.md); what was built and how it differs is recorded at the end of that file.

> **Status:** the code is complete and typechecks; the frontend production build passes. A full end-to-end test of the running stack (and building the Docker images) is the next step and has not been done yet. See [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## Features

- **Accounts:** sign-up, email verification, password reset, rotating refresh tokens with reuse detection, sessions per device (sign out one or all), two-factor authentication (TOTP plus backup codes), Google / GitHub sign-in, roles (student, instructor, moderator, admin).
- **Learning:** catalogue with search and filters, Stripe checkout and Pro subscriptions, refunds within a window, lesson player, quizzes, progress, certificates with public verification, discussions, instructor studio.
- **Projects and teams:** public, private or team projects, members and roles, invitations by email, stars, forks, comments with replies, project files, activity, follow people, an activity feed.
- **Kanban:** boards per project, columns with WIP limits, drag and drop, task keys, priorities, labels, epics, sub-tasks, sprints with burndown charts, comments with @mentions, time tracking, attachments, watchers and board insights. Everyone on a board sees changes live.
- **Collaborative documents:** Yjs CRDT documents in Monaco with live cursors and presence, sharing by person or link, snapshots and restore, export. Also a code editor with snippets and code execution (Piston).
- **Video calls:** mediasoup SFU for camera, microphone and screen sharing, in-call chat and raised hands. Calls can be ad hoc with an invite link, or attached to a board, document or project (everyone with access may join).
- **Files:** uploads to S3 / MinIO or local disk, quotas, private or public links.
- **Search:** Elasticsearch across courses, instructors and projects, with highlighting, autocomplete and "did you mean".
- **Notifications:** in-app and pushed live, plus email for important events.
- **Administration:** users and roles; platform analytics; service monitoring with alerts; a tamper-evident audit log (hash chain, verify, CSV export); scheduled reports (PDF, XLSX, CSV, JSON); backups with retention and restore; email queue, event bus dead letters and the search index.
- **APIs:** REST through the gateway, plus GraphQL (queries, mutations, subscriptions over graphql-ws), tRPC and gRPC over the same services.

## Architecture

```
browser ──► frontend (Next.js) ──► api-gateway :4000 ──► services
                                    │  verifies the JWT, forwards the identity
                                    │  (x-user-* headers + internal key), rate limits,
                                    │  circuit breakers, proxies WebSockets
                                    ▼
 auth 4001 · notification 4002 · email 4003 · file 4004 · analytics 4005 · websocket 4006
 course 4007 · editor 4008 · kanban 4009 · payment 4010 · video 4011 · search 4012
 project 4013 · audit 4014 · reporting 4015 · backup 4016 · monitoring 4017
 elasticsearch-service 4018 · graphql 4020 · grpc 4021 (gRPC 50051) · trpc 4022 · kafka-service 4023

 PostgreSQL (one database per service) · MongoDB (analytics, notifications) · Redis (cache, rate limits,
 presence, realtime fan-out, locks) · Elasticsearch · S3/MinIO · event bus: Kafka, or Redis Streams
```

- Each service owns its data. Services call each other over HTTP with `createServiceClient` and communicate through domain events (`devforge.*` topics) on the event bus. The bus is Kafka when `KAFKA_BROKERS` is set and Redis Streams otherwise. Failed events go to per-topic dead-letter queues.
- The shared library (`backend/shared`) provides:
  - the service bootstrap: security headers, correlation ids, structured logs, Prometheus `/metrics`, `/health`, `/ready` and graceful shutdown;
  - authentication helpers, cache-aside caching and token-bucket rate limiting;
  - the event bus and realtime publishing.
- Realtime traffic is handled by three services:
  - `websocket-server` (Socket.IO with a Redis adapter, rooms per user and per board);
  - `editor-service` (Yjs over WebSocket);
  - `video-service` (signalling at `/video/socket.io`).

## Run with Docker

```bash
cp .env.example .env          # set JWT_ACCESS_SECRET and INTERNAL_API_KEY at least
docker compose up --build
```

| | |
|---|---|
| Web app | http://localhost:3000 |
| API gateway | http://localhost:4000 (gRPC on 50051) |
| Mail inbox (Mailpit) | http://localhost:8025 |
| MinIO console | http://localhost:9001 |
| Prometheus | http://localhost:9090 |

Each service applies its database migrations when it starts. To load demo data, run `docker compose exec auth npm run seed` and `docker compose exec course npm run seed`. The demo logins use the password `Password123`: `admin@devforge.dev`, `instructor@devforge.dev`, `student@devforge.dev`.

Kafka is optional. Start it with `docker compose --profile kafka up` and set `KAFKA_BROKERS=kafka:9092`. For calls with other machines, set `MEDIASOUP_ANNOUNCED_IP` to an address they can reach. Media uses UDP/TCP ports 40000 to 40100.

## Run for development

Prerequisites:
- Node 20+
- PostgreSQL 16, Redis and MongoDB
- optional: Elasticsearch 8, Kafka, MinIO

```bash
npm install                    # all backend workspaces
npm run build                  # shared library first, then every service (prisma generate + tsc)
# per service: set <SERVICE>_DATABASE_URL, JWT_ACCESS_SECRET, INTERNAL_API_KEY, REDIS_URL, then
npm run dev -w @devhub/auth-service      # and so on for each service you need
cd frontend && npm install && npm run dev # http://localhost:3000, talks to the gateway on :4000
```

Services find each other through `<NAME>_SERVICE_URL`, falling back to `http://localhost:<port>`. Without SMTP, emails go to a log outbox. Without Stripe, payments report themselves as disabled. Without `PISTON_URL`, only JavaScript runs, in a browser sandbox.

## Deploy to Kubernetes

`k8s/` is a kustomization containing:
- every service's Deployment and Service (`deployments/`, `services/`);
- data stores, configuration, autoscaling and the frontend (`base/`);
- an nginx ingress (`ingress.yaml`).

```bash
cp k8s/secrets.example.env k8s/secrets.env   # real secrets; never commit this file
kubectl apply -k k8s
```

Images are built from `docker/service.Dockerfile`, with build arguments `SERVICE`, `DEPS` and `DB_TOOLS`, and from `frontend/Dockerfile`. CI builds them on every push and pushes them to GHCR from `main`. `video-service` uses host networking for media and runs as a single replica per room.

## Repository layout

```
backend/
  shared/                 bootstrap, auth, event bus, cache, rate limits, logging, metrics, realtime
  api-gateway/            routing table, auth at the edge, proxies (HTTP + WebSocket)
  auth-service/ ...       one directory per service: src/, prisma/ (schema + migrations) where it has a database
  graphql-api/            Apollo Server; graphql-subscriptions/ holds the subscription schema + hub
  grpc-api/               devforge.proto + server; trpc-api/ router
websocket-server/         Socket.IO realtime hub
frontend/                 Next.js app (app/, components/, lib/api typed clients)
docker/                   service.Dockerfile, entrypoint, Postgres init
k8s/  monitoring/prometheus/  .github/workflows/ci.yml
```

## Scripts

From the repository root:
- `npm run build` builds everything;
- `npm run typecheck` typechecks every workspace;
- `npm run dev -w <workspace>` starts one service in watch mode.

In `frontend/`: `npm run dev`, `npm run build` and `npm run typecheck`.

## Security notes

- **Passwords and tokens:** passwords are bcrypt hashes. Refresh tokens are stored hashed, rotated, and revoked as a family when one is reused. Two-factor secrets are encrypted at rest.
- **Identity:** the gateway strips client-sent identity headers and adds them only from a token it verified. Internal endpoints also require the internal key and are never routed publicly.
- **Input and limits:** all input is validated with zod, and credential endpoints are rate limited.
- **Access control:**
  - project, board and document permissions are checked by the service that owns them;
  - video rooms admit only the owner, invited people, holders of the invite code, or people with access to the attached resource;
  - backups and restores are admin-only, and a restore must be confirmed with the backup id.
- **Audit log:** it is hash-chained, so editing or removing a row is detectable.

## License

MIT
