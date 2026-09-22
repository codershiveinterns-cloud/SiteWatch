import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { ASSET_STATUS_META } from "@/lib/domain";

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

    sites: {
      list: (where: Prisma.SiteWhereInput = {}) =>
        db.site.findMany({
          where: { organizationId, ...where },
          include: { assets: { select: { status: true } } },
          orderBy: { name: "asc" },
        }),
      find: (siteId: string) => db.site.findFirst({ where: { id: siteId, organizationId } }),
      count: () => db.site.count({ where: { organizationId } }),
      options: () => db.site.findMany({ where: { organizationId }, select: { id: true, name: true, code: true, category: true }, orderBy: { name: "asc" } }),
    },

    assets: {
      /** Assets ordered worst status first, then by name. */
      list: async (where: Prisma.AssetWhereInput = {}, take?: number) => {
        const rows = await db.asset.findMany({
          where: { organizationId, ...where },
          include: { site: { select: { id: true, name: true, code: true, category: true } } },
          orderBy: { name: "asc" },
        });
        rows.sort((a, b) => ASSET_STATUS_META[b.status].rank - ASSET_STATUS_META[a.status].rank || a.name.localeCompare(b.name));
        return take ? rows.slice(0, take) : rows;
      },
      find: (assetId: string) =>
        db.asset.findFirst({
          where: { id: assetId, organizationId },
          include: { site: { select: { id: true, name: true, code: true, category: true, latitude: true, longitude: true } } },
        }),
      findByTag: (tag: string) => db.asset.findFirst({ where: { organizationId, tag } }),
      count: (where: Prisma.AssetWhereInput = {}) => db.asset.count({ where: { organizationId, ...where } }),
      countByStatus: async () => {
        const rows = await db.asset.groupBy({ by: ["status"], where: { organizationId }, _count: { _all: true } });
        return Object.fromEntries(rows.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>;
      },
    },

    telemetry: {
      recent: (take = 50) =>
        db.telemetryEvent.findMany({
          where: { organizationId },
          include: { asset: { select: { id: true, tag: true, name: true, siteId: true } } },
          orderBy: { receivedAt: "desc" },
          take,
        }),
      forAsset: (assetId: string, take = 200) =>
        db.telemetryEvent.findMany({ where: { organizationId, assetId }, orderBy: { recordedAt: "desc" }, take }),
      count: () => db.telemetryEvent.count({ where: { organizationId } }),
      countSince: (since: Date) => db.telemetryEvent.count({ where: { organizationId, receivedAt: { gte: since } } }),
      rejected: (take = 50) => db.rejectedEvent.findMany({ where: { organizationId }, orderBy: { receivedAt: "desc" }, take }),
    },

    ingestKeys: {
      list: () => db.ingestKey.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
      find: (keyId: string) => db.ingestKey.findFirst({ where: { id: keyId, organizationId } }),
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
