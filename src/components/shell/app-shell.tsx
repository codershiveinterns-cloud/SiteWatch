"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { moduleByHref } from "@/lib/modules";
import { Wordmark } from "@/components/ui/logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatusDot } from "@/components/ui/status-indicator";
import { AccountMenu } from "./account-menu";
import { OrgContext } from "./org-context";
import { SidebarNav } from "./sidebar-nav";
import type { ShellProps } from "./types";

export const SIDEBAR_COOKIE = "sw_sidebar";

export function AppShell({
  user,
  organization,
  role,
  nav,
  environment,
  version,
  initialCollapsed,
  children,
}: ShellProps & { initialCollapsed: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  // Persisted in a cookie so the server renders the chosen width (no flash).
  const [collapsed, setCollapsed] = React.useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  };

  const current = moduleByHref(pathname);

  const sidebarFooter = (
    <div className="mt-auto border-t border-sidebar-line px-3 py-2.5">
      <div className={cn("flex items-center gap-2 text-2xs text-ink-3", collapsed && "justify-center")}>
        <StatusDot tone="healthy" />
        {!collapsed ? (
          <span className="font-mono truncate">
            {environment} · v{version}
          </span>
        ) : null}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh">
        {/* Desktop / tablet sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-line bg-sidebar transition-[width] duration-200 ease-out md:flex",
            collapsed ? "w-[60px]" : "w-[236px]",
          )}
          aria-label="Sidebar"
        >
          <div className={cn("flex h-14 items-center border-b border-sidebar-line px-3", collapsed ? "justify-center" : "justify-between")}>
            <Link href="/dashboard" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <Wordmark compact={collapsed} />
            </Link>
            {!collapsed ? (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden size-8 items-center justify-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink lg:flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="px-2 pt-3">
            <OrgContext organization={organization} collapsed={collapsed} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav groups={nav} collapsed={collapsed} />
          </div>
          {collapsed ? (
            <div className="hidden justify-center py-2 lg:flex">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            </div>
          ) : null}
          {sidebarFooter}
        </aside>

        {/* Mobile drawer */}
        <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay animate-overlay-in md:hidden" />
            <DialogPrimitive.Content
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col border-r border-sidebar-line bg-sidebar shadow-lg animate-drawer-in focus:outline-none md:hidden"
              aria-describedby={undefined}
            >
              <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
              <div className="flex h-14 items-center justify-between border-b border-sidebar-line px-4">
                <Wordmark />
                <DialogPrimitive.Close className="-mr-2 flex size-10 items-center justify-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink" aria-label="Close navigation">
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <div className="px-3 pt-3">
                <OrgContext organization={organization} />
              </div>
              <div className="flex-1 overflow-y-auto [&_a]:h-11">
                <SidebarNav groups={nav} collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </div>
              {sidebarFooter}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface/75 sm:px-4 lg:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-1 flex size-10 items-center justify-center rounded-md text-ink-2 hover:bg-sunken hover:text-ink md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="hidden text-ink-3 sm:block">{current?.section ?? "SiteWatch"}</li>
                {current ? (
                  <>
                    <li aria-hidden className="hidden text-ink-3 sm:block">/</li>
                    <li className="truncate font-medium text-ink" aria-current="page">
                      {current.title}
                    </li>
                  </>
                ) : (
                  <li className="truncate font-medium text-ink md:hidden">SiteWatch</li>
                )}
              </ol>
            </nav>
            <AccountMenu user={user} organization={organization} role={role} />
          </header>
          <main id="main" className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
