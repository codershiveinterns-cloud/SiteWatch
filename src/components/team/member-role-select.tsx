"use client";

import * as React from "react";
import { changeMemberRoleAction } from "@/actions/team";
import { ROLE_META, ROLE_ORDER, type Role } from "@/lib/rbac/roles";
import { Select } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

export function MemberRoleSelect({ membershipId, role, disabled }: { membershipId: string; role: Role; disabled?: boolean }) {
  const [value, setValue] = React.useState<Role>(role);
  const [pending, startTransition] = React.useTransition();
  const { push } = useToast();

  // Re-sync when the server value changes (e.g. after revalidation).
  const [syncedRole, setSyncedRole] = React.useState(role);
  if (role !== syncedRole) {
    setSyncedRole(role);
    setValue(role);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Role"
        value={value}
        disabled={disabled || pending}
        title={disabled ? "You cannot change your own role" : undefined}
        className="h-8 w-48 text-xs sm:h-8"
        onChange={(e) => {
          const next = e.target.value as Role;
          const previous = value;
          setValue(next);
          startTransition(async () => {
            const result = await changeMemberRoleAction({ membershipId, role: next });
            if (result.status === "success") {
              push({ tone: "success", title: result.message ?? "Role updated" });
            } else {
              setValue(previous);
              push({ tone: "error", title: "Role not changed", description: result.message });
            }
          });
        }}
      >
        {ROLE_ORDER.map((r) => (
          <option key={r} value={r}>
            {ROLE_META[r].label}
          </option>
        ))}
      </Select>
      {pending ? <Spinner className="size-3.5 text-ink-3" /> : null}
    </div>
  );
}
