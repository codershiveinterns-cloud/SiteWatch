import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  Siren,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ModuleKey } from "@/lib/modules";

export const NAV_ICONS: Record<ModuleKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  sites: MapPin,
  assets: Boxes,
  incidents: Siren,
  technicians: Wrench,
  alerts: Bell,
  telemetry: Activity,
  analytics: BarChart3,
  reports: FileText,
  team: Users,
  settings: Settings,
};
