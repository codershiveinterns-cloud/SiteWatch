# SiteWatch

Multi-tenant remote asset monitoring platform for companies operating distributed sites
(solar farms, telecom towers, EV charging, warehouses, construction sites).

**Current status: Milestone 1 — foundation.** Authentication, role-based access control,
tenant isolation, the application shell and a staging-ready build are in place. Operational
modules (sites, assets, telemetry, alerts, incidents, dispatch, analytics, reports) arrive in
Milestones 2–5 and are represented in the UI as clearly labelled upcoming modules.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the technical design.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components + Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with a custom SiteWatch token set (light + dark) |
| Database | SQLite file via Prisma 7 (`@prisma/adapter-better-sqlite3`); swap to Postgres when needed |
| Auth | Email/password, bcrypt hashing, server-side sessions in httpOnly cookies |
| Validation | Zod (shared between client forms and server actions) |
| UI primitives | Radix UI (dialog, dropdown, tooltip) + Lucide icons |

## Local development

Prerequisites: Node 20+. No database server is needed; data lives in a local SQLite file.

```bash
cp .env.example .env
npm install
npm run db:setup              # creates prisma/sitewatch.db, applies migrations, seeds demo tenants
npm run dev
```

Open http://localhost:3000. Sign up to create a new organization (you become its Admin), or
use a demo account below.

### Demo accounts (seeded, development/staging only)

Password for all: `SiteWatch-Demo1`

| Organization | Email | Role |
| --- | --- | --- |
| Northwind Renewables (Demo) | admin@northwind.demo | Admin |
| Northwind Renewables (Demo) | ops@northwind.demo | Operations Manager |
| Northwind Renewables (Demo) | tech@northwind.demo | Field Technician |
| Northwind Renewables (Demo) | viewer@northwind.demo | Viewer |
| Meridian Telecom (Demo) | admin@meridian.demo | Admin (separate tenant, for isolation checks) |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs type generation) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Seed demo tenants |
| `npm run db:studio` | Prisma Studio |

## Environment variables

See [.env.example](./.env.example).

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | no | SQLite file URL, default `file:./prisma/sitewatch.db` |
| `APP_URL` | yes | Public origin (`https://…` enables the `Secure` cookie flag) |
| `SESSION_TTL_DAYS` | no | Session lifetime, default 30 |
| `ALLOW_DEMO_SEED` | no | `"true"` permits `prisma db seed`; never set on production |

## Deployment

### Vercel (no external database)

Import the GitHub repo into Vercel and deploy. Nothing else is required: `vercel.json`
runs `npm run vercel-build`, which creates the SQLite file, applies migrations, seeds the demo
organizations and builds. The database file ships inside the deployment.

**Important:** Vercel's filesystem is temporary. Accounts and changes made on the deployed site
persist only until the serverless instance is recycled (typically minutes to hours of
inactivity). The seeded demo accounts are always available. For durable storage, move to a
managed database:

1. Provision PostgreSQL and set `DATABASE_URL`.
2. In `prisma/schema.prisma` set `provider = "postgresql"`, install `@prisma/adapter-pg` and
   `pg`, and swap the adapter in `src/lib/db.ts` and `prisma/seed.ts`.
3. Run `npx prisma migrate dev --name init` to create Postgres migrations.

### Any Node host / VPS

```bash
npm ci && npm run db:setup && npm run build && npm start
```

Keep `prisma/sitewatch.db` on a persistent disk and back it up.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | public | Marketing landing page (shows "Open console" when signed in) |
| `/login`, `/signup` | public | Authentication (signed-in users are sent to the dashboard) |
| `/dashboard`, `/team`, `/settings/*`, module routes | authenticated | Application shell, permission-checked per page |
| `/api/health` | public | Health check |

## Project layout

```
prisma/               schema, migrations, demo seed
src/app/              routes (App Router)
  (marketing)/        public landing page
  (auth)/             login, signup — public
  (app)/              authenticated shell: dashboard, [module], team, settings, forbidden
  api/health          staging health check
src/actions/          server actions (auth, settings, team)
src/lib/auth/         password hashing, sessions, route guards
src/lib/rbac/         roles and permission matrix
src/lib/tenant.ts     tenant-scoped data access
src/lib/modules.ts    product module registry (drives navigation + roadmap pages)
src/components/ui/    design-system primitives
src/components/shell/ sidebar, top bar, account menu, mobile drawer
src/components/marketing/ landing page sections and product visualizations
src/proxy.ts          optimistic auth routing (cookie presence)
```
