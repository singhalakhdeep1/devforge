# DevForge

A developer learning platform. Students take project-based courses with quizzes and earn verifiable certificates; instructors build and sell courses; everyone gets a live code editor with pair-programming rooms.

Next.js 15 + React 19 frontend, Express + Prisma + PostgreSQL backend, Socket.IO for realtime.

## Features

- **Accounts**: email/password sign-up (student or instructor), short-lived access tokens with rotating, revocable refresh cookies (reuse of an old token signs the session out everywhere), email verification, forgot/reset password, profile with avatar upload, password change, account deletion.
- **Catalog**: search, category / level filters, sorting, pagination, course detail with curriculum, ratings and reviews.
- **Learning**: enroll (free) or buy (Stripe Checkout), lesson player with Markdown and video, per-lesson progress, quizzes (70% to pass, answers are never sent to the browser before submitting, explanations afterwards), automatic certificate on completion with a public verification page (printable to PDF).
- **Community**: per-lesson questions and answers, one vote per user, accepted answers, instructor moderation.
- **Notifications**: in-app, pushed live over WebSocket (new answers, quiz results, certificates, enrollments, payments).
- **Dashboard**: real stats (enrolled, completed, hours learned, day streak, certificates) and recent activity.
- **Code editor**: Monaco editor, saved snippets, JavaScript runs in a sandboxed browser Web Worker with a 5 s timeout; other languages run on the server through a [Piston](https://github.com/engineer-man/piston) instance when `PISTON_URL` is set (otherwise the editor says so instead of faking output). **Live sessions**: share a link, edit together, presence and shared output.
- **Instructor studio**: create courses, modules, lessons (Markdown / video / quiz), reorder, publish gating (needs lessons and complete quizzes), student roster with progress, completion and revenue stats.

Not included: video hosting (lessons link to YouTube / Vimeo / a file URL), an admin console (the `ADMIN` role can manage any course), refunds.

## Run locally

Prerequisites: Node 20+, PostgreSQL.

```bash
# backend
cd backend
cp .env.example .env         # set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npx prisma migrate deploy
npm run prisma:seed          # demo courses + logins
npm run dev                  # http://localhost:5000

# frontend (second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

Demo logins (after seeding, password `Password123`): `instructor@devforge.dev`, `student@devforge.dev`. Without SMTP configured, verification and reset links are printed in the backend log.

### Docker

```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET and JWT_REFRESH_SECRET
docker compose up --build
```

Starts PostgreSQL, the API (applies migrations on start) and the frontend. Seed demo data with `docker compose exec backend npx prisma db seed`.

## Configuration

See `backend/.env.example`. Only the database URL and the two JWT secrets are required. Email, Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; webhook endpoint `/api/payments/webhook`) and code execution (`PISTON_URL`) are optional and degrade gracefully when unset. The frontend needs `NEXT_PUBLIC_API_URL` (includes `/api`).

## Layout

```
backend/
  prisma/            schema, migration, seed
  src/
    config/env.ts    validated environment (fails fast)
    lib/             tokens, mailer, learning logic, notifications
    middleware/      auth, validation, error handling
    routes/          auth, users, courses, learn, instructor, discussions,
                     editor, notifications, certificates, dashboard, payments
    socket.ts        authenticated Socket.IO (notifications, editor rooms)
frontend/
  app/               pages (catalog, learn, dashboard, editor, instructor, ...)
  components/        UI primitives, navbar, quiz, discussion panel, studio
  lib/               typed API client (automatic token refresh), socket, sandboxed JS runner
```

## Scripts

`npm run typecheck`, `npm run build` (root: both apps). Backend: `npm run dev`, `npm run prisma:migrate`, `npm run prisma:seed`. Frontend: `npm run dev`, `npm run typecheck`.

## Security notes

Passwords are bcrypt-hashed; refresh tokens are stored hashed and rotated; credential endpoints are rate limited; all input is validated with Zod; instructors can only change their own courses; quiz answers stay server-side; lesson Markdown is rendered without raw HTML; uploaded avatars are type- and size-checked; JavaScript from the editor runs in a Web Worker with no access to the page or tokens.

## License

MIT
