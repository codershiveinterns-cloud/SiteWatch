import type { Permission } from "@/lib/rbac";

/**
 * Product module registry.
 *
 * Every top-level area of SiteWatch is declared here once. Navigation, route
 * guards, the dashboard and the "upcoming module" pages all read from this
 * list, so enabling a module once it ships is a one-line change.
 */
export type ModuleStatus = "available" | "planned";

export type ModuleKey =
  | "dashboard"
  | "sites"
  | "assets"
  | "incidents"
  | "technicians"
  | "alerts"
  | "telemetry"
  | "analytics"
  | "reports"
  | "team"
  | "settings";

export type NavSection = "Overview" | "Operations" | "Monitoring" | "Insights" | "Administration";

export type ModuleDefinition = {
  key: ModuleKey;
  title: string;
  href: `/${string}`;
  section: NavSection;
  /** Permission required to see and open the module. */
  permission: Permission;
  status: ModuleStatus;
  summary: string;
  /** What the module includes; shown on its page until it is enabled. */
  capabilities: string[];
};

export const MODULES: ModuleDefinition[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    section: "Overview",
    permission: "dashboard:view",
    status: "available",
    summary: "Organization context, workspace status and quick access to every module.",
    capabilities: [],
  },
  {
    key: "sites",
    title: "Sites",
    href: "/sites",
    section: "Operations",
    permission: "sites:view",
    status: "planned",
    summary: "Registry of every remote site with category, GPS location and status.",
    capabilities: [
      "Create, edit and import sites with GPS coordinates",
      "Categorize as solar farm, telecom tower, EV station, warehouse or construction site",
      "Master data: specifications and maintenance schedule",
      "Per-tenant isolation with role-enforced write access",
    ],
  },
  {
    key: "assets",
    title: "Assets",
    href: "/assets",
    section: "Operations",
    permission: "assets:view",
    status: "planned",
    summary: "Asset registry with type, location, install date and live status.",
    capabilities: [
      "Register assets against sites with type and install date",
      "Specifications and maintenance schedule per asset",
      "Bulk CSV import with validation",
      "Status derived from ingested telemetry",
    ],
  },
  {
    key: "incidents",
    title: "Incidents",
    href: "/incidents",
    section: "Operations",
    permission: "incidents:view",
    status: "planned",
    summary: "Alert-to-incident pipeline with priority, assignment and SLA-timed resolution.",
    capabilities: [
      "Auto-created from alerts with priority and linked asset",
      "Stage-wise status: open, assigned, in progress, resolved, closed",
      "SLA timers anchored to incident creation, configurable per tenant",
      "Field update flow for technicians",
    ],
  },
  {
    key: "technicians",
    title: "Technicians",
    href: "/technicians",
    section: "Operations",
    permission: "technicians:view",
    status: "planned",
    summary: "Technician roster, skills, availability and dispatch.",
    capabilities: [
      "Skills, home location and availability per technician",
      "Assignment by location, skill match and current workload",
      "Dispatch history and workload view",
    ],
  },
  {
    key: "alerts",
    title: "Alerts",
    href: "/alerts",
    section: "Monitoring",
    permission: "alerts:view",
    status: "planned",
    summary: "Threshold and anomaly rules that raise alerts from incoming telemetry.",
    capabilities: [
      "Threshold rules per asset type and metric",
      "Anomaly detection beyond static thresholds",
      "Alert stream with acknowledgement and incident linkage",
      "In-app notifications for new alerts",
    ],
  },
  {
    key: "telemetry",
    title: "Telemetry",
    href: "/telemetry",
    section: "Monitoring",
    permission: "telemetry:view",
    status: "planned",
    summary: "Ingestion endpoints for sensor feeds and third-party monitoring data.",
    capabilities: [
      "Authenticated webhook and API ingestion per tenant",
      "Payload validation with rejected-event logging",
      "Recent events per asset for troubleshooting",
    ],
  },
  {
    key: "analytics",
    title: "Analytics",
    href: "/analytics",
    section: "Insights",
    permission: "analytics:view",
    status: "planned",
    summary: "Uptime, mean time to resolve, alert trends and technician performance.",
    capabilities: [
      "Uptime and MTTR per site and asset class",
      "Alert volume trends and SLA risk",
      "Technician performance reporting",
      "AI-assisted incident prioritization surfaced as recommendations",
    ],
  },
  {
    key: "reports",
    title: "Reports",
    href: "/reports",
    section: "Insights",
    permission: "reports:view",
    status: "planned",
    summary: "Exportable incident and asset reports in CSV and PDF.",
    capabilities: ["Incident and asset exports", "Scheduled report delivery", "Per-tenant branding on PDF output"],
  },
  {
    key: "team",
    title: "Team",
    href: "/team",
    section: "Administration",
    permission: "team:view",
    status: "available",
    summary: "Members of your organization and their roles.",
    capabilities: [],
  },
  {
    key: "settings",
    title: "Settings",
    href: "/settings",
    section: "Administration",
    permission: "account:manage",
    status: "available",
    summary: "Organization profile, your account and security.",
    capabilities: [],
  },
];

export const NAV_SECTIONS: NavSection[] = ["Overview", "Operations", "Monitoring", "Insights", "Administration"];

export const MODULE_BY_KEY: Record<ModuleKey, ModuleDefinition> = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleDefinition>;

export function moduleByHref(pathname: string): ModuleDefinition | undefined {
  return MODULES.find((m) => pathname === m.href || pathname.startsWith(`${m.href}/`));
}

