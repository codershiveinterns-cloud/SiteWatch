import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./reveal";
import { DemoTag, Meta, SectionHeading } from "./primitives";
import { CountUp } from "./count-up";

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
          <div className="console-frame grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-xl bg-surface lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative aspect-[16/11] overflow-hidden bg-sunken bg-dots sm:aspect-[16/9] lg:aspect-auto lg:min-h-[480px]">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,color-mix(in_srgb,var(--sw-accent)_14%,transparent),transparent_75%)]" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(95%_95%_at_50%_50%,transparent_55%,var(--sw-sunken)_100%)]" />
              <div aria-hidden className="sw-radar pointer-events-none absolute left-1/2 top-1/2 size-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 motion-ok:animate-radar [mask-image:radial-gradient(circle,black_0%,black_45%,transparent_62%)]" style={{ background: "conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--sw-accent) 16%, transparent) 30deg, transparent 60deg)" }} />
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
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-accent/10 to-transparent motion-ok:animate-scan" />

              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                {[
                  "M8 40 C 18 20, 40 26, 52 14 S 82 8, 90 24 S 98 52, 88 68 S 70 94, 52 94 S 22 92, 12 76 S -2 58, 8 40 Z",
                  "M18 44 C 26 30, 44 32, 54 24 S 78 20, 84 34 S 90 56, 80 66 S 62 84, 50 84 S 30 82, 22 70 S 10 56, 18 44 Z",
                  "M28 48 C 34 38, 46 38, 54 34 S 72 32, 76 42 S 80 58, 72 64 S 58 74, 50 74 S 36 72, 32 64 S 22 56, 28 48 Z",
                ].map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="var(--sw-accent)" strokeOpacity={0.18 - i * 0.04} strokeWidth="0.35" vectorEffect="non-scaling-stroke" className="motion-ok:animate-breathe" style={{ animationDelay: `${i * 900}ms` } as CSSProperties} />
                ))}
                <path d="M28 48 C 34 38, 46 38, 54 34 S 72 32, 76 42 S 80 58, 72 64 S 58 74, 50 74 S 36 72, 32 64 S 22 56, 28 48 Z" fill="var(--sw-accent)" fillOpacity="0.06" />
                {[
                  [0, 1], [1, 2], [2, 7], [2, 4], [1, 3], [3, 6], [1, 5], [4, 6],
                ].map(([a, b], i) => {
                  const id = `map-link-${i}`;
                  return (
                    <g key={id}>
                      <path id={id} d={`M${SITES[a].x} ${SITES[a].y} L${SITES[b].x} ${SITES[b].y}`} fill="none" stroke="var(--sw-border-strong)" strokeWidth="0.3" strokeDasharray="1.5 2.2" vectorEffect="non-scaling-stroke" />
                      <circle r="0.8" fill="var(--sw-accent)" className="sw-packet" style={{ filter: "drop-shadow(0 0 2px var(--sw-accent))" }}>
                        <animateMotion dur={`${3.4 + i * 0.6}s`} repeatCount="indefinite" begin={`${i * 0.45}s`}>
                          <mpath href={`#${id}`} />
                        </animateMotion>
                      </circle>
                    </g>
                  );
                })}
                <circle cx={selected.x} cy={selected.y} r="6" fill="none" stroke="var(--sw-critical)" strokeOpacity="0.6" strokeWidth="0.3" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
              </svg>

              {SITES.map((s, i) => (
                <div
                  key={s.id}
                  className="m-reveal absolute -translate-x-1/2 -translate-y-1/2 motion-ok:animate-marker-in"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, "--marker-delay": `${200 + i * 90}ms` } as CSSProperties}
                >
                  <span className="sw-dot" style={{ "--marker": color[s.tone] } as CSSProperties} data-ping={s.tone !== "healthy"} data-delay={i % 2} />
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
                <div className="px-4 py-2.5">
                  <dt className="font-mono text-2xs uppercase tracking-wider text-ink-3">Assets</dt>
                  <dd className="text-sm font-semibold text-ink tabular"><CountUp value={selected.assets} duration={900} /></dd>
                </div>
                <div className="px-4 py-2.5">
                  <dt className="font-mono text-2xs uppercase tracking-wider text-ink-3">Open</dt>
                  <dd className="text-sm font-semibold text-ink tabular"><CountUp value={selected.open} duration={900} /></dd>
                </div>
                <div className="px-4 py-2.5">
                  <dt className="font-mono text-2xs uppercase tracking-wider text-ink-3">SLA</dt>
                  <dd className="text-sm font-semibold text-ink tabular">1h 12m</dd>
                </div>
              </dl>
              <div className="px-4 py-3">
                <Meta>Assets</Meta>
                <ul className="mt-2 space-y-1.5">
                  {[
                    ["INV-2", "Backup inverter", "critical", "Offline · 14m"],
                    ["HVAC-2", "HVAC zone 2", "healthy", "4.1 °C"],
                    ["UPS-1", "UPS", "healthy", "100%"],
                    ["DOOR-7", "Dock door 7", "healthy", "Closed"],
                  ].map(([id, n, t, m], i) => (
                    <li key={id} className="m-reveal flex items-center gap-2.5 text-xs motion-ok:animate-rise" style={{ "--rise-delay": `${600 + i * 110}ms` } as CSSProperties}>
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
