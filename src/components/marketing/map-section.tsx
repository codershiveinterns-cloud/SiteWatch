import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./reveal";
import { DemoTag, Meta, SectionHeading } from "./primitives";

const SITES: Array<{ id: string; name: string; x: number; y: number; tone: StatusTone; assets: number; open: number }> = [
  { id: "S-01", name: "Solar array A", x: 14, y: 36, tone: "healthy", assets: 9, open: 0 },
  { id: "S-02", name: "Tower N-4", x: 30, y: 60, tone: "atrisk", assets: 4, open: 1 },
  { id: "S-03", name: "EV hub 12", x: 46, y: 28, tone: "atrisk", assets: 8, open: 1 },
  { id: "S-04", name: "Warehouse C", x: 60, y: 68, tone: "critical", assets: 6, open: 1 },
  { id: "S-05", name: "Tower N-9", x: 76, y: 40, tone: "healthy", assets: 4, open: 0 },
  { id: "S-06", name: "Site yard 3", x: 40, y: 84, tone: "healthy", assets: 5, open: 0 },
  { id: "S-07", name: "Solar array B", x: 86, y: 76, tone: "healthy", assets: 5, open: 0 },
  { id: "S-08", name: "Tower N-12", x: 68, y: 18, tone: "healthy", assets: 4, open: 0 },
];

const color: Record<StatusTone, string> = {
  healthy: "var(--sw-healthy)",
  atrisk: "var(--sw-atrisk)",
  critical: "var(--sw-critical)",
  info: "var(--sw-info)",
  neutral: "var(--sw-neutral)",
  pending: "var(--sw-neutral)",
};

export function MapSection() {
  const selected = SITES[3];
  return (
    <section data-theme="dark" className="bg-canvas py-20 text-ink lg:py-28" aria-labelledby="map-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="Operational visibility"
            title={<span id="map-title">See the operational picture at a glance.</span>}
            lede="The map is the primary screen for operations managers: every site colour-coded by status, filterable, with drill-down to the asset and the incident behind it."
          />
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-lg border border-line bg-surface shadow-lg lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative aspect-[16/11] bg-sunken bg-grid sm:aspect-[16/9] lg:aspect-auto lg:min-h-[480px]">
              <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
                {["All sites", "Critical", "At risk"].map((f, i) => (
                  <span key={f} className={cn("rounded-sm border px-2 py-1 font-mono text-2xs", i === 0 ? "border-accent/50 bg-accent-soft text-accent-text" : "border-line bg-surface text-ink-3")}>
                    {f}
                  </span>
                ))}
              </div>
              <div className="absolute right-4 top-4 z-10">
                <DemoTag />
              </div>

              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                <path
                  d="M4 40 C 14 22, 34 30, 48 16 S 76 8, 88 20 S 98 48, 90 64 S 74 92, 56 94 S 26 92, 14 78 S -4 58, 4 40 Z"
                  fill="var(--sw-surface-2)"
                  stroke="var(--sw-border-strong)"
                  strokeWidth="0.3"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M20 50 C 30 40, 40 46, 50 36 S 70 30, 78 40 S 84 58, 74 68 S 56 82, 44 80 S 26 74, 22 64 S 14 56, 20 50 Z"
                  fill="var(--sw-accent-soft)"
                  fillOpacity="0.25"
                />
                {[
                  [0, 1], [1, 2], [2, 7], [2, 4], [1, 3], [3, 6], [1, 5], [4, 6],
                ].map(([a, b], i) => (
                  <line key={i} x1={SITES[a].x} y1={SITES[a].y} x2={SITES[b].x} y2={SITES[b].y} stroke="var(--sw-border-strong)" strokeWidth="0.3" strokeDasharray="1 1.4" vectorEffect="non-scaling-stroke" />
                ))}
                <circle cx={selected.x} cy={selected.y} r="6" fill="none" stroke="var(--sw-critical)" strokeWidth="0.3" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
              </svg>

              {SITES.map((s, i) => (
                <div
                  key={s.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 motion-ok:animate-marker-in"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, "--marker-delay": `${i * 70}ms` } as CSSProperties}
                >
                  <span
                    className={cn("block size-3 rounded-full ring-2 ring-surface", s.tone !== "healthy" && "animate-pulse-ring")}
                    style={{ background: color[s.tone], color: color[s.tone] }}
                  />
                  <span className="absolute left-4 top-1/2 hidden -translate-y-1/2 whitespace-nowrap font-mono text-2xs text-ink-2 md:block">
                    {s.name}
                  </span>
                </div>
              ))}

              <div className="absolute bottom-4 left-4 flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="healthy" /> Healthy</span>
                <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="atrisk" /> At risk</span>
                <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="critical" /> Critical</span>
              </div>
              <div className="absolute bottom-4 right-4 hidden sm:block">
                <Meta>Scale 1:250k · 8 sites</Meta>
              </div>
            </div>

            <aside className="flex flex-col border-t border-line lg:border-l lg:border-t-0">
              <div className="border-b border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <Meta>{selected.id}</Meta>
                  <Badge tone="critical">Critical</Badge>
                </div>
                <h3 className="mt-1 text-md font-semibold text-ink">{selected.name}</h3>
                <p className="font-mono text-2xs text-ink-3">52.63 / -1.13 · Warehouse</p>
              </div>
              <dl className="grid grid-cols-3 divide-x divide-line border-b border-line">
                {[
                  ["Assets", String(selected.assets)],
                  ["Open", String(selected.open)],
                  ["SLA", "1h 12m"],
                ].map(([k, v]) => (
                  <div key={k} className="px-4 py-2.5">
                    <dt className="font-mono text-2xs uppercase tracking-wider text-ink-3">{k}</dt>
                    <dd className="text-sm font-semibold text-ink tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="px-4 py-3">
                <Meta>Assets</Meta>
                <ul className="mt-2 space-y-1.5">
                  {[
                    ["INV-2", "Backup inverter", "critical", "Offline · 14m"],
                    ["HVAC-2", "HVAC zone 2", "healthy", "4.1 °C"],
                    ["UPS-1", "UPS", "healthy", "100%"],
                    ["DOOR-7", "Dock door 7", "healthy", "Closed"],
                  ].map(([id, n, t, m]) => (
                    <li key={id} className="flex items-center gap-2.5 text-xs">
                      <StatusDot tone={t as StatusTone} />
                      <span className="w-12 font-mono text-2xs text-ink-3">{id}</span>
                      <span className="flex-1 truncate text-ink">{n}</span>
                      <span className="font-mono text-2xs text-ink-3">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto border-t border-line bg-surface-2 px-4 py-3">
                <p className="text-xs font-medium text-ink">INC-1042 · Inverter offline</p>
                <p className="mt-0.5 font-mono text-2xs text-ink-3">Assigned · P. Nair · en route</p>
              </div>
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
