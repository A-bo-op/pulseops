# PulseOps

PulseOps is a full-stack API monitoring platform. Users create projects and HTTP monitors; a backend scheduler checks those endpoints even when no dashboard is open, records results in PostgreSQL, and manages incidents automatically.

## MVP capabilities

- Account registration, login, JWT authentication, and current-user lookup
- Project and monitor CRUD with ownership checks on every protected resource
- GET/HEAD checks with configurable interval, timeout, and expected status
- Backend scheduler with database leases to avoid overlapping scheduled checks
- SSRF defense for localhost, private, loopback, link-local, reserved, and metadata destinations
- Paginated results, uptime percentage, latency chart, dashboard metrics, and incident history
- One incident after three consecutive failures; automatic resolution after recovery
- Structured/redacted logs, body limits, rate limits, consistent API errors, and graceful shutdown
- Unit and monitoring integration tests, plus optional PostgreSQL API integration tests

## Architecture

```text
Next.js dashboard → Express API → PostgreSQL
                         ↓
                  scheduler every 10s
                         ↓
                 claimed due monitors
                         ↓
             safe HTTP check + result + incident
```

The MVP intentionally does not use Redis, BullMQ, WebSockets, microservices, Kubernetes, billing, or AI. Those are deferred until measured scale or product requirements justify them.

## Repository layout

```text
apps/web          Next.js dashboard
apps/api          Express API, scheduler, Prisma schema, tests
packages/shared   API contracts shared across applications
```

## Requirements

- Node.js 20.9 or newer (Node 22 LTS recommended)
- pnpm 11
- Docker Desktop, or an existing PostgreSQL database

## Run locally

1. Create local environment files.

   macOS/Linux:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.local.example apps/web/.env.local
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/web/.env.local.example apps/web/.env.local
   ```

2. Replace `JWT_SECRET` in `apps/api/.env` with a random value of at least 32 characters.

3. Start PostgreSQL.

   ```bash
   docker compose up -d postgres
   ```

4. Install packages and apply the database migration.

   ```bash
   pnpm install
   pnpm db:migrate
   ```

5. Start both applications.

   ```bash
   pnpm dev
   ```

Open `http://localhost:3000`. The API listens on `http://localhost:5000` and exposes `GET /health` for platform health checks.

## Useful commands

```bash
pnpm dev          # API and web development servers
pnpm build        # production builds
pnpm typecheck    # strict TypeScript checks
pnpm test         # API unit and monitoring tests
pnpm db:migrate   # create/apply a development migration
pnpm db:studio    # inspect PostgreSQL through Prisma Studio
```

## Optional database-backed integration tests

The standard test run does not require PostgreSQL. To run the API authorization integration suite, create a separate test database, apply migrations, and provide its URL:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pulseops_test pnpm --filter @pulseops/api test
```

The suite verifies registration, protected endpoints, and that one user cannot read another user's project.

## API surface

All application routes are under `/api/v1`.

```text
POST   /auth/register
POST   /auth/login
GET    /auth/me

GET    /projects
POST   /projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId

GET    /projects/:projectId/monitors
POST   /projects/:projectId/monitors
GET    /monitors/:monitorId
PATCH  /monitors/:monitorId
DELETE /monitors/:monitorId
POST   /monitors/:monitorId/pause
POST   /monitors/:monitorId/resume
POST   /monitors/:monitorId/check
GET    /monitors/:monitorId/results?page=1&limit=20
GET    /monitors/:monitorId/summary

GET    /dashboard
GET    /incidents
GET    /projects/:projectId/incidents
GET    /incidents/:incidentId
```

Protected endpoints expect `Authorization: Bearer <token>`.

## Monitoring and incident flow

1. Every scheduler tick queries active monitors whose `nextCheckAt` is due.
2. An atomic database update leases each monitor to one process.
3. DNS is resolved and every address is checked before a request is made.
4. The request uses only validated addresses, follows at most three manually validated redirects, and enforces the configured timeout.
5. PulseOps stores the result and schedules the next check.
6. Three consecutive failures open a single incident. A successful check resolves it.

## Security notes

- Monitored response bodies and authorization headers are never persisted or logged.
- DNS validation is repeated for each check and redirect; the HTTP connection is pinned to the validated address to reduce DNS-rebinding risk.
- Resource lookups include the authenticated user's ownership condition. Unauthorized resources deliberately return `404` rather than revealing that they exist.
- Browser JWT storage is a conscious learning-MVP tradeoff. For a public production service, introduce short-lived access tokens plus rotating refresh sessions in `HttpOnly`, `Secure`, `SameSite` cookies.
- Use HTTPS in production and set `FRONTEND_URL` to the exact deployed frontend origin.

## Deployment

The included `render.yaml` provisions PostgreSQL and an always-on Node backend. Set `FRONTEND_URL` after deploying the frontend. For the web application, import the repository into Vercel, keep the repository root as the project root, use `pnpm --filter @pulseops/web build`, and set `NEXT_PUBLIC_API_URL` to the deployed API URL plus `/api/v1`.

Free hosts may suspend an inactive backend. Continuous monitoring requires a plan/process that stays running; a request-triggered serverless function is not sufficient for the scheduler.
