import type { Role } from "@/lib/rbac/roles";
import type { ModuleDefinition, NavSection } from "@/lib/modules";

export type ShellUser = { id: string; name: string; email: string };
export type ShellOrganization = { id: string; name: string; slug: string };
export type NavGroup = { section: NavSection; items: ModuleDefinition[] };

export type ShellProps = {
  user: ShellUser;
  organization: ShellOrganization;
  role: Role;
  nav: NavGroup[];
  environment: string;
  version: string;
};
