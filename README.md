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
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Email/password, bcrypt hashing, server-side sessions in httpOnly cookies |
| Validation | Zod (shared between client forms and server actions) |
| UI primitives | Radix UI (dialog, dropdown, tooltip) + Lucide icons |

## Local development

Prerequisites: Node 20+, PostgreSQL 14+.

```bash
cp .env.example .env          # then set DATABASE_URL
npm install
npx prisma migrate deploy     # apply migrations
npx prisma db seed            # optional demo tenants (ALLOW_DEMO_SEED=true)
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
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `APP_URL` | yes | Public origin (`https://…` enables the `Secure` cookie flag) |
| `SESSION_TTL_DAYS` | no | Session lifetime, default 30 |
| `ALLOW_DEMO_SEED` | no | `"true"` permits `prisma db seed`; never set on production |

## Staging deployment

The app is a standard Next.js server deployment (Vercel, Railway, Render, Fly, a VPS with
Node, or Docker). Steps:

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set `APP_URL` to the public HTTPS origin.
3. Build: `npm ci && npm run build`.
4. Apply migrations: `npx prisma migrate deploy` (run once per release, before starting the app).
5. Optionally seed demo tenants for client review: `ALLOW_DEMO_SEED=true npx prisma db seed`.
6. Start: `npm start` (or the platform's Next.js runtime).
7. Verify `GET /api/health` returns `{"status":"ok","database":"reachable"}`.

On Vercel: import the repo, add the environment variables, and set the build command to
`npx prisma migrate deploy && next build`. The `postinstall` script generates the Prisma client.

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
