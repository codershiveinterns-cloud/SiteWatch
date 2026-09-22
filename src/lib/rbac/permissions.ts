import { Role } from "./roles";

/**
 * Fine-grained permissions. Roles map to permission sets; the UI and the
 * server both check permissions (never roles directly) so that future
 * milestones can add capabilities without touching call sites.
 *
 * Naming: `<resource>:<action>`. Resources for later milestones are declared
 * now so navigation and route guards are wired from day one.
 */
export const PERMISSIONS = [
  "dashboard:view",
  "sites:view",
  "sites:manage",
  "assets:view",
  "assets:manage",
  "incidents:view",
  "incidents:manage",
  "incidents:update_assigned",
  "technicians:view",
  "technicians:manage",
  "alerts:view",
  "alerts:manage",
  "telemetry:view",
  "telemetry:manage",
  "analytics:view",
  "reports:view",
  "reports:export",
  "team:view",
  "team:manage",
  "organization:manage",
  "account:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  ADMIN: new Set(ALL),
  OPERATIONS_MANAGER: new Set<Permission>([
    "dashboard:view",
    "sites:view",
    "sites:manage",
    "assets:view",
    "assets:manage",
    "incidents:view",
    "incidents:manage",
    "technicians:view",
    "technicians:manage",
    "alerts:view",
    "alerts:manage",
    "telemetry:view",
    "analytics:view",
    "reports:view",
    "reports:export",
    "team:view",
    "account:manage",
  ]),
  FIELD_TECHNICIAN: new Set<Permission>([
    "dashboard:view",
    "sites:view",
    "assets:view",
    "incidents:view",
    "incidents:update_assigned",
    "alerts:view",
    "account:manage",
  ]),
  VIEWER: new Set<Permission>([
    "dashboard:view",
    "sites:view",
    "assets:view",
    "incidents:view",
    "analytics:view",
    "reports:view",
    "account:manage",
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function hasAnyPermission(role: Role, permissions: readonly Permission[]): boolean {
  return permissions.some((p) => ROLE_PERMISSIONS[role].has(p));
}

export function permissionsForRole(role: Role): Permission[] {
  return ALL.filter((p) => ROLE_PERMISSIONS[role].has(p));
}
