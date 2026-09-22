import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Pencil, Trash2 } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { tenantDb } from "@/lib/tenant";
import { deleteAssetAction } from "@/actions/registry";
import { CRITICALITY_META, metricLabel, metricUnit } from "@/lib/domain";
import { formatDate, formatDateTime, now, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader, DescriptionList } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkline } from "@/components/ui/sparkline";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AssetStatusIndicator, SiteCategoryBadge } from "@/components/registry/status";
import { FlashToast } from "@/components/ui/flash-toast";

export async function generateMetadata({ params }: PageProps<"/assets/[assetId]">): Promise<Metadata> {
  const { assetId } = await params;
  const asset = await tenantDb((await requirePermission("assets:view")).organization.id).assets.find(assetId);
  return { title: asset ? `${asset.name} · ${asset.tag}` : "Asset" };
}

function parseSpecs(raw: string | null): Array<[string, string]> {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(obj).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)]);
  } catch {
    return [];
  }
}

export default async function AssetDetailPage({ params }: PageProps<"/assets/[assetId]">) {
  const { assetId } = await params;
  const ctx = await requirePermission("assets:view", `/assets/${assetId}`);
  const tenant = tenantDb(ctx.organization.id);
  const asset = await tenant.assets.find(assetId);
  if (!asset) notFound();

  const events = await tenant.telemetry.forAsset(asset.id, 400);
  const canManage = hasPermission(ctx.role, "assets:manage");
  const specs = parseSpecs(asset.specifications);
  const maintenanceOverdue = asset.nextMaintenanceAt ? asset.nextMaintenanceAt < now() : false;

  // Group the most recent readings per metric for compact trend cards.
  const byMetric = new Map<string, typeof events>();
  for (const e of events) {
    const list = byMetric.get(e.metric) ?? [];
    if (list.length < 84) list.push(e);
    byMetric.set(e.metric, list);
  }

  return (
    <>
      <FlashToast param="saved" message="Asset saved." />
      <PageHeader
        eyebrow={
          <Link href="/assets" className="hover:text-ink">
            Operations · Assets
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {asset.name}
            <AssetStatusIndicator status={asset.status} size="md" />
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink-3">{asset.tag}</span>
            <span>{asset.type}</span>
            <span className="text-ink-3">·</span>
            <Link href={`/sites/${asset.site.id}`} className="text-accent-text hover:underline underline-offset-4">
              {asset.site.name}
            </Link>
            <SiteCategoryBadge category={asset.site.category} />
          </span>
        }
        actions={
          canManage ? (
            <>
              <Button asChild variant="secondary">
                <Link href={`/assets/${asset.id}/edit`}>
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </Link>
              </Button>
              <ConfirmButton
                variant="ghost"
                title="Delete this asset?"
                description={`${asset.name} (${asset.tag}) and its telemetry history will be permanently removed.`}
                confirmLabel="Delete asset"
                action={deleteAssetAction.bind(null, asset.id)}
              >
                <Trash2 className="size-3.5" aria-hidden /> Delete
              </ConfirmButton>
            </>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Details" />
          <PanelBody>
            <DescriptionList
              items={[
                { label: "Criticality", value: <Badge tone={asset.criticality === "HIGH" ? "critical" : asset.criticality === "MEDIUM" ? "atrisk" : "neutral"}>{CRITICALITY_META[asset.criticality].label}</Badge> },
                { label: "Manufacturer", value: asset.manufacturer ?? "—" },
                { label: "Model", value: asset.model ?? "—" },
                { label: "Serial", value: asset.serialNumber ?? "—", mono: true },
                { label: "Installed", value: asset.installDate ? formatDate(asset.installDate) : "—" },
                { label: "Registered", value: formatDate(asset.createdAt) },
              ]}
            />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Maintenance" description="Schedule derived from the last service and interval" />
          <PanelBody>
            <DescriptionList
              items={[
                { label: "Interval", value: asset.maintenanceIntervalDays ? `${asset.maintenanceIntervalDays} days` : "Not scheduled" },
                { label: "Last serviced", value: asset.lastMaintenanceAt ? formatDate(asset.lastMaintenanceAt) : "—" },
                {
                  label: "Next due",
                  value: asset.nextMaintenanceAt ? (
                    <span className={maintenanceOverdue ? "font-medium text-atrisk-text" : ""}>
                      {formatDate(asset.nextMaintenanceAt)} · {relativeTime(asset.nextMaintenanceAt)}
                      {maintenanceOverdue ? " (overdue)" : ""}
                    </span>
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Specifications" />
          <PanelBody>
            {specs.length === 0 ? (
              <p className="text-sm text-ink-3">No specifications recorded.</p>
            ) : (
              <DescriptionList items={specs.map(([k, v]) => ({ label: k.replace(/_/g, " "), value: v, mono: true }))} />
            )}
          </PanelBody>
        </Panel>
      </div>

      <section className="mt-6" aria-labelledby="telemetry-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="telemetry-heading" className="text-md font-semibold text-ink">
              Telemetry
            </h2>
            <p className="text-xs text-ink-3">
              {asset.lastTelemetryAt ? `Last reading ${relativeTime(asset.lastTelemetryAt)} · ${formatDateTime(asset.lastTelemetryAt)}` : "No readings received yet"}
            </p>
          </div>
        </div>

        {byMetric.size === 0 ? (
          <EmptyState
            icon={<Activity className="size-4" />}
            title="No telemetry for this asset"
            description={`Send readings with asset_tag "${asset.tag}" to the ingestion endpoint. See Settings → Integrations.`}
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...byMetric.entries()].map(([metric, list]) => {
                const latest = list[0];
                const series = [...list].reverse().map((e) => e.value);
                const unit = metricUnit(metric, latest.unit);
                return (
                  <div key={metric} className="rounded-md border border-line bg-surface p-3 shadow-sm">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs font-medium text-ink-2">{metricLabel(metric)}</p>
                      <p className="font-mono text-2xs text-ink-3">{metric}</p>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-ink tabular">
                      {latest.value}
                      <span className="ml-1 text-sm font-normal text-ink-3">{unit}</span>
                    </p>
                    <Sparkline values={series} className="mt-2" />
                    <p className="mt-1 font-mono text-2xs text-ink-3">
                      {list.length} readings · latest {relativeTime(latest.recordedAt)}
                    </p>
                  </div>
                );
              })}
            </div>

            <Panel className="mt-4">
              <PanelHeader title="Recent readings" description="Most recent 50 events" />
              <Table>
                <THead>
                  <TH>Recorded</TH>
                  <TH>Metric</TH>
                  <TH className="text-right">Value</TH>
                  <TH>Source</TH>
                </THead>
                <tbody>
                  {events.slice(0, 50).map((e) => (
                    <TR key={e.id}>
                      <TD className="font-mono text-xs text-ink-2 whitespace-nowrap">{formatDateTime(e.recordedAt)}</TD>
                      <TD className="text-ink-2">{metricLabel(e.metric)}</TD>
                      <TD className="text-right font-mono text-ink tabular">
                        {e.value} {metricUnit(e.metric, e.unit)}
                      </TD>
                      <TD className="font-mono text-2xs text-ink-3">{e.source ?? "—"}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </Panel>
          </>
        )}
      </section>
    </>
  );
}
