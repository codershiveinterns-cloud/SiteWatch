"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ICONS } from "./nav-icons";
import { Tooltip } from "@/components/ui/tooltip";
import type { NavGroup } from "./types";

export function SidebarNav({
  groups,
  collapsed,
  onNavigate,
}: {
  groups: NavGroup[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-4 px-2 py-3">
      {groups.map((group) => (
        <div key={group.section}>
          {!collapsed ? (
            <p className="eyebrow px-2.5 pb-1.5">{group.section}</p>
          ) : (
            <div className="mx-2.5 mb-2 h-px bg-sidebar-line" aria-hidden />
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = NAV_ICONS[item.key];
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const planned = item.status === "planned";
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
                    active
                      ? "bg-sidebar-active text-ink"
                      : planned
                        ? "text-ink-3 hover:bg-sunken hover:text-ink-2"
                        : "text-ink-2 hover:bg-sunken hover:text-ink",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {active ? <span aria-hidden className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" /> : null}
                  <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-current")} aria-hidden />
                  {!collapsed ? (
                    <>
                      <span className="truncate">{item.title}</span>
                      {planned ? (
                        <span
                          className="ml-auto rounded-sm border border-line px-1 font-mono text-2xs leading-4 text-ink-3"
                          aria-label={`Planned for milestone ${item.milestone}`}
                        >
                          M{item.milestone}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="sr-only">{item.title}</span>
                  )}
                </Link>
              );
              return (
                <li key={item.key}>
                  {collapsed ? (
                    <Tooltip content={planned ? `${item.title} · Milestone ${item.milestone}` : item.title}>{link}</Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
