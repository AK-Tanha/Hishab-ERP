# Hishab ERP

Monorepo: `apps/api` (NestJS), `apps/web` (Next.js), `packages/shared` (shared types/schemas).

Commands run from repo root:
- `pnpm install` — install deps
- `pnpm run dev` — run api + web in parallel
- `pnpm run lint` — lint all packages
- `pnpm run typecheck` — typecheck all packages
- `pnpm run test` — run all tests
- `pnpm run build` — build all packages
- `docker compose up -d` — start postgres, redis, mailhog

API env (apps/api/.env): DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.

Web env (apps/web/.env): NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL.

CI: lint → typecheck → test → build.
