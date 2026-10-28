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
CORS_ORIGIN=https://app.yourdomain.com
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
```

### Web (`apps/web/.env`)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

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
- Always run migrations before starting a new version.
- Keep `DB_SYNCHRONIZE=false` in production; use migrations.
- Rotate JWT secrets periodically.
- Back up PostgreSQL regularly.
EOF
echo done