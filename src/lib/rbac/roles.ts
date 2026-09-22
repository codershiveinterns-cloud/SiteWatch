import { Role } from "@/generated/prisma/enums";

export { Role };

export const ROLE_ORDER: Role[] = [
  Role.ADMIN,
  Role.OPERATIONS_MANAGER,
  Role.FIELD_TECHNICIAN,
  Role.VIEWER,
];

export const ROLE_META: Record<Role, { label: string; short: string; description: string }> = {
  ADMIN: {
    label: "Admin",
    short: "Admin",
    description: "Organization owner. Full configuration access, team and security administration.",
  },
  OPERATIONS_MANAGER: {
    label: "Operations Manager",
    short: "Ops Manager",
    description: "Monitors sites, manages incidents and technician assignment, reviews analytics.",
  },
  FIELD_TECHNICIAN: {
    label: "Field Technician",
    short: "Technician",
    description: "Receives assigned incidents and updates resolution status from the field.",
  },
  VIEWER: {
    label: "Viewer",
    short: "Viewer",
    description: "Read-only access to dashboards and reports for the sites they own.",
  },
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLE_ORDER as string[]).includes(value);
}
