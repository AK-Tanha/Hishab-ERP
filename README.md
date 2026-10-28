# Hishab ERP (হিসাব)

Multi-tenant, cloud-based ERP for small and medium businesses in Bangladesh. Built as a modular monolith with NestJS + Next.js.

## Tech stack

- **Backend:** NestJS + TypeScript, PostgreSQL, TypeORM (migrations), Redis, JWT auth, Swagger/OpenAPI
- **Frontend:** Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod, next-intl, Recharts
- **Monorepo:** pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- **Infra:** Docker + docker-compose, GitHub Actions CI

## Quick start

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker + docker-compose

### 1. Start infrastructure
```bash
docker compose up -d
```
Starts PostgreSQL 16, Redis 7, and MailHog.

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment
Copy the example env files and adjust if needed:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 4. Run database migrations
```bash
pnpm --filter @hishab/api db:migrate
```

### 5. (Optional) Seed demo data
```bash
pnpm --filter @hishab/api db:seed
```
Creates a demo tenant (`demo` / `demo@hishab.local` / `password123`).

### 6. Start dev servers
```bash
pnpm run dev
```
- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger docs: http://localhost:3001/api/docs
- MailHog UI: http://localhost:8025

## Commands

| Command | Description |
|---|---|
| `pnpm run dev` | Run api + web in parallel |
| `pnpm run build` | Build all packages |
| `pnpm run lint` | Lint all packages |
| `pnpm run typecheck` | Typecheck all packages |
| `pnpm run test` | Run all tests |
| `pnpm --filter @hishab/api db:migrate` | Run DB migrations |
| `pnpm --filter @hishab/api db:seed` | Seed demo data |

## Project structure
```
hishab/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared types, Zod schemas, utils
├── docker-compose.yml
├── DEPLOYMENT.md
└── .github/workflows/ci.yml
```

## Modules (API)
- **auth** — login, register, refresh, JWT
- **tenants** — tenant provisioning, invites
- **users** — CRUD, roles, permissions
- **inventory** — products, categories, units, warehouses, stock ledger
- **accounting** — chart of accounts, journal entries, ledger, trial balance
- **sales** — customers, invoices, payments
- **purchases** — suppliers, bills, payments
- **reports** — dashboard, sales/stock/receivables/payables/P&L

## Bilingual (English + বাংলা)
All UI strings use translation keys in `apps/web/src/i18n/messages.ts` (en + bn). Backend returns error messages as translation keys.

## Multi-tenancy
Every business table has `tenant_id`. Enforced centrally via `TenantGuard` + `TenantInterceptor`. Pass `X-Tenant-ID` header on API requests.

## Money
Amounts stored as integer poisha (1 BDT = 100 poisha). Never floats.

## License
Proprietary. All rights reserved.