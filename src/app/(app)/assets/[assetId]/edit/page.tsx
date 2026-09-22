import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { PageHeader } from "@/components/shell/page-header";
import { AssetForm } from "@/components/registry/asset-form";

export const metadata: Metadata = { title: "Edit asset" };

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function EditAssetPage({ params }: PageProps<"/assets/[assetId]/edit">) {
  const { assetId } = await params;
  const ctx = await requirePermission("assets:manage", `/assets/${assetId}/edit`);
  const tenant = tenantDb(ctx.organization.id);
  const [asset, sites] = await Promise.all([tenant.assets.find(assetId), tenant.sites.options()]);
  if (!asset) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Operations · Assets" title={`Edit ${asset.name}`} description={asset.tag} />
      <AssetForm
        assetId={asset.id}
        sites={sites}
        cancelHref={`/assets/${asset.id}`}
        initial={{
          siteId: asset.siteId,
          name: asset.name,
          tag: asset.tag,
          type: asset.type,
          manufacturer: asset.manufacturer ?? "",
          model: asset.model ?? "",
          serialNumber: asset.serialNumber ?? "",
          installDate: iso(asset.installDate),
          status: asset.status,
          criticality: asset.criticality,
          specifications: asset.specifications ?? "",
          maintenanceIntervalDays: asset.maintenanceIntervalDays ? String(asset.maintenanceIntervalDays) : "",
          lastMaintenanceAt: iso(asset.lastMaintenanceAt),
        }}
      />
    </div>
  );
}
