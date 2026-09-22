/**
 * Demo registry data for the Northwind and Meridian tenants: sites, assets,
 * seven days of telemetry history and one ingest key per organization.
 * Called from prisma/seed.ts. Idempotent: existing rows are updated.
 */
import { createHash } from "node:crypto";
import type { PrismaClient } from "../src/generated/prisma/client";
import { AssetStatus, Criticality, SiteCategory } from "../src/generated/prisma/enums";

type SeedAsset = {
  tag: string;
  name: string;
  type: string;
  status?: AssetStatus;
  criticality?: Criticality;
  manufacturer?: string;
  model?: string;
  specs?: Record<string, string | number>;
  intervalDays?: number;
  lastMaintDaysAgo?: number;
  metrics: Array<{ metric: string; unit: string; base: number; jitter: number; trend?: number }>;
};

type SeedSite = {
  code: string;
  name: string;
  category: SiteCategory;
  lat: number;
  lng: number;
  address: string;
  assets: SeedAsset[];
};

const NORTHWIND_SITES: SeedSite[] = [
  {
    code: "NW-SOL-01",
    name: "Solar array A",
    category: SiteCategory.SOLAR_FARM,
    lat: 52.412,
    lng: -1.921,
    address: "Ashby Fields, Warwickshire",
    assets: [
      { tag: "INV-1", name: "Inverter 1", type: "Inverter", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "SMA", model: "Sunny Central 1000", specs: { rated_kw: 1000, strings: 24 }, intervalDays: 180, lastMaintDaysAgo: 40, metrics: [{ metric: "power_kw", unit: "kW", base: 640, jitter: 90 }, { metric: "temperature_c", unit: "°C", base: 41, jitter: 4 }] },
      { tag: "INV-3", name: "Inverter 3", type: "Inverter", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "SMA", model: "Sunny Central 1000", specs: { rated_kw: 1000, strings: 24 }, intervalDays: 180, lastMaintDaysAgo: 40, metrics: [{ metric: "power_kw", unit: "kW", base: 655, jitter: 80 }, { metric: "temperature_c", unit: "°C", base: 40, jitter: 4 }] },
      { tag: "STR-14", name: "PV string 14", type: "PV string", status: AssetStatus.AT_RISK, criticality: Criticality.MEDIUM, specs: { modules: 28, rated_kw: 12.6 }, metrics: [{ metric: "power_kw", unit: "kW", base: 9.8, jitter: 1.2, trend: -0.15 }, { metric: "current_a", unit: "A", base: 8.1, jitter: 0.6 }] },
      { tag: "MET-1", name: "Weather station", type: "Weather station", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, manufacturer: "Kipp & Zonen", metrics: [{ metric: "irradiance_wm2", unit: "W/m²", base: 780, jitter: 160 }, { metric: "temperature_c", unit: "°C", base: 18, jitter: 5 }] },
      { tag: "TRF-1", name: "Step-up transformer", type: "Transformer", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, specs: { rating_mva: 2.5 }, intervalDays: 365, lastMaintDaysAgo: 300, metrics: [{ metric: "temperature_c", unit: "°C", base: 52, jitter: 3 }] },
    ],
  },
  {
    code: "NW-SOL-02",
    name: "Solar array B",
    category: SiteCategory.SOLAR_FARM,
    lat: 52.204,
    lng: -1.711,
    address: "Long Marston, Warwickshire",
    assets: [
      { tag: "INV-B1", name: "Inverter B1", type: "Inverter", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Huawei", model: "SUN2000-215", specs: { rated_kw: 215 }, intervalDays: 180, lastMaintDaysAgo: 120, metrics: [{ metric: "power_kw", unit: "kW", base: 150, jitter: 30 }] },
      { tag: "INV-B2", name: "Inverter B2", type: "Inverter", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Huawei", model: "SUN2000-215", specs: { rated_kw: 215 }, intervalDays: 180, lastMaintDaysAgo: 120, metrics: [{ metric: "power_kw", unit: "kW", base: 148, jitter: 30 }] },
      { tag: "TRK-4", name: "Tracker row 4", type: "Tracker", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, metrics: [{ metric: "vibration_mms", unit: "mm/s", base: 1.1, jitter: 0.3 }] },
    ],
  },
  {
    code: "NW-TWR-04",
    name: "Tower N-4",
    category: SiteCategory.TELECOM_TOWER,
    lat: 53.101,
    lng: -2.402,
    address: "Peckforton ridge, Cheshire",
    assets: [
      { tag: "RECT-1", name: "Rectifier", type: "Rectifier", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Eltek", specs: { output_v: 54, modules: 4 }, intervalDays: 365, lastMaintDaysAgo: 200, metrics: [{ metric: "voltage_v", unit: "V", base: 54.2, jitter: 0.3 }] },
      { tag: "BAT-1", name: "Battery bank", type: "Battery bank", status: AssetStatus.AT_RISK, criticality: Criticality.HIGH, specs: { capacity_ah: 400, chemistry: "VRLA" }, intervalDays: 90, lastMaintDaysAgo: 95, metrics: [{ metric: "battery_soc_pct", unit: "%", base: 62, jitter: 6, trend: -0.4 }, { metric: "temperature_c", unit: "°C", base: 29, jitter: 2 }] },
      { tag: "GEN-1", name: "Standby generator", type: "Generator", status: AssetStatus.HEALTHY, criticality: Criticality.MEDIUM, manufacturer: "Cummins", specs: { rated_kva: 30 }, intervalDays: 180, lastMaintDaysAgo: 60, metrics: [{ metric: "fuel_level_pct", unit: "%", base: 78, jitter: 2 }] },
      { tag: "ENV-1", name: "Cabinet environment", type: "Cabinet environment", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, metrics: [{ metric: "temperature_c", unit: "°C", base: 27, jitter: 2 }, { metric: "humidity_pct", unit: "%", base: 48, jitter: 6 }] },
    ],
  },
  {
    code: "NW-TWR-09",
    name: "Tower N-9",
    category: SiteCategory.TELECOM_TOWER,
    lat: 52.76,
    lng: -1.98,
    address: "Cannock Chase, Staffordshire",
    assets: [
      { tag: "RECT-9", name: "Rectifier", type: "Rectifier", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Eltek", intervalDays: 365, lastMaintDaysAgo: 100, metrics: [{ metric: "voltage_v", unit: "V", base: 54.4, jitter: 0.3 }] },
      { tag: "BAT-9", name: "Battery bank", type: "Battery bank", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, intervalDays: 90, lastMaintDaysAgo: 20, metrics: [{ metric: "battery_soc_pct", unit: "%", base: 96, jitter: 2 }] },
      { tag: "ENV-9", name: "Cabinet environment", type: "Cabinet environment", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, metrics: [{ metric: "temperature_c", unit: "°C", base: 25, jitter: 2 }] },
    ],
  },
  {
    code: "NW-EVS-12",
    name: "EV hub 12",
    category: SiteCategory.EV_STATION,
    lat: 51.882,
    lng: -0.421,
    address: "Junction 11 services, Bedfordshire",
    assets: [
      { tag: "CH-05", name: "Charger 05", type: "DC charger", status: AssetStatus.HEALTHY, criticality: Criticality.MEDIUM, manufacturer: "ABB", model: "Terra 184", specs: { max_kw: 180, connectors: 2 }, intervalDays: 120, lastMaintDaysAgo: 30, metrics: [{ metric: "power_kw", unit: "kW", base: 48, jitter: 40 }, { metric: "temperature_c", unit: "°C", base: 38, jitter: 4 }] },
      { tag: "CH-06", name: "Charger 06", type: "DC charger", status: AssetStatus.HEALTHY, criticality: Criticality.MEDIUM, manufacturer: "ABB", model: "Terra 184", specs: { max_kw: 180, connectors: 2 }, intervalDays: 120, lastMaintDaysAgo: 30, metrics: [{ metric: "power_kw", unit: "kW", base: 35, jitter: 35 }, { metric: "temperature_c", unit: "°C", base: 36, jitter: 4 }] },
      { tag: "CH-07", name: "Charger 07", type: "DC charger", status: AssetStatus.AT_RISK, criticality: Criticality.MEDIUM, manufacturer: "ABB", model: "Terra 184", specs: { max_kw: 180, connectors: 2 }, intervalDays: 120, lastMaintDaysAgo: 118, metrics: [{ metric: "power_kw", unit: "kW", base: 52, jitter: 30 }, { metric: "temperature_c", unit: "°C", base: 58, jitter: 4, trend: 0.5 }] },
      { tag: "CH-08", name: "Charger 08", type: "DC charger", status: AssetStatus.HEALTHY, criticality: Criticality.MEDIUM, manufacturer: "ABB", model: "Terra 184", intervalDays: 120, lastMaintDaysAgo: 30, metrics: [{ metric: "power_kw", unit: "kW", base: 20, jitter: 20 }] },
      { tag: "PWR-12", name: "Power cabinet", type: "Power cabinet", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, specs: { supply_kva: 800 }, metrics: [{ metric: "current_a", unit: "A", base: 410, jitter: 120 }] },
    ],
  },
  {
    code: "NW-WHS-03",
    name: "Warehouse C",
    category: SiteCategory.WAREHOUSE,
    lat: 52.63,
    lng: -1.13,
    address: "Magna Park, Leicestershire",
    assets: [
      { tag: "INV-2", name: "Backup inverter", type: "Backup inverter", status: AssetStatus.CRITICAL, criticality: Criticality.HIGH, manufacturer: "Vertiv", specs: { rated_kva: 120 }, intervalDays: 180, lastMaintDaysAgo: 175, metrics: [{ metric: "power_kw", unit: "kW", base: 0, jitter: 0 }, { metric: "temperature_c", unit: "°C", base: 24, jitter: 1 }] },
      { tag: "HVAC-2", name: "HVAC zone 2", type: "HVAC unit", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Daikin", specs: { setpoint_c: 4 }, intervalDays: 90, lastMaintDaysAgo: 45, metrics: [{ metric: "temperature_c", unit: "°C", base: 4.1, jitter: 0.4 }] },
      { tag: "COLD-1", name: "Cold room 1", type: "Cold room", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, specs: { setpoint_c: -18 }, metrics: [{ metric: "temperature_c", unit: "°C", base: -18.2, jitter: 0.6 }] },
      { tag: "UPS-1", name: "UPS", type: "UPS", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Eaton", specs: { rated_kva: 60 }, intervalDays: 365, lastMaintDaysAgo: 30, metrics: [{ metric: "battery_soc_pct", unit: "%", base: 100, jitter: 0 }] },
      { tag: "DOOR-7", name: "Dock door 7", type: "Dock door", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, metrics: [{ metric: "uptime_pct", unit: "%", base: 99.6, jitter: 0.3 }] },
    ],
  },
  {
    code: "NW-CON-03",
    name: "Site yard 3",
    category: SiteCategory.CONSTRUCTION_SITE,
    lat: 52.204,
    lng: -1.31,
    address: "A46 works compound, Northamptonshire",
    assets: [
      { tag: "GEN-3", name: "Generator 3", type: "Generator", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, manufacturer: "Atlas Copco", model: "QAS 60", specs: { rated_kva: 60 }, intervalDays: 60, lastMaintDaysAgo: 22, metrics: [{ metric: "fuel_level_pct", unit: "%", base: 62, jitter: 3, trend: -0.8 }, { metric: "power_kw", unit: "kW", base: 31, jitter: 8 }] },
      { tag: "LT-1", name: "Lighting tower", type: "Lighting tower", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, metrics: [{ metric: "fuel_level_pct", unit: "%", base: 71, jitter: 2, trend: -0.4 }] },
      { tag: "PMP-2", name: "Dewatering pump 2", type: "Dewatering pump", status: AssetStatus.AT_RISK, criticality: Criticality.MEDIUM, intervalDays: 30, lastMaintDaysAgo: 33, metrics: [{ metric: "vibration_mms", unit: "mm/s", base: 6.8, jitter: 1.1, trend: 0.12 }] },
      { tag: "CAB-1", name: "Site cabin", type: "Site cabin", status: AssetStatus.HEALTHY, criticality: Criticality.LOW, metrics: [{ metric: "uptime_pct", unit: "%", base: 100, jitter: 0 }] },
    ],
  },
];

const MERIDIAN_SITES: SeedSite[] = [
  {
    code: "MT-TWR-01",
    name: "Tower Pune-01",
    category: SiteCategory.TELECOM_TOWER,
    lat: 18.52,
    lng: 73.856,
    address: "Hinjawadi, Pune",
    assets: [
      { tag: "RECT-1", name: "Rectifier", type: "Rectifier", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, metrics: [{ metric: "voltage_v", unit: "V", base: 54.1, jitter: 0.3 }] },
      { tag: "BAT-1", name: "Battery bank", type: "Battery bank", status: AssetStatus.HEALTHY, criticality: Criticality.HIGH, metrics: [{ metric: "battery_soc_pct", unit: "%", base: 91, jitter: 3 }] },
    ],
  },
  {
    code: "MT-TWR-02",
    name: "Tower Pune-02",
    category: SiteCategory.TELECOM_TOWER,
    lat: 18.59,
    lng: 73.74,
    address: "Wakad, Pune",
    assets: [{ tag: "GEN-1", name: "Standby generator", type: "Generator", status: AssetStatus.HEALTHY, criticality: Criticality.MEDIUM, metrics: [{ metric: "fuel_level_pct", unit: "%", base: 84, jitter: 2 }] }],
  },
];

/** Deterministic pseudo-random so the seed is stable between runs. */
function rng(seed: number) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

export const DEMO_INGEST_KEYS: Record<string, string> = {
  "northwind-demo": "sw_ingest_northwind_demo_key_000000000001",
  "meridian-demo": "sw_ingest_meridian_demo_key_000000000002",
};

export async function seedRegistry(db: PrismaClient, organizationId: string, slug: string) {
  const sites = slug === "northwind-demo" ? NORTHWIND_SITES : slug === "meridian-demo" ? MERIDIAN_SITES : [];
  const now = Date.now();
  const rand = rng(slug.length * 7919 + 17);
  let assetCount = 0;
  let eventCount = 0;

  for (const s of sites) {
    const site = await db.site.upsert({
      where: { organizationId_code: { organizationId, code: s.code } },
      update: { name: s.name, category: s.category, latitude: s.lat, longitude: s.lng, address: s.address },
      create: { organizationId, code: s.code, name: s.name, category: s.category, latitude: s.lat, longitude: s.lng, address: s.address },
    });

    for (const a of s.assets) {
      const lastMaintenanceAt = a.lastMaintDaysAgo ? new Date(now - a.lastMaintDaysAgo * 86400000) : null;
      const nextMaintenanceAt = lastMaintenanceAt && a.intervalDays ? new Date(lastMaintenanceAt.getTime() + a.intervalDays * 86400000) : null;
      const installDate = new Date(now - (400 + Math.floor(rand() * 900)) * 86400000);
      const asset = await db.asset.upsert({
        where: { organizationId_tag: { organizationId, tag: a.tag } },
        update: { name: a.name, type: a.type, siteId: site.id, status: a.status ?? AssetStatus.UNKNOWN, criticality: a.criticality ?? Criticality.MEDIUM },
        create: {
          organizationId,
          siteId: site.id,
          tag: a.tag,
          name: a.name,
          type: a.type,
          manufacturer: a.manufacturer ?? null,
          model: a.model ?? null,
          serialNumber: `${a.tag.replace("-", "")}-${Math.floor(rand() * 900000 + 100000)}`,
          installDate,
          status: a.status ?? AssetStatus.UNKNOWN,
          criticality: a.criticality ?? Criticality.MEDIUM,
          specifications: a.specs ? JSON.stringify(a.specs) : null,
          maintenanceIntervalDays: a.intervalDays ?? null,
          lastMaintenanceAt,
          nextMaintenanceAt,
        },
      });
      assetCount++;

      const existing = await db.telemetryEvent.count({ where: { assetId: asset.id } });
      if (existing > 0) continue;

      // Seven days of readings every 2 hours per metric.
      const rows: Array<{ organizationId: string; assetId: string; metric: string; value: number; unit: string; recordedAt: Date; receivedAt: Date; source: string }> = [];
      const points = 7 * 12;
      let latest = new Date(0);
      for (const m of a.metrics) {
        for (let i = points; i >= 0; i--) {
          const t = new Date(now - i * 2 * 3600000);
          const trend = (m.trend ?? 0) * (points - i) / 12;
          const value = Math.round((m.base + trend + (rand() - 0.5) * 2 * m.jitter) * 100) / 100;
          rows.push({ organizationId, assetId: asset.id, metric: m.metric, value, unit: m.unit, recordedAt: t, receivedAt: t, source: "demo-feed" });
          if (t > latest) latest = t;
        }
      }
      if (rows.length) {
        await db.telemetryEvent.createMany({ data: rows });
        await db.asset.update({ where: { id: asset.id }, data: { lastTelemetryAt: latest } });
        eventCount += rows.length;
      }
    }
  }

  const rawKey = DEMO_INGEST_KEYS[slug];
  if (rawKey) {
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    await db.ingestKey.upsert({
      where: { keyHash },
      update: { revokedAt: null },
      create: { organizationId, name: "Demo feed", keyPrefix: rawKey.slice(0, 18), keyHash },
    });
  }

  return { sites: sites.length, assets: assetCount, events: eventCount };
}
