import { cookies, headers } from "next/headers";
import { requireAuth } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { MODULES, NAV_SECTIONS } from "@/lib/modules";
import { AppShell, SIDEBAR_COOKIE } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/types";
import pkg from "../../../package.json";

/**
 * Authenticated application shell. Every route under (app) inherits this
 * server-side session check; individual pages add permission checks.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [h, cookieStore] = await Promise.all([headers(), cookies()]);
  const ctx = await requireAuth(h.get("x-sw-pathname") ?? undefined);
  const initialCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "1";

  const nav: NavGroup[] = NAV_SECTIONS.map((section) => ({
    section,
    items: MODULES.filter((m) => m.section === section && hasPermission(ctx.role, m.permission)),
  })).filter((g) => g.items.length > 0);

  return (
    <AppShell
      user={{ id: ctx.user.id, name: ctx.user.name, email: ctx.user.email }}
      organization={{ id: ctx.organization.id, name: ctx.organization.name, slug: ctx.organization.slug }}
      role={ctx.role}
      nav={nav}
      environment={process.env.NODE_ENV === "production" ? "live" : "development"}
      version={pkg.version}
      initialCollapsed={initialCollapsed}
    >
      {children}
    </AppShell>
  );
}
