import { HardHat, RadioTower, Sun, Warehouse, Zap, type LucideIcon } from "lucide-react";
import { ASSET_STATUS_META, SITE_CATEGORY_META, type AssetStatus, type SiteCategory } from "@/lib/domain";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";

export function AssetStatusIndicator({ status, size = "sm" }: { status: AssetStatus; size?: "sm" | "md" }) {
  const meta = ASSET_STATUS_META[status];
  return <StatusIndicator tone={meta.tone} label={meta.label} size={size} pulse={status === "CRITICAL"} />;
}

const CATEGORY_ICONS: Record<SiteCategory, LucideIcon> = {
  SOLAR_FARM: Sun,
  TELECOM_TOWER: RadioTower,
  EV_STATION: Zap,
  WAREHOUSE: Warehouse,
  CONSTRUCTION_SITE: HardHat,
};

export function SiteCategoryIcon({ category, className = "size-4" }: { category: SiteCategory; className?: string }) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={className} aria-hidden />;
}

export function SiteCategoryBadge({ category }: { category: SiteCategory }) {
  return (
    <Badge tone="outline" className="gap-1.5 normal-case tracking-normal">
      <SiteCategoryIcon category={category} className="size-3" />
      {SITE_CATEGORY_META[category].label}
    </Badge>
  );
}

/** Compact healthy/at-risk/critical counts used in list rows. */
export function StatusCounts({ statuses }: { statuses: AssetStatus[] }) {
  const count = (s: AssetStatus[]) => statuses.filter((x) => s.includes(x)).length;
  const items: Array<[string, number, string]> = [
    ["healthy", count(["HEALTHY"]), "bg-healthy"],
    ["at risk", count(["AT_RISK"]), "bg-atrisk"],
    ["critical", count(["CRITICAL", "OFFLINE"]), "bg-critical"],
    ["unknown", count(["UNKNOWN"]), "bg-neutral"],
  ];
  return (
    <span className="inline-flex items-center gap-3 text-xs text-ink-2 tabular">
      {items
        .filter(([, n]) => n > 0)
        .map(([label, n, cls]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`size-1.5 rounded-full ${cls}`} />
            {n} <span className="sr-only">{label}</span>
          </span>
        ))}
      {statuses.length === 0 ? <span className="text-ink-3">No assets</span> : null}
    </span>
  );
}
