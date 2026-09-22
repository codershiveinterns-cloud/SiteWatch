import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { tenantDb } from "@/lib/tenant";
import { ASSET_STATUS_META, SITE_CATEGORIES, SITE_CATEGORY_META, isSiteCategory, rollupStatus } from "@/lib/domain";
import { PageHeader } from "@/components/shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterSelect, SearchInput } from "@/components/ui/filter-bar";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SiteCategoryBadge, SiteCategoryIcon, StatusCounts } from "@/components/registry/status";
import { FlashToast } from "@/components/ui/flash-toast";

export const metadata: Metadata = { title: "Sites" };

export default async function SitesPage({ searchParams }: PageProps<"/sites">) {
  const ctx = await requirePermission("sites:view", "/sites");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = isSiteCategory(params.category) ? params.category : undefined;
  const canManage = hasPermission(ctx.role, "sites:manage");

  const sites = await tenantDb(ctx.organization.id).sites.list({
    ...(category ? { category } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { code: { contains: q.toUpperCase() } }, { address: { contains: q } }] } : {}),
  });
  const total = await tenantDb(ctx.organization.id).sites.count();

  return (
    <>
      <FlashToast param="deleted" message="Site deleted." />
      <PageHeader
        eyebrow="Operations"
        title="Sites"
        description={`${total} site${total === 1 ? "" : "s"} registered for ${ctx.organization.name}.`}
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="size-4" aria-hidden /> New site
              </Link>
            </Button>
          ) : undefined
        }
      />

      <FilterBar action="/sites" className="mb-4">
        <SearchInput defaultValue={q} placeholder="Search name, code or address" />
        <FilterSelect name="category" label="Category" defaultValue={category} options={SITE_CATEGORIES.map((c) => ({ value: c, label: SITE_CATEGORY_META[c].label }))} />
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        {q || category ? (
          <Button asChild variant="ghost">
            <Link href="/sites">Clear</Link>
          </Button>
        ) : null}
      </FilterBar>

      {sites.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-4" />}
          title={total === 0 ? "No sites yet" : "No sites match these filters"}
          description={total === 0 ? "Register your first site to start attaching assets and telemetry." : "Try a different search or clear the filters."}
          action={
            canManage && total === 0 ? (
              <Button asChild>
                <Link href="/sites/new">Register a site</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Panel>
          <div className="hidden md:block">
            <Table>
              <THead>
                <TH>Site</TH>
                <TH>Category</TH>
                <TH>Status</TH>
                <TH>Assets</TH>
                <TH>Location</TH>
              </THead>
              <tbody>
                {sites.map((s) => {
                  const statuses = s.assets.map((a) => a.status);
                  const roll = rollupStatus(statuses);
                  return (
                    <TR key={s.id}>
                      <TD>
                        <Link href={`/sites/${s.id}`} className="group flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-md border border-line bg-surface-2 text-ink-3">
                            <SiteCategoryIcon category={s.category} />
                          </span>
                          <span>
                            <span className="block font-medium text-ink group-hover:underline underline-offset-4">{s.name}</span>
                            <span className="block font-mono text-2xs text-ink-3">{s.code}</span>
                          </span>
                        </Link>
                      </TD>
                      <TD className="text-ink-2">{SITE_CATEGORY_META[s.category].label}</TD>
                      <TD>
                        <StatusIndicator tone={ASSET_STATUS_META[roll].tone} label={ASSET_STATUS_META[roll].label} pulse={roll === "CRITICAL"} />
                      </TD>
                      <TD>
                        <span className="mr-2 font-medium text-ink tabular">{s.assets.length}</span>
                        <StatusCounts statuses={statuses} />
                      </TD>
                      <TD className="text-ink-2">
                        <span className="block truncate max-w-[16rem]">{s.address ?? "—"}</span>
                        <span className="font-mono text-2xs text-ink-3">
                          {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                        </span>
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <ul className="divide-y divide-line md:hidden">
            {sites.map((s) => {
              const statuses = s.assets.map((a) => a.status);
              const roll = rollupStatus(statuses);
              return (
                <li key={s.id}>
                  <Link href={`/sites/${s.id}`} className="flex items-start gap-3 px-4 py-3 active:bg-surface-2">
                    <span className="mt-0.5 flex size-9 items-center justify-center rounded-md border border-line bg-surface-2 text-ink-3">
                      <SiteCategoryIcon category={s.category} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-ink">{s.name}</span>
                        <StatusIndicator tone={ASSET_STATUS_META[roll].tone} label={ASSET_STATUS_META[roll].label} />
                      </span>
                      <span className="mt-0.5 block font-mono text-2xs text-ink-3">{s.code}</span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <SiteCategoryBadge category={s.category} />
                        <span className="text-xs text-ink-3">
                          {s.assets.length} asset{s.assets.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </>
  );
}
