import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Plus, Upload } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { tenantDb } from "@/lib/tenant";
import { ASSET_STATUSES, ASSET_STATUS_META, isAssetStatus } from "@/lib/domain";
import { formatDate, now, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterSelect, SearchInput } from "@/components/ui/filter-bar";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { AssetStatusIndicator } from "@/components/registry/status";
import { FlashToast } from "@/components/ui/flash-toast";

export const metadata: Metadata = { title: "Assets" };

export default async function AssetsPage({ searchParams }: PageProps<"/assets">) {
  const ctx = await requirePermission("assets:view", "/assets");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = isAssetStatus(params.status) ? params.status : undefined;
  const siteId = typeof params.siteId === "string" && params.siteId ? params.siteId : undefined;
  const canManage = hasPermission(ctx.role, "assets:manage");
  const tenant = tenantDb(ctx.organization.id);

  const [assets, total, sites, byStatus] = await Promise.all([
    tenant.assets.list({
      ...(status ? { status } : {}),
      ...(siteId ? { siteId } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { tag: { contains: q.toUpperCase() } }, { type: { contains: q } }, { serialNumber: { contains: q } }] } : {}),
    }),
    tenant.assets.count(),
    tenant.sites.options(),
    tenant.assets.countByStatus(),
  ]);

  return (
    <>
      <FlashToast param="deleted" message="Asset deleted." />
      <PageHeader
        eyebrow="Operations"
        title="Assets"
        description={`${total} asset${total === 1 ? "" : "s"} across ${sites.length} site${sites.length === 1 ? "" : "s"}.`}
        actions={
          canManage ? (
            <>
              <Button asChild variant="secondary">
                <Link href="/assets/import">
                  <Upload className="size-3.5" aria-hidden /> Import CSV
                </Link>
              </Button>
              <Button asChild>
                <Link href="/assets/new">
                  <Plus className="size-4" aria-hidden /> New asset
                </Link>
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ASSET_STATUSES.map((s) => (
          <Link
            key={s}
            href={status === s ? "/assets" : `/assets?status=${s}`}
            className={`rounded-md border px-3 py-2 shadow-sm transition-colors hover:border-line-strong ${status === s ? "border-accent/50 bg-accent-soft/40" : "border-line bg-surface"}`}
          >
            <AssetStatusIndicator status={s} />
            <p className="mt-0.5 text-lg font-semibold tabular text-ink">{byStatus[s] ?? 0}</p>
          </Link>
        ))}
      </div>

      <FilterBar action="/assets" className="mb-4">
        <SearchInput defaultValue={q} placeholder="Search name, tag, type or serial" />
        <FilterSelect name="siteId" label="Site" defaultValue={siteId} options={sites.map((s) => ({ value: s.id, label: s.name }))} />
        <FilterSelect name="status" label="Status" defaultValue={status} options={ASSET_STATUSES.map((s) => ({ value: s, label: ASSET_STATUS_META[s].label }))} />
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        {q || status || siteId ? (
          <Button asChild variant="ghost">
            <Link href="/assets">Clear</Link>
          </Button>
        ) : null}
      </FilterBar>

      {assets.length === 0 ? (
        <EmptyState
          icon={<Boxes className="size-4" />}
          title={total === 0 ? "No assets yet" : "No assets match these filters"}
          description={total === 0 ? "Register assets against a site, or import them from a CSV file." : "Try a different search or clear the filters."}
          action={
            canManage && total === 0 ? (
              <Button asChild>
                <Link href="/assets/new">Register an asset</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Panel>
          <div className="hidden md:block">
            <Table>
              <THead>
                <TH>Asset</TH>
                <TH>Site</TH>
                <TH>Type</TH>
                <TH>Status</TH>
                <TH>Criticality</TH>
                <TH>Last telemetry</TH>
                <TH>Next service</TH>
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
                    <TD>
                      <Link href={`/sites/${a.site.id}`} className="text-ink-2 hover:text-ink">
                        {a.site.name}
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
                    <TD className={`tabular ${a.nextMaintenanceAt && a.nextMaintenanceAt < now() ? "text-atrisk-text font-medium" : "text-ink-2"}`}>
                      {a.nextMaintenanceAt ? formatDate(a.nextMaintenanceAt) : "—"}
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
          <ul className="divide-y divide-line md:hidden">
            {assets.map((a) => (
              <li key={a.id}>
                <Link href={`/assets/${a.id}`} className="flex items-center justify-between gap-3 px-4 py-3 active:bg-surface-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                    <span className="block truncate font-mono text-2xs text-ink-3">
                      {a.tag} · {a.site.name}
                    </span>
                    <span className="block text-xs text-ink-3">{a.type}</span>
                  </span>
                  <AssetStatusIndicator status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
