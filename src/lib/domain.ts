import { AssetStatus, Criticality, SiteCategory } from "@/generated/prisma/enums";
import type { StatusTone } from "@/components/ui/status-indicator";

export { AssetStatus, Criticality, SiteCategory };

export const SITE_CATEGORIES: SiteCategory[] = [
  SiteCategory.SOLAR_FARM,
  SiteCategory.TELECOM_TOWER,
  SiteCategory.EV_STATION,
  SiteCategory.WAREHOUSE,
  SiteCategory.CONSTRUCTION_SITE,
];

export const SITE_CATEGORY_META: Record<SiteCategory, { label: string; short: string; codePrefix: string; assetTypes: string[] }> = {
  SOLAR_FARM: {
    label: "Solar farm",
    short: "Solar",
    codePrefix: "SOL",
    assetTypes: ["Inverter", "PV string", "Combiner box", "Transformer", "Weather station", "Tracker"],
  },
  TELECOM_TOWER: {
    label: "Telecom tower",
    short: "Telecom",
    codePrefix: "TWR",
    assetTypes: ["Rectifier", "Battery bank", "Generator", "Cabinet environment", "Antenna", "Microwave link"],
  },
  EV_STATION: {
    label: "EV charging station",
    short: "EV",
    codePrefix: "EVS",
    assetTypes: ["DC charger", "AC charger", "Power cabinet", "Payment terminal", "Site controller"],
  },
  WAREHOUSE: {
    label: "Warehouse",
    short: "Warehouse",
    codePrefix: "WHS",
    assetTypes: ["HVAC unit", "Cold room", "UPS", "Backup inverter", "Dock door", "Fire panel"],
  },
  CONSTRUCTION_SITE: {
    label: "Construction site",
    short: "Construction",
    codePrefix: "CON",
    assetTypes: ["Generator", "Lighting tower", "Dewatering pump", "Site cabin", "Tower crane", "Fuel tank"],
  },
};

export const ASSET_STATUSES: AssetStatus[] = [
  AssetStatus.HEALTHY,
  AssetStatus.AT_RISK,
  AssetStatus.CRITICAL,
  AssetStatus.OFFLINE,
  AssetStatus.UNKNOWN,
];

export const ASSET_STATUS_META: Record<AssetStatus, { label: string; tone: StatusTone; rank: number }> = {
  HEALTHY: { label: "Healthy", tone: "healthy", rank: 0 },
  AT_RISK: { label: "At risk", tone: "atrisk", rank: 2 },
  CRITICAL: { label: "Critical", tone: "critical", rank: 3 },
  OFFLINE: { label: "Offline", tone: "critical", rank: 3 },
  UNKNOWN: { label: "Unknown", tone: "neutral", rank: 1 },
};

export const CRITICALITY_META: Record<Criticality, { label: string; weight: number }> = {
  LOW: { label: "Low", weight: 1 },
  MEDIUM: { label: "Medium", weight: 2 },
  HIGH: { label: "High", weight: 3 },
};

/** Worst status across a set of assets, used for site roll-ups. */
export function rollupStatus(statuses: AssetStatus[]): AssetStatus {
  if (statuses.length === 0) return AssetStatus.UNKNOWN;
  return statuses.reduce((worst, s) => (ASSET_STATUS_META[s].rank > ASSET_STATUS_META[worst].rank ? s : worst), statuses[0]);
}

export function isSiteCategory(v: unknown): v is SiteCategory {
  return typeof v === "string" && (SITE_CATEGORIES as string[]).includes(v);
}
export function isAssetStatus(v: unknown): v is AssetStatus {
  return typeof v === "string" && (ASSET_STATUSES as string[]).includes(v);
}

/** Common telemetry metrics with display units; ingestion accepts any metric name. */
export const KNOWN_METRICS: Record<string, { label: string; unit: string }> = {
  power_kw: { label: "Power output", unit: "kW" },
  voltage_v: { label: "Voltage", unit: "V" },
  current_a: { label: "Current", unit: "A" },
  temperature_c: { label: "Temperature", unit: "°C" },
  battery_soc_pct: { label: "Battery state of charge", unit: "%" },
  fuel_level_pct: { label: "Fuel level", unit: "%" },
  irradiance_wm2: { label: "Irradiance", unit: "W/m²" },
  vibration_mms: { label: "Vibration", unit: "mm/s" },
  humidity_pct: { label: "Humidity", unit: "%" },
  uptime_pct: { label: "Uptime", unit: "%" },
  charger_sessions: { label: "Charging sessions", unit: "" },
};

export function metricLabel(metric: string): string {
  return KNOWN_METRICS[metric]?.label ?? metric.replace(/_/g, " ");
}
export function metricUnit(metric: string, fallback?: string | null): string {
  return fallback ?? KNOWN_METRICS[metric]?.unit ?? "";
}
