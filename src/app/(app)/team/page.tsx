import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { hasPermission, ROLE_META, ROLE_ORDER } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { Badge, RoleBadge } from "@/components/ui/badge";
import { MemberRoleSelect } from "@/components/team/member-role-select";
import { AddMemberDialog } from "@/components/team/add-member-dialog";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const ctx = await requirePermission("team:view", "/team");
  const canManage = hasPermission(ctx.role, "team:manage");
  const tenant = tenantDb(ctx.organization.id);
  const [members, byRole] = await Promise.all([tenant.memberships.list(), tenant.memberships.countByRole()]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Team"
        description={`Members of ${ctx.organization.name} and the role each holds in this organization.`}
        actions={canManage ? <AddMemberDialog /> : undefined}
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROLE_ORDER.map((role) => (
          <div key={role} className="rounded-md border border-line bg-surface px-3 py-2.5 shadow-sm">
            <p className="text-xs text-ink-3">{ROLE_META[role].label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-ink">{byRole[role] ?? 0}</p>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHeader
          title={`${members.length} member${members.length === 1 ? "" : "s"}`}
          description={
            canManage
              ? "Role changes apply on the member's next request. An organization always keeps at least one Admin."
              : "Only Admins can change roles."
          }
        />

        {/* Desktop / tablet table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-4 py-2 eyebrow font-semibold">Member</th>
                <th scope="col" className="px-4 py-2 eyebrow font-semibold">Role</th>
                <th scope="col" className="px-4 py-2 eyebrow font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const self = m.user.id === ctx.user.id;
                return (
                  <tr key={m.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.user.name} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-medium text-ink">
                            <span className="truncate">{m.user.name}</span>
                            {self ? <Badge tone="outline">You</Badge> : null}
                          </p>
                          <p className="truncate text-xs text-ink-3">{m.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {canManage ? (
                        <MemberRoleSelect membershipId={m.id} role={m.role} disabled={self} />
                      ) : (
                        <RoleBadge role={m.role} />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-2 tabular">{formatDate(m.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <ul className="divide-y divide-line md:hidden">
          {members.map((m) => {
            const self = m.user.id === ctx.user.id;
            return (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <Avatar name={m.user.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink">
                      <span className="truncate">{m.user.name}</span>
                      {self ? <Badge tone="outline">You</Badge> : null}
                    </p>
                    <p className="truncate text-xs text-ink-3">{m.user.email}</p>
                    <p className="mt-0.5 text-xs text-ink-3">Joined {formatDate(m.createdAt)}</p>
                    <div className="mt-2">
                      {canManage ? <MemberRoleSelect membershipId={m.id} role={m.role} disabled={self} /> : <RoleBadge role={m.role} />}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {members.length === 0 ? (
          <PanelBody>
            <p className="text-sm text-ink-3">No members yet.</p>
          </PanelBody>
        ) : null}
      </Panel>
    </>
  );
}
