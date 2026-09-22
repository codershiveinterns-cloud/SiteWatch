import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { PageHeader } from "@/components/shell/page-header";
import { AssetForm } from "@/components/registry/asset-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "New asset" };

export default async function NewAssetPage({ searchParams }: PageProps<"/assets/new">) {
  const ctx = await requirePermission("assets:manage", "/assets/new");
  const params = await searchParams;
  const sites = await tenantDb(ctx.organization.id).sites.options();
  const siteId = typeof params.siteId === "string" && sites.some((s) => s.id === params.siteId) ? params.siteId : sites[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Operations · Assets" title="Register an asset" description="Assets belong to a site and receive telemetry by their tag." />
      {sites.length === 0 ? (
        <EmptyState
          title="Register a site first"
          description="Every asset belongs to a site."
          action={
            <Button asChild>
              <Link href="/sites/new">Register a site</Link>
            </Button>
          }
        />
      ) : (
        <AssetForm assetId={null} sites={sites} initial={{ siteId, status: "UNKNOWN", criticality: "MEDIUM" }} cancelHref={siteId ? `/sites/${siteId}` : "/assets"} />
      )}
    </div>
  );
}
