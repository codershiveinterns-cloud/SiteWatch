import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShellOrganization } from "./types";

/** Tenant context block shown at the top of the sidebar. */
export function OrgContext({ organization, collapsed }: { organization: ShellOrganization; collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-md border border-line bg-surface-2 px-2.5 py-2",
        collapsed && "justify-center px-0",
      )}
      title={collapsed ? organization.name : undefined}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-text">
        <Building2 className="size-3.5" aria-hidden />
      </span>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink leading-4">{organization.name}</p>
          <p className="truncate font-mono text-2xs text-ink-3 leading-4">{organization.slug}</p>
        </div>
      ) : null}
    </div>
  );
}
