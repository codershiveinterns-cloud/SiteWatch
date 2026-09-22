import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { ROLE_META } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { Panel, PanelBody, PanelHeader, DescriptionList } from "@/components/ui/panel";
import { RoleBadge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/settings/profile-form";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountSettingsPage() {
  const ctx = await requirePermission("account:manage", "/settings");
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader title="Profile" description="How you appear to teammates." />
        <PanelBody>
          <ProfileForm name={ctx.user.name} email={ctx.user.email} />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader title="Membership" description="Your role is managed by an Admin of the organization." />
        <PanelBody>
          <DescriptionList
            items={[
              { label: "Organization", value: ctx.organization.name },
              { label: "Role", value: <span className="inline-flex items-center gap-2"><RoleBadge role={ctx.role} /><span className="text-xs text-ink-3">{ROLE_META[ctx.role].description}</span></span> },
              { label: "Member since", value: formatDate(ctx.membership.createdAt) },
              { label: "User ID", value: ctx.user.id, mono: true },
            ]}
          />
        </PanelBody>
      </Panel>
    </div>
  );
}
