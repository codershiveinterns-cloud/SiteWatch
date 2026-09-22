import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { describeUserAgent, formatDateTime, relativeTime } from "@/lib/utils";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { RevokeSessionsButton } from "@/components/settings/revoke-sessions-button";

export const metadata: Metadata = { title: "Security settings" };

export default async function SecuritySettingsPage() {
  const ctx = await requirePermission("account:manage", "/settings/security");
  const sessions = await tenantDb(ctx.organization.id).sessions.listForUser(ctx.user.id);
  const others = sessions.filter((s) => s.id !== ctx.session.id).length;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader title="Password" description="Changing your password signs out every other device." />
        <PanelBody>
          <ChangePasswordForm />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader
          title="Active sessions"
          description="Sessions are stored server-side and expire automatically."
          actions={<RevokeSessionsButton count={others} />}
        />
        <ul className="divide-y divide-line">
          {sessions.map((s) => {
            const current = s.id === ctx.session.id;
            return (
              <li key={s.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {describeUserAgent(s.userAgent)}
                    {current ? <Badge tone="healthy">This device</Badge> : null}
                  </p>
                  <p className="text-xs text-ink-3">
                    Signed in {relativeTime(s.createdAt)}
                    {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                  </p>
                </div>
                <p className="text-xs text-ink-3 tabular">Expires {formatDateTime(s.expiresAt)}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
