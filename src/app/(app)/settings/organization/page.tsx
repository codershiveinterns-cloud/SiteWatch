import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { tenantDb } from "@/lib/tenant";
import { formatDate } from "@/lib/utils";
import { Panel, PanelBody, PanelHeader, DescriptionList } from "@/components/ui/panel";
import { OrganizationForm } from "@/components/settings/organization-form";

export const metadata: Metadata = { title: "Organization settings" };

export default async function OrganizationSettingsPage() {
  const ctx = await requirePermission("account:manage", "/settings/organization");
  const canEdit = hasPermission(ctx.role, "organization:manage");
  const memberCount = await tenantDb(ctx.organization.id).memberships.count();

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Organization profile"
          description={canEdit ? "Shown across the console and on future reports." : "Only Admins can edit organization details."}
        />
        <PanelBody>
          <OrganizationForm name={ctx.organization.name} timezone={ctx.organization.timezone} readOnly={!canEdit} />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader title="Tenant" description="Identifiers for this isolated workspace." />
        <PanelBody>
          <DescriptionList
            items={[
              { label: "Workspace slug", value: ctx.organization.slug, mono: true },
              { label: "Organization ID", value: ctx.organization.id, mono: true },
              { label: "Members", value: memberCount },
              { label: "Created", value: formatDate(ctx.organization.createdAt) },
            ]}
          />
        </PanelBody>
      </Panel>
    </div>
  );
}
