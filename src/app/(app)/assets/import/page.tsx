import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { ImportForm } from "@/components/registry/import-form";

export const metadata: Metadata = { title: "Import assets" };

export default async function ImportAssetsPage() {
  const ctx = await requirePermission("assets:manage", "/assets/import");
  const sites = await tenantDb(ctx.organization.id).sites.options();
  const example = `site_code,tag,name,type,manufacturer,model,serial_number,install_date,criticality
${sites[0]?.code ?? "NW-SOL-01"},INV-4,Inverter 4,Inverter,SMA,Sunny Central 1000,SC1000-4471,2024-03-18,HIGH
${sites[0]?.code ?? "NW-SOL-01"},STR-15,PV string 15,PV string,,,,2024-03-18,MEDIUM`;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Operations · Assets" title="Import assets from CSV" description="Bulk-register assets against existing sites. Duplicated tags and unknown site codes are skipped and reported." />
      <div className="space-y-4">
        <Panel>
          <PanelHeader title="Upload" />
          <PanelBody>
            <ImportForm />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Expected columns" description="Header names are case-insensitive. Required: site_code, tag, name, type." />
          <PanelBody>
            <pre className="overflow-x-auto rounded-md border border-line bg-sunken p-3 font-mono text-xs leading-relaxed text-ink">{example}</pre>
            <p className="mt-3 text-xs text-ink-3">
              Site codes in your organization: {sites.length ? sites.map((s) => s.code).join(", ") : "none registered yet"}. Install dates use YYYY-MM-DD and cannot be in the future. Criticality is LOW, MEDIUM or HIGH.
            </p>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
