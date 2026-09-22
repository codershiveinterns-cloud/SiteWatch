# SiteWatch — Architecture (Milestone 1)

## 1. Tenancy model

`Organization` is the tenant boundary. Every organization-owned table added in later
milestones (`Site`, `Asset`, `TelemetryEvent`, `Alert`, `Incident`, `Assignment`,
`AuditLog`, …) carries an `organizationId` foreign key and is accessed through
`tenantDb(organizationId)` in `src/lib/tenant.ts`. The organization id always comes from the
authenticated session, never from request input, so a user cannot address another tenant's
rows by guessing ids.

```
Organization 1 ─── * Membership * ─── 1 User
       │                                 │
       └──────────── * Session * ────────┘
```

* `User` is a global identity (unique email, bcrypt password hash).
* `Membership` joins a user to an organization and holds the **role in that organization**.
  A user may belong to several tenants in the future without a schema change.
* `Session` is server-side. The browser holds an opaque 256-bit token; the database stores
  its SHA-256 hash. The session records which organization it is acting in
  (`organizationId`), which is what future org-switching updates.

## 2. Authentication

* Sign-up creates `Organization` + `User` + `Membership(ADMIN)` in one transaction, then a
  session.
* Sign-in verifies the bcrypt hash (a dummy compare runs for unknown emails to keep timing
  uniform), revokes any stale session cookie, and issues a new session.
* Cookie: `sw_session`, `httpOnly`, `SameSite=Lax`, `Secure` when `APP_URL` is HTTPS,
  expiry = `SESSION_TTL_DAYS`.
* Expired sessions are deleted lazily on first use; changing a password revokes every other
  session. Users can also revoke other devices from Settings → Security.

## 3. Authorization (RBAC)

Roles: `ADMIN`, `OPERATIONS_MANAGER`, `FIELD_TECHNICIAN`, `VIEWER`.

Roles map to a permission set in `src/lib/rbac/permissions.ts` (`<resource>:<action>`).
Code checks **permissions**, never roles, so later milestones extend capabilities in one
place.

Enforcement layers:

1. `src/proxy.ts` — optimistic routing on cookie presence only (keeps unauthenticated
   visitors out of the shell and signed-in users off auth pages).
2. `requireAuth()` in the `(app)` layout — validates the session against the database on
   every request; redirects to `/login?reason=expired&next=…` on failure.
3. `requirePermission()` in each page — renders the in-app 403 (`/forbidden`) when the role
   lacks the permission. Visiting a URL directly never grants access.
4. `assertPermission()` in every server action — throws `AuthorizationError`; mutations are
   additionally scoped to `ctx.organization.id`.
5. Navigation is derived from the same permission matrix, so the sidebar only shows what
   the role can open.

Role is read from `Membership` on every request (not cached in the session), so an admin's
role change takes effect on the member's next request.

## 4. Application shell

* Desktop (≥1024px): persistent 236px sidebar, collapsible to a 60px icon rail (preference in
  a cookie so the server renders the chosen width).
* Tablet (768–1023px): sidebar at full width; content reflows to fewer columns.
* Mobile (<768px): sidebar hidden; a Radix dialog drawer provides navigation with 44px
  targets. Dialogs become bottom sheets. Tables switch to stacked lists.
* Theme: light / dark / system, persisted in a cookie and applied before first paint.

## 5. Module registry

`src/lib/modules.ts` declares every product area once: route, nav section, required
permission, status (`available` | `planned`) and delivering milestone. Navigation, the
dashboard and the `/[module]` roadmap pages read from it. Graduating a module in a later
milestone means flipping its status and adding its real route.

## 6. Extending in later milestones

| Milestone | Schema additions | Notes |
| --- | --- | --- |
| 2 | `Site`, `Asset`, `AssetCategory`, `TelemetryEvent`, `IngestKey` | all with `organizationId`; ingestion keys are per-tenant |
| 3 | `AlertRule`, `Alert`, `Incident`, `Assignment`, `SlaPolicy`, `Notification`, `TechnicianProfile` | SLA timers anchored on `Incident.createdAt`; SLA policy per tenant with defaults |
| 4 | `AuditLog`, `Recommendation` | AI outputs stored as recommendations for Ops Manager approval |
| 5 | — | hardening, exports, production cutover |

Add `technicians:*`, `alerts:*` etc. permission checks at the route and action level exactly
as the Team and Settings modules do today.
