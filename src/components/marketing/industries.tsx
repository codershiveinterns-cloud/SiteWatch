"use client";

import * as React from "react";
import { Sun, RadioTower, Zap, Warehouse, HardHat, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { Reveal } from "./reveal";
import { DemoTag, Meta, SectionHeading } from "./primitives";

type Industry = {
  key: string;
  label: string;
  icon: LucideIcon;
  headline: string;
  body: string;
  assets: Array<{ id: string; name: string; tone: StatusTone; metric: string }>;
  grid: string;
};

const INDUSTRIES: Industry[] = [
  {
    key: "solar",
    label: "Solar",
    icon: Sun,
    headline: "Solar farms",
    body: "Inverters, strings and combiners across hectares of field. A single under-performing inverter is invisible in a monthly yield report and obvious in SiteWatch.",
    grid: "Array A · 52.41 / -1.92",
    assets: [
      { id: "INV-1", name: "Inverter 1", tone: "healthy", metric: "98.7 kW" },
      { id: "INV-2", name: "Inverter 2", tone: "critical", metric: "0 kW" },
      { id: "STR-14", name: "String 14", tone: "atrisk", metric: "-12% vs peers" },
      { id: "MET-1", name: "Weather station", tone: "healthy", metric: "812 W/m²" },
    ],
  },
  {
    key: "telecom",
    label: "Telecom",
    icon: RadioTower,
    headline: "Telecom towers",
    body: "Remote sites where power, battery and environmental conditions decide uptime. Catch a failing rectifier before the batteries drain.",
    grid: "Tower N-4 · 53.10 / -2.40",
    assets: [
      { id: "RECT-1", name: "Rectifier", tone: "healthy", metric: "54.2 V" },
      { id: "BAT-1", name: "Battery bank", tone: "atrisk", metric: "SoC 41%" },
      { id: "GEN-1", name: "Generator", tone: "healthy", metric: "Standby" },
      { id: "ENV-1", name: "Cabinet temp", tone: "healthy", metric: "27 °C" },
    ],
  },
  {
    key: "ev",
    label: "EV infrastructure",
    icon: Zap,
    headline: "EV charging stations",
    body: "Public chargers fail quietly and cost revenue every hour. Track charger state, faults and temperature per connector.",
    grid: "EV hub 12 · 51.88 / -0.42",
    assets: [
      { id: "CH-05", name: "Charger 05", tone: "healthy", metric: "Charging · 48 kW" },
      { id: "CH-06", name: "Charger 06", tone: "healthy", metric: "Available" },
      { id: "CH-07", name: "Charger 07", tone: "atrisk", metric: "65.4 °C" },
      { id: "CH-08", name: "Charger 08", tone: "healthy", metric: "Available" },
    ],
  },
  {
    key: "warehouse",
    label: "Warehousing",
    icon: Warehouse,
    headline: "Warehouses",
    body: "Cold chain, HVAC, power and access equipment spread over large footprints. Know which zone needs a technician, not just that something tripped.",
    grid: "Warehouse C · 52.63 / -1.13",
    assets: [
      { id: "HVAC-2", name: "HVAC zone 2", tone: "healthy", metric: "4.1 °C" },
      { id: "INV-2", name: "Backup inverter", tone: "critical", metric: "Offline" },
      { id: "DOOR-7", name: "Dock door 7", tone: "healthy", metric: "Closed" },
      { id: "UPS-1", name: "UPS", tone: "healthy", metric: "100%" },
    ],
  },
  {
    key: "construction",
    label: "Construction",
    icon: HardHat,
    headline: "Construction sites",
    body: "Temporary sites with generators, lighting towers and pumps that move every few weeks. Keep the registry current and the response fast.",
    grid: "Site yard 3 · 52.20 / -1.71",
    assets: [
      { id: "GEN-3", name: "Generator 3", tone: "healthy", metric: "Fuel 62%" },
      { id: "LT-1", name: "Lighting tower", tone: "healthy", metric: "On · 18:40" },
      { id: "PMP-2", name: "Dewatering pump", tone: "atrisk", metric: "Vibration high" },
      { id: "CAB-1", name: "Site cabin", tone: "healthy", metric: "Powered" },
    ],
  },
];

export function Industries() {
  const [active, setActive] = React.useState(INDUSTRIES[0]);
  const Icon = active.icon;

  return (
    <section id="industries" className="scroll-mt-20 py-20 lg:py-28" aria-labelledby="ind-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Site types"
            title={<span id="ind-title">Designed for sites nobody is standing next to.</span>}
            lede="The registry, alert rules and technician skills adapt to the asset classes each environment runs on."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal className="min-w-0">
            <div role="tablist" aria-label="Site types" aria-orientation="vertical" className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:px-0">
              {INDUSTRIES.map((ind) => {
                const I = ind.icon;
                const selected = ind.key === active.key;
                return (
                  <button
                    key={ind.key}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="industry-panel"
                    onClick={() => setActive(ind)}
                    className={cn(
                      "flex h-11 shrink-0 items-center gap-2.5 rounded-md border px-3 text-sm font-medium transition-colors",
                      selected ? "border-line-strong bg-surface text-ink shadow-sm" : "border-transparent text-ink-2 hover:bg-sunken hover:text-ink",
                    )}
                  >
                    <I className={cn("size-4", selected ? "text-accent" : "text-ink-3")} aria-hidden />
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div id="industry-panel" role="tabpanel" className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-lg border border-line bg-surface shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="p-6 lg:p-8">
                <span className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-surface-2 text-accent">
                  <Icon className="size-4" aria-hidden />
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">{active.headline}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{active.body}</p>
              </div>
              <div className="relative border-t border-line bg-sunken/60 bg-grid p-4 md:border-l md:border-t-0">
                <div className="mb-3 flex items-center justify-between">
                  <Meta>{active.grid}</Meta>
                  <DemoTag />
                </div>
                <ul key={active.key} className="space-y-1.5">
                  {active.assets.map((a, i) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 motion-ok:animate-rise"
                      style={{ "--rise-delay": `${i * 60}ms` } as React.CSSProperties}
                    >
                      <StatusDot tone={a.tone} pulse={a.tone === "critical"} />
                      <span className="w-14 font-mono text-2xs text-ink-3">{a.id}</span>
                      <span className="flex-1 truncate text-sm text-ink">{a.name}</span>
                      <span className="font-mono text-2xs text-ink-2 tabular">{a.metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
