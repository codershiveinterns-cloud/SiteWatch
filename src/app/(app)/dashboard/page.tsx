import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, MapPin, Siren, X } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { tenantDb } from "@/lib/tenant";
import { hasPermission, permissionsForRole, ROLE_META } from "@/lib/rbac";
import { MILESTONE_META, MODULES } from "@/lib/modules";
import { formatDate, formatDateTime, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader, DescriptionList } from "@/components/ui/panel";
import { Badge, RoleBadge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FoundationChecklist } from "@/components/dashboard/foundation-checklist";
import pkg from "../../../../package.json";

export const metadata: Metadata = { title: "Dashboard" };

const OPERATIONAL_PREVIEWS = [
  { key: "sites", icon: MapPin, empty: "No sites registered yet" },
  { key: "assets", icon: Boxes, empty: "No assets registered yet" },
  { key: "incidents", icon: Siren, empty: "No incidents" },
] as const;

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
  const [memberCount, sessions, dbStatus] = await Promise.all([
    tenant.memberships.count(),
    tenant.sessions.listForUser(ctx.user.id),
    databaseStatus(),
  ]);

  const firstName = ctx.user.name.split(" ")[0];
  const grants = permissionsForRole(ctx.role);
  const plannedModules = MODULES.filter((m) => m.status === "planned" && hasPermission(ctx.role, m.permission));
  const previews = OPERATIONAL_PREVIEWS.map((p) => ({ ...p, module: MODULES.find((m) => m.key === p.key)! })).filter((p) =>
    hasPermission(ctx.role, p.module.permission),
  );

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description={
          <>
            {ctx.organization.name} · signed in as {ROLE_META[ctx.role].label}
          </>
        }
        actions={
          <StatusIndicator tone={dbStatus.ok ? "healthy" : "critical"} label={dbStatus.ok ? "All systems operational" : "Database unreachable"} pulse={dbStatus.ok} size="md" />
        }
      />

      {welcome ? (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-accent/30 bg-accent-soft px-4 py-3 animate-fade-in" role="status">
          <div className="flex-1 text-sm text-ink">
            <p className="font-medium">Your workspace is ready.</p>
            <p className="mt-0.5 text-ink-2">
              You are the Admin of {ctx.organization.name}. Add teammates from the{" "}
              <Link href="/team" className="font-medium text-accent-text underline-offset-4 hover:underline">
                Team
              </Link>{" "}
              page and review organization details under{" "}
              <Link href="/settings/organization" className="font-medium text-accent-text underline-offset-4 hover:underline">
                Settings
              </Link>
              .
            </p>
          </div>
          <Link href="/dashboard" className="-m-1 flex size-8 items-center justify-center rounded-sm text-ink-3 hover:bg-surface hover:text-ink" aria-label="Dismiss">
            <X className="size-4" />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
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

        <Panel>
          <PanelHeader title="Your access" description={ROLE_META[ctx.role].description} />
          <PanelBody>
            <div className="mb-3 flex items-center gap-2">
              <RoleBadge role={ctx.role} />
              <span className="text-xs text-ink-3">
                {grants.length} permission{grants.length === 1 ? "" : "s"}
              </span>
            </div>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
              {groupPermissions(grants).map(([resource, actions]) => (
                <React.Fragment key={resource}>
                  <dt className="font-mono text-xs text-ink-3">{resource}</dt>
                  <dd className="flex flex-wrap gap-1">
                    {actions.map((a) => (
                      <Badge key={a} tone="outline" mono>
                        {a}
                      </Badge>
                    ))}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Platform status" description="Live checks for this deployment" />
          <PanelBody className="space-y-3">
            <Row label="Application" value={<StatusIndicator tone="healthy" label="Running" />} />
            <Row
              label="Database"
              value={
                <StatusIndicator
                  tone={dbStatus.ok ? "healthy" : "critical"}
                  label={dbStatus.ok ? `Connected · ${dbStatus.latencyMs} ms` : "Unreachable"}
                />
              }
            />
            <Row label="Authentication" value={<StatusIndicator tone="healthy" label="Server sessions" />} />
            <Row label="Tenant isolation" value={<StatusIndicator tone="healthy" label="Enforced" />} />
            <Row
              label="Build"
              value={
                <span className="font-mono text-xs text-ink-2">
                  v{pkg.version} · {process.env.NODE_ENV === "production" ? "staging" : "development"}
                </span>
              }
            />
          </PanelBody>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Milestone 1 · Foundation"
            description="What is in place today and what each upcoming milestone delivers"
            actions={<Badge tone="healthy">Delivered</Badge>}
          />
          <PanelBody>
            <FoundationChecklist />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Security" description="This account" />
          <PanelBody>
            <DescriptionList
              items={[
                { label: "Email", value: ctx.user.email },
                { label: "Active sessions", value: sessions.length },
                { label: "This session", value: relativeTime(ctx.session.createdAt) },
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

      {previews.length > 0 ? (
        <section className="mt-6" aria-labelledby="ops-heading">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 id="ops-heading" className="text-md font-semibold text-ink">
                Operations
              </h2>
              <p className="text-xs text-ink-3">Registries and workflows arrive in the next milestones. Nothing here is simulated.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {previews.map(({ key, icon: Icon, empty, module }) => (
              <Panel key={key}>
                <PanelHeader
                  title={module.title}
                  actions={
                    <Badge tone="outline" mono>
                      M{module.milestone}
                    </Badge>
                  }
                />
                <PanelBody className="py-3">
                  <EmptyState
                    compact
                    icon={<Icon className="size-4" aria-hidden />}
                    title={empty}
                    description={`${module.title} arrive with Milestone ${module.milestone}: ${MILESTONE_META[module.milestone!].title.toLowerCase()}.`}
                    action={
                      <Button asChild variant="ghost" size="sm">
                        <Link href={module.href}>
                          What is planned <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      </Button>
                    }
                  />
                </PanelBody>
              </Panel>
            ))}
          </div>
        </section>
      ) : null}

      {plannedModules.length > 0 ? (
        <section className="mt-6" aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading" className="mb-3 text-md font-semibold text-ink">
            Coming next for your role
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
                    <span className="font-mono text-2xs text-ink-3">M{m.milestone}</span>
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

function groupPermissions(perms: string[]): Array<[string, string[]]> {
  const map = new Map<string, string[]>();
  for (const p of perms) {
    const [resource, action] = p.split(":");
    map.set(resource, [...(map.get(resource) ?? []), action.replace("_", " ")]);
  }
  return [...map.entries()];
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-ink-3">{label}</span>
      <span className="text-right whitespace-nowrap">{value}</span>
    </div>
  );
}
