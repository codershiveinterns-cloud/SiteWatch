import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { PageHeader } from "@/components/shell/page-header";
import { SiteForm } from "@/components/registry/site-form";

export const metadata: Metadata = { title: "Edit site" };

export default async function EditSitePage({ params }: PageProps<"/sites/[siteId]/edit">) {
  const { siteId } = await params;
  const ctx = await requirePermission("sites:manage", `/sites/${siteId}/edit`);
  const site = await tenantDb(ctx.organization.id).sites.find(siteId);
  if (!site) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Operations · Sites" title={`Edit ${site.name}`} />
      <SiteForm
        siteId={site.id}
        cancelHref={`/sites/${site.id}`}
        initial={{
          name: site.name,
          code: site.code,
          category: site.category,
          latitude: String(site.latitude),
          longitude: String(site.longitude),
          address: site.address ?? "",
          timezone: site.timezone ?? "",
          description: site.description ?? "",
        }}
      />
    </div>
  );
}
