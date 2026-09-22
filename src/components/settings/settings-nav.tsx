"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Plug, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/settings", label: "Account", icon: UserRound },
  { href: "/settings/organization", label: "Organization", icon: Building2 },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
  { href: "/settings/integrations", label: "Integrations", icon: Plug, permission: "telemetry:manage" },
] as const;

export function SettingsNav({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings sections" className="-mx-1 overflow-x-auto lg:mx-0">
      <ul className="flex gap-1 px-1 lg:flex-col lg:px-0">
        {ITEMS.filter((i) => !("permission" in i) || permissions.includes(i.permission)).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                  active ? "bg-sidebar-active text-ink" : "text-ink-2 hover:bg-sunken hover:text-ink",
                )}
              >
                <Icon className={cn("size-4", active ? "text-accent" : "text-ink-3")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
