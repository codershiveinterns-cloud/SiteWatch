import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { tenantDb } from "@/lib/tenant";
import { deleteSiteAction } from "@/actions/registry";
import { ASSET_STATUS_META, SITE_CATEGORY_META, rollupStatus } from "@/lib/domain";
import { formatDate, formatDateTime, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader, DescriptionList } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AssetStatusIndicator, SiteCategoryBadge, StatusCounts } from "@/components/registry/status";
import { FlashToast } from "@/components/ui/flash-toast";

export async function generateMetadata({ params }: PageProps<"/sites/[siteId]">): Promise<Metadata> {
  const { siteId } = await params;
  const site = await tenantDb((await requirePermission("sites:view")).organization.id).sites.find(siteId);
  return { title: site ? site.name : "Site" };
}

export default async function SiteDetailPage({ params }: PageProps<"/sites/[siteId]">) {
  const { siteId } = await params;
  const ctx = await requirePermission("sites:view", `/sites/${siteId}`);
  const tenant = tenantDb(ctx.organization.id);
  const site = await tenant.sites.find(siteId);
  if (!site) notFound();

  const assets = await tenant.assets.list({ siteId: site.id });
  const statuses = assets.map((a) => a.status);
  const roll = rollupStatus(statuses);
  const canManageSites = hasPermission(ctx.role, "sites:manage");
  const canManageAssets = hasPermission(ctx.role, "assets:manage");
  const lastTelemetry = assets.reduce<Date | null>((m, a) => (a.lastTelemetryAt && (!m || a.lastTelemetryAt > m) ? a.lastTelemetryAt : m), null);

  return (
    <>
      <FlashToast param="saved" message="Site saved." />
      <FlashToast param="assetDeleted" message="Asset deleted." />
      <PageHeader
        eyebrow={
          <Link href="/sites" className="hover:text-ink">
            Operations · Sites
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {site.name}
            <StatusIndicator tone={ASSET_STATUS_META[roll].tone} label={ASSET_STATUS_META[roll].label} size="md" pulse={roll === "CRITICAL"} />
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink-3">{site.code}</span>
            <SiteCategoryBadge category={site.category} />
            {site.address ? <span>{site.address}</span> : null}
          </span>
        }
        actions={
          canManageSites ? (
            <>
              <Button asChild variant="secondary">
                <Link href={`/sites/${site.id}/edit`}>
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </Link>
              </Button>
              <ConfirmButton
                variant="ghost"
                title="Delete this site?"
                description={`${site.name} and its ${assets.length} asset${assets.length === 1 ? "" : "s"} (including telemetry history) will be permanently removed.`}
                confirmLabel="Delete site"
                action={deleteSiteAction.bind(null, site.id)}
              >
                <Trash2 className="size-3.5" aria-hidden /> Delete
              </ConfirmButton>
            </>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Location" />
          <PanelBody>
            <DescriptionList
              items={[
                { label: "Coordinates", value: `${site.latitude.toFixed(5)}, ${site.longitude.toFixed(5)}`, mono: true },
                { label: "Address", value: site.address ?? "—" },
                { label: "Timezone", value: site.timezone ?? ctx.organization.timezone },
                { label: "Registered", value: formatDate(site.createdAt) },
              ]}
            />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Asset health" description={`${assets.length} asset${assets.length === 1 ? "" : "s"} at this site`} />
          <PanelBody>
            <div className="flex h-2 overflow-hidden rounded-sm bg-sunken" role="img" aria-label="Asset status distribution">
              {(["HEALTHY", "AT_RISK", "CRITICAL", "OFFLINE", "UNKNOWN"] as const).map((s) => {
                const n = statuses.filter((x) => x === s).length;
                if (!n) return null;
                const cls = { HEALTHY: "bg-healthy", AT_RISK: "bg-atrisk", CRITICAL: "bg-critical", OFFLINE: "bg-critical", UNKNOWN: "bg-neutral" }[s];
                return <span key={s} className={cls} style={{ width: `${(n / statuses.length) * 100}%` }} />;
              })}
            </div>
            <div className="mt-3">
              <StatusCounts statuses={statuses} />
            </div>
            <p className="mt-3 text-xs text-ink-3">
              Last telemetry {lastTelemetry ? `${relativeTime(lastTelemetry)} · ${formatDateTime(lastTelemetry)}` : "never"}
            </p>
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Notes" />
          <PanelBody>
            <p className="text-sm leading-relaxed text-ink-2">{site.description ?? "No notes recorded for this site."}</p>
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title="Assets"
          description={`Category defaults: ${SITE_CATEGORY_META[site.category].assetTypes.slice(0, 4).join(", ")}…`}
          actions={
            canManageAssets ? (
              <Button asChild size="sm">
                <Link href={`/assets/new?siteId=${site.id}`}>
                  <Plus className="size-3.5" aria-hidden /> Add asset
                </Link>
              </Button>
            ) : undefined
          }
        />
        {assets.length === 0 ? (
          <PanelBody>
            <EmptyState compact icon={<Boxes className="size-4" />} title="No assets at this site" description="Add assets to start receiving telemetry against them." />
          </PanelBody>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <THead>
                  <TH>Asset</TH>
                  <TH>Type</TH>
                  <TH>Status</TH>
                  <TH>Criticality</TH>
                  <TH>Last telemetry</TH>
                  <TH>Next maintenance</TH>
                </THead>
                <tbody>
                  {assets.map((a) => (
                    <TR key={a.id}>
                      <TD>
                        <Link href={`/assets/${a.id}`} className="group">
                          <span className="block font-medium text-ink group-hover:underline underline-offset-4">{a.name}</span>
                          <span className="block font-mono text-2xs text-ink-3">{a.tag}</span>
                        </Link>
                      </TD>
                      <TD className="text-ink-2">{a.type}</TD>
                      <TD>
                        <AssetStatusIndicator status={a.status} />
                      </TD>
                      <TD>
                        <Badge tone={a.criticality === "HIGH" ? "critical" : a.criticality === "MEDIUM" ? "atrisk" : "neutral"}>{a.criticality}</Badge>
                      </TD>
                      <TD className="text-ink-2 tabular">{a.lastTelemetryAt ? relativeTime(a.lastTelemetryAt) : "never"}</TD>
                      <TD className="text-ink-2 tabular">{a.nextMaintenanceAt ? formatDate(a.nextMaintenanceAt) : "—"}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {assets.map((a) => (
                <li key={a.id}>
                  <Link href={`/assets/${a.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                      <span className="block font-mono text-2xs text-ink-3">
                        {a.tag} · {a.type}
                      </span>
                    </span>
                    <AssetStatusIndicator status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </>
  );
}
