# Hishab ERP — Deployment Guide

## Prerequisites
- Node.js >= 20
- pnpm >= 9
- PostgreSQL 16
- Redis 7 (optional, for background jobs)

## Environment variables

### API (`apps/api/.env`)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://user:pass@host:5432/hishab
REDIS_URL=redis://host:6379
JWT_ACCESS_SECRET=<strong-random>
JWT_REFRESH_SECRET=<strong-random>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Hishab ERP <noreply@yourdomain.com>
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
```

### Web (`apps/web/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
- Local dev: point `NEXT_PUBLIC_API_URL` at the API (default `http://localhost:3001`).
- Production (same-origin, e.g. Vercel): **leave it unset** — the app then calls relative `/api/v1/...` URLs, which are routed to the API by the `/api` rewrite.

## Build
```
pnpm install
pnpm run build
```

## Database
```
pnpm --filter @hishab/api db:migrate
# Optional demo data:
pnpm --filter @hishab/api db:seed
```

## Run
```
# API
cd apps/api && node dist/main.js
# Web
cd apps/web && pnpm start
```

## Docker (local dev)
```
docker compose up -d   # postgres, redis, mailhog
```

## CI
GitHub Actions runs lint → typecheck → test → build on every push/PR.

## Notes
- CORS is configured in `apps/api/src/main.ts`: the API reflects the request origin (`Access-Control-Allow-Origin`), so no `CORS_ORIGIN` env var is needed. Make sure the API is running — if it is down, browsers report a misleading CORS error.
- Always run migrations before starting a new version.
- Keep `DB_SYNCHRONIZE=false` in production; use migrations.
- Rotate JWT secrets periodically.
- Back up PostgreSQL regularly.

## Vercel (multi-service)

The repo deploys as a **single Vercel project with two services** using the
`services` key in the root `vercel.json`:

| Service | Root | Framework | Purpose |
| --- | --- | --- | --- |
| `api` | `apps/api` | `nestjs` | REST API (served under `/api`) |
| `web` | `apps/web` | `nextjs` | Next.js frontend (catch-all) |

Routing (`vercel.json`):

- `/api/(.*)` → `api` service (path preserved, e.g. `/api/v1/sales/customers`)
- `/health` → `api` service (public DB health probe)
- `/(.*)` → `web` service (Next.js handles locale routes like `/en/...`)

- The browser calls the API via **same-origin** relative paths (`/api/v1/...`);
  no `NEXT_PUBLIC_API_URL` is needed in Vercel production.
- The web and api services currently have no server-to-server calls, so no
  runtime bindings are required (all web → api calls happen from the browser).

### Vercel environment variables

- **API service**: `DATABASE_URL`, `REDIS_URL` (optional), `JWT_ACCESS_SECRET`,
  `JWT_REFRESH_SECRET`, `SMTP_*` — as provided for the target database/SMTP host.
- **Web service**: none required by default (`NEXT_PUBLIC_API_URL` stays unset;
  `NEXT_PUBLIC_APP_URL` can be set to the web domain).

### Deploying

```bash
vercel        # link an existing project / create new (services mode)
vercel deploy -prod
```

After a successful deploy, run migrations against the production database:

```bash
vercel run --prod api -- pnpm --filter @hishab/api db:migrate
```

Note: Vercel's default Node.js runtime is >= 20 (per repo `engines`); the API
listens on `process.env.PORT`, so it is runtime-ready.
