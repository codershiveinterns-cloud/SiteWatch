import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shell/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export default async function SettingsLayout({ children }: LayoutProps<"/settings">) {
  await requirePermission("account:manage", "/settings");
  return (
    <>
      <PageHeader eyebrow="Administration" title="Settings" description="Your account, organization profile and security." />
      <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <SettingsNav />
        <div className="min-w-0 max-w-3xl">{children}</div>
      </div>
    </>
  );
}
