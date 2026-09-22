import "server-only";
import { db } from "@/lib/db";

/**
 * Tenant scoping helpers.
 *
 * Every query against an organization-owned table goes through
 * `tenantDb(organizationId)` so the `organizationId` predicate is never
 * forgotten at a call site. Later milestones extend this object with the
 * Site, Asset, Incident, Alert and Telemetry accessors; the pattern stays the
 * same: the caller supplies the organization from the authenticated session
 * (never from user input) and the helper injects it into every filter.
 */
export function tenantDb(organizationId: string) {
  return {
    organizationId,

    organization: () => db.organization.findUniqueOrThrow({ where: { id: organizationId } }),

    memberships: {
      list: () =>
        db.membership.findMany({
          where: { organizationId },
          include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        }),
      count: () => db.membership.count({ where: { organizationId } }),
      countByRole: async () => {
        const rows = await db.membership.groupBy({
          by: ["role"],
          where: { organizationId },
          _count: { _all: true },
        });
        return Object.fromEntries(rows.map((r) => [r.role, r._count._all])) as Partial<Record<string, number>>;
      },
      /** Finds a membership only if it belongs to this tenant. */
      find: (membershipId: string) =>
        db.membership.findFirst({ where: { id: membershipId, organizationId }, include: { user: true } }),
    },

    sessions: {
      /** Active sessions for a user *inside this tenant*. */
      listForUser: (userId: string) =>
        db.session.findMany({
          where: { userId, organizationId, expiresAt: { gt: new Date() } },
          orderBy: { lastActiveAt: "desc" },
          select: { id: true, userAgent: true, ipAddress: true, createdAt: true, lastActiveAt: true, expiresAt: true },
        }),
    },
  };
}

export type TenantDb = ReturnType<typeof tenantDb>;
