import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shell/page-header";
import { SiteForm } from "@/components/registry/site-form";

export const metadata: Metadata = { title: "New site" };

export default async function NewSitePage() {
  const ctx = await requirePermission("sites:manage", "/sites/new");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Operations · Sites" title="Register a site" description="A site groups the assets at one physical location." />
      <SiteForm siteId={null} initial={{ timezone: ctx.organization.timezone }} cancelHref="/sites" />
    </div>
  );
}
