# DevForge: project status

_Last updated 2026-10-18._

An earlier version of this file said the project was "100% complete". At that time DevForge was a single Express app with 7 pages, and most of the services named in the design were empty or stubs. This file now records what is actually built and what has actually been checked.

## Summary

| Area | Built | Checked |
|---|---|---|
| Backend services (23 workspaces + shared library) | yes | each typechecks; most verified end to end earlier (see below) |
| Frontend (41 routes) | yes | typechecks; production build passes |
| Docker images / compose | yes | `docker compose config` valid; images **not built yet** |
| Kubernetes manifests | yes | `kubectl kustomize k8s` renders (68 resources); not applied to a cluster |
| CI workflow | yes | not run on GitHub yet |
| Full end-to-end test of the running stack | **no** | next step |

## Backend services

Verified end to end means the service was run against real infrastructure (PostgreSQL, Redis, MongoDB, Elasticsearch, Kafka where relevant) with scripted requests, during the rebuild in October 2026.

| Service | Port | State |
|---|---|---|
| shared library | — | verified |
| api-gateway | 4000 | verified; routes for video signalling, backups and graphql-ws added since (typecheck only) |
| auth-service (2FA, sessions, OAuth) | 4001 | verified |
| notification-service | 4002 | verified |
| email-service | 4003 | verified |
| file-service | 4004 | verified |
| analytics-service | 4005 | verified |
| websocket-server | 4006 | verified; presence publishing added since (typecheck only) |
| course-service | 4007 | verified |
| editor-service (Yjs) | 4008 | verified; document change events and an internal access endpoint added since |
| kanban-service | 4009 | verified |
| payment-service | 4010 | verified with a local Stripe fake; return URLs changed to the new settings page |
| video-service (mediasoup) | 4011 | rebuilt; typechecks; boots and starts a mediasoup worker on Windows; **calls not tested** |
| search-service + elasticsearch-service | 4012 / 4018 | verified with real Elasticsearch |
| project-service | 4013 | verified |
| audit-service | 4014 | verified |
| reporting-service | 4015 | written; typechecks; **never run** |
| backup-service | 4016 | rebuilt; typechecks; **not run** (needs pg_dump / mongodump) |
| monitoring-service | 4017 | verified |
| graphql-api + graphql-subscriptions | 4020 | rebuilt (Apollo Server 5, graphql-ws); typechecks; **not run** |
| grpc-api | 4021 / 50051 | rebuilt; typechecks; **not run** |
| trpc-api | 4022 | rebuilt; typechecks; **not run** |
| kafka-service | 4023 | verified on Redis Streams and Kafka |

## Frontend

Next.js 15 / React 19, talking only to the gateway. Existing learning pages: catalogue, course, lesson player, dashboard, instructor studio, certificates, notifications, profile, code editor and sign-in flows (now with the 2FA step). New pages, written and built but **not yet exercised in a browser against the running services**:
- projects and project detail (boards, discussion, files, activity, members, settings)
- teams and team detail, people profiles, activity feed and invitations
- boards and the Kanban board (drag and drop, live updates, task drawer, sprints and burndown, insights, settings)
- documents and the collaborative editor (Yjs ↔ Monaco binding, cursors, sharing, snapshots, export)
- files and search
- settings: two-factor setup, devices, password, subscription, purchases and refunds, invoices
- video calls (mediasoup-client)
- administration: overview, users, monitoring, audit log, backups, system (email, event bus, search engine)
- reports (admins and instructors)

## Known gaps and risks

- No test of the whole system running together yet. Expect integration bugs in the newer pieces, above all the frontend's new pages, video calls, backups, reports and the GraphQL / gRPC / tRPC layers.
- The Docker images have not been built yet. In particular, the `DB_TOOLS` variant of `docker/service.Dockerfile` installs PostgreSQL and MongoDB client tools from vendor repositories, and that install is untried.
- Video calls run all participants of a room on one instance (no SFU cascading). Behind NAT, `MEDIASOUP_ANNOUNCED_IP` must be set.
- Git history contains about 26 MB of Prisma engine binaries from an early commit. Removing them needs a history rewrite and a force-push.

## Next steps

1. Bring up the stack (`docker compose up --build`) and fix whatever fails to build or start.
2. Test end to end through the gateway and in a browser: sign-up through 2FA, courses and payments, a project with a board and a live document, a call between two browsers, files, search, notifications, the admin pages, a backup and a restore, reports, and GraphQL, tRPC and gRPC calls.
3. Run CI on GitHub and fix what it reports.
