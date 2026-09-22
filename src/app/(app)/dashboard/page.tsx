import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Boxes, MapPin, Wrench, X } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { tenantDb } from "@/lib/tenant";
import { hasPermission, ROLE_META } from "@/lib/rbac";
import { MODULES } from "@/lib/modules";
import { ASSET_STATUS_META, ASSET_STATUSES, SITE_CATEGORY_META, metricLabel, metricUnit, rollupStatus } from "@/lib/domain";
import { daysFromNow, formatDate, formatDateTime, now, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader, DescriptionList } from "@/components/ui/panel";
import { Badge, RoleBadge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AssetStatusIndicator, SiteCategoryIcon } from "@/components/registry/status";
import { WorkspaceChecklist } from "@/components/dashboard/workspace-checklist";
import pkg from "../../../../package.json";

export const metadata: Metadata = { title: "Dashboard" };

async function databaseStatus(): Promise<{ ok: boolean; latencyMs: number }> {
  const t = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - t };
  } catch {
    return { ok: false, latencyMs: Date.now() - t };
  }
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const ctx = await requirePermission("dashboard:view", "/dashboard");
  const params = await searchParams;
  const welcome = params.welcome === "1";
  const tenant = tenantDb(ctx.organization.id);
  const canSites = hasPermission(ctx.role, "sites:view");
  const canAssets = hasPermission(ctx.role, "assets:view");
  const canTelemetry = hasPermission(ctx.role, "telemetry:view");
  const dayAgo = daysFromNow(-1);
  const in14d = daysFromNow(14);
  const today = now();

  const [memberCount, sessions, dbStatus, sites, byStatus, assetTotal, attention, upcoming, recentTelemetry, telemetry24h] = await Promise.all([
    tenant.memberships.count(),
    tenant.sessions.listForUser(ctx.user.id),
    databaseStatus(),
    canSites ? tenant.sites.list() : Promise.resolve([]),
    canAssets ? tenant.assets.countByStatus() : Promise.resolve({} as Partial<Record<string, number>>),
    canAssets ? tenant.assets.count() : Promise.resolve(0),
    canAssets ? tenant.assets.list({ status: { in: ["CRITICAL", "OFFLINE", "AT_RISK"] } }, 6) : Promise.resolve([]),
    canAssets ? db.asset.findMany({ where: { organizationId: ctx.organization.id, nextMaintenanceAt: { lte: in14d } }, include: { site: { select: { name: true } } }, orderBy: { nextMaintenanceAt: "asc" }, take: 5 }) : Promise.resolve([]),
    canTelemetry ? tenant.telemetry.recent(6) : Promise.resolve([]),
    canTelemetry ? tenant.telemetry.countSince(dayAgo) : Promise.resolve(0),
  ]);

  const firstName = ctx.user.name.split(" ")[0];
  const plannedModules = MODULES.filter((m) => m.status === "planned" && hasPermission(ctx.role, m.permission));
  const overallStatus = rollupStatus(sites.flatMap((s) => s.assets.map((a) => a.status)));
  const critical = (byStatus.CRITICAL ?? 0) + (byStatus.OFFLINE ?? 0);
  const atRisk = byStatus.AT_RISK ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description={`${ctx.organization.name} · signed in as ${ROLE_META[ctx.role].label}`}
        actions={
          <StatusIndicator
            tone={!dbStatus.ok ? "critical" : critical > 0 ? "critical" : atRisk > 0 ? "atrisk" : "healthy"}
            label={!dbStatus.ok ? "Database unreachable" : critical > 0 ? `${critical} asset${critical === 1 ? "" : "s"} critical` : atRisk > 0 ? `${atRisk} asset${atRisk === 1 ? "" : "s"} at risk` : "All assets healthy"}
            pulse={critical > 0}
            size="md"
          />
        }
      />

      {welcome ? (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-accent/30 bg-accent-soft px-4 py-3 animate-fade-in" role="status">
          <div className="flex-1 text-sm text-ink">
            <p className="font-medium">Your workspace is ready.</p>
            <p className="mt-0.5 text-ink-2">
              Start by registering your first site under{" "}
              <Link href="/sites/new" className="font-medium text-accent-text underline-offset-4 hover:underline">
                Sites
              </Link>
              , then add assets and create an ingest key under{" "}
              <Link href="/settings/integrations" className="font-medium text-accent-text underline-offset-4 hover:underline">
                Settings → Integrations
              </Link>{" "}
              to start receiving telemetry.
            </p>
          </div>
          <Link href="/dashboard" className="-m-1 flex size-8 items-center justify-center rounded-sm text-ink-3 hover:bg-surface hover:text-ink" aria-label="Dismiss">
            <X className="size-4" />
          </Link>
        </div>
      ) : null}

      {canAssets ? (
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          <Link href="/sites" className="rounded-md border border-line bg-surface px-3 py-2.5 shadow-sm transition-colors hover:border-line-strong">
            <p className="text-xs text-ink-3">Sites</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-ink">{sites.length}</p>
          </Link>
          <Link href="/assets" className="rounded-md border border-line bg-surface px-3 py-2.5 shadow-sm transition-colors hover:border-line-strong">
            <p className="text-xs text-ink-3">Assets</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-ink">{assetTotal}</p>
          </Link>
          {ASSET_STATUSES.filter((s) => s !== "OFFLINE").map((s) => (
            <Link key={s} href={`/assets?status=${s}`} className="rounded-md border border-line bg-surface px-3 py-2.5 shadow-sm transition-colors hover:border-line-strong">
              <AssetStatusIndicator status={s} />
              <p className="mt-0.5 text-lg font-semibold tabular text-ink">{(byStatus[s] ?? 0) + (s === "CRITICAL" ? byStatus.OFFLINE ?? 0 : 0)}</p>
            </Link>
          ))}
          <Link href="/telemetry" className="rounded-md border border-line bg-surface px-3 py-2.5 shadow-sm transition-colors hover:border-line-strong">
            <p className="text-xs text-ink-3">Telemetry · 24 h</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-ink">{telemetry24h.toLocaleString()}</p>
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {canAssets ? (
          <Panel className="lg:col-span-2">
            <PanelHeader
              title="Needs attention"
              description="Assets reporting critical, offline or at-risk status"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link href="/assets?status=CRITICAL">
                    All assets <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              }
            />
            {attention.length === 0 ? (
              <PanelBody>
                <EmptyState compact icon={<Boxes className="size-4" />} title="Nothing needs attention" description="Every registered asset is reporting healthy or has no status yet." />
              </PanelBody>
            ) : (
              <ul className="divide-y divide-line">
                {attention.map((a) => (
                  <li key={a.id}>
                    <Link href={`/assets/${a.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2">
                      <AssetStatusIndicator status={a.status} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {a.name} <span className="font-mono text-2xs text-ink-3">{a.tag}</span>
                        </span>
                        <span className="block truncate text-xs text-ink-3">
                          {a.site.name} · {a.type}
                        </span>
                      </span>
                      <span className="hidden font-mono text-2xs text-ink-3 sm:block">{a.lastTelemetryAt ? relativeTime(a.lastTelemetryAt) : "no telemetry"}</span>
                      <Badge tone={a.criticality === "HIGH" ? "critical" : a.criticality === "MEDIUM" ? "atrisk" : "neutral"}>{a.criticality}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ) : (
          <Panel className="lg:col-span-2">
            <PanelHeader title="Organization" description="Tenant context for this session" />
            <PanelBody>
              <DescriptionList
                items={[
                  { label: "Name", value: ctx.organization.name },
                  { label: "Workspace", value: ctx.organization.slug, mono: true },
                  { label: "Timezone", value: ctx.organization.timezone },
                  { label: "Members", value: memberCount },
                  { label: "Created", value: formatDate(ctx.organization.createdAt) },
                ]}
              />
            </PanelBody>
          </Panel>
        )}

        <Panel>
          <PanelHeader title="Platform status" description="Live checks for this deployment" />
          <PanelBody className="space-y-3">
            <Row label="Application" value={<StatusIndicator tone="healthy" label="Running" />} />
            <Row label="Database" value={<StatusIndicator tone={dbStatus.ok ? "healthy" : "critical"} label={dbStatus.ok ? `Connected · ${dbStatus.latencyMs} ms` : "Unreachable"} />} />
            <Row label="Ingestion API" value={<StatusIndicator tone={telemetry24h > 0 ? "healthy" : "neutral"} label={telemetry24h > 0 ? "Receiving" : "Idle"} />} />
            <Row label="Tenant isolation" value={<StatusIndicator tone="healthy" label="Enforced" />} />
            <Row label="Build" value={<span className="font-mono text-xs text-ink-2">v{pkg.version} · {process.env.NODE_ENV === "production" ? "live" : "development"}</span>} />
          </PanelBody>
        </Panel>
      </div>

      {canSites ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader
              title="Sites"
              description={`${sites.length} registered · overall ${ASSET_STATUS_META[overallStatus].label.toLowerCase()}`}
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sites">
                    All sites <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              }
            />
            {sites.length === 0 ? (
              <PanelBody>
                <EmptyState
                  compact
                  icon={<MapPin className="size-4" />}
                  title="No sites registered"
                  description="Register your first site to start building the operational picture."
                  action={
                    hasPermission(ctx.role, "sites:manage") ? (
                      <Button asChild size="sm">
                        <Link href="/sites/new">Register a site</Link>
                      </Button>
                    ) : undefined
                  }
                />
              </PanelBody>
            ) : (
              <ul className="grid gap-px bg-line sm:grid-cols-2">
                {sites.slice(0, 8).map((s) => {
                  const roll = rollupStatus(s.assets.map((a) => a.status));
                  return (
                    <li key={s.id} className="bg-surface">
                      <Link href={`/sites/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-ink-3">
                          <SiteCategoryIcon category={s.category} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{s.name}</span>
                          <span className="block truncate text-xs text-ink-3">
                            {SITE_CATEGORY_META[s.category].label} · {s.assets.length} asset{s.assets.length === 1 ? "" : "s"}
                          </span>
                        </span>
                        <StatusIndicator tone={ASSET_STATUS_META[roll].tone} label={ASSET_STATUS_META[roll].label} pulse={roll === "CRITICAL"} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <div className="grid gap-4">
            <Panel>
              <PanelHeader title="Maintenance due" description="Next 14 days" />
              {upcoming.length === 0 ? (
                <PanelBody>
                  <p className="text-sm text-ink-3">No service due in the next two weeks.</p>
                </PanelBody>
              ) : (
                <ul className="divide-y divide-line">
                  {upcoming.map((a) => {
                    const overdue = a.nextMaintenanceAt! < today;
                    return (
                      <li key={a.id}>
                        <Link href={`/assets/${a.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2">
                          <Wrench className={`size-4 shrink-0 ${overdue ? "text-atrisk" : "text-ink-3"}`} aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-ink">{a.name}</span>
                            <span className="block truncate text-xs text-ink-3">{a.site.name}</span>
                          </span>
                          <span className={`font-mono text-2xs tabular ${overdue ? "text-atrisk-text" : "text-ink-3"}`}>{overdue ? "overdue" : formatDate(a.nextMaintenanceAt!)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
            {canTelemetry ? (
              <Panel>
                <PanelHeader title="Latest telemetry" actions={<Activity className="size-4 text-ink-3" aria-hidden />} />
                {recentTelemetry.length === 0 ? (
                  <PanelBody>
                    <p className="text-sm text-ink-3">No readings received yet.</p>
                  </PanelBody>
                ) : (
                  <ul className="divide-y divide-line">
                    {recentTelemetry.map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
                        <span className="min-w-0 truncate">
                          <span className="font-mono text-ink">{e.asset.tag}</span>
                          <span className="ml-2 text-ink-3">{metricLabel(e.metric)}</span>
                        </span>
                        <span className="font-mono tabular text-ink-2">
                          {e.value} {metricUnit(e.metric, e.unit)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Workspace status" description="Platform services active for this organization" actions={<Badge tone="healthy">Active</Badge>} />
          <PanelBody>
            <WorkspaceChecklist />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Your account" description={ROLE_META[ctx.role].label} />
          <PanelBody>
            <div className="mb-3">
              <RoleBadge role={ctx.role} />
            </div>
            <DescriptionList
              items={[
                { label: "Email", value: ctx.user.email },
                { label: "Sessions", value: sessions.length },
                { label: "Expires", value: formatDateTime(ctx.session.expiresAt) },
              ]}
            />
            <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
              <Link href="/settings/security">
                Manage security <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </PanelBody>
        </Panel>
      </div>

      {plannedModules.length > 0 ? (
        <section className="mt-6" aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading" className="mb-3 text-md font-semibold text-ink">
            More for your role
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {plannedModules.map((m) => (
              <li key={m.key}>
                <Link
                  href={m.href}
                  className="flex h-full flex-col rounded-md border border-line bg-surface px-3.5 py-3 shadow-sm transition-colors hover:border-line-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{m.title}</span>
                    <span className="font-mono text-2xs text-ink-3">Soon</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">{m.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-ink-3">{label}</span>
      <span className="text-right whitespace-nowrap">{value}</span>
    </div>
  );
}
