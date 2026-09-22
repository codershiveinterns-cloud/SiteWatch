import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { DemoTag, Meta, Window } from "./primitives";

type Site = { id: string; x: number; y: number; tone: StatusTone; label: string };

const SITES: Site[] = [
  { id: "S-01", x: 18, y: 30, tone: "healthy", label: "Solar array A" },
  { id: "S-02", x: 34, y: 58, tone: "healthy", label: "Tower N-4" },
  { id: "S-03", x: 52, y: 26, tone: "atrisk", label: "EV hub 12" },
  { id: "S-04", x: 66, y: 66, tone: "critical", label: "Warehouse C" },
  { id: "S-05", x: 82, y: 38, tone: "healthy", label: "Tower N-9" },
  { id: "S-06", x: 44, y: 82, tone: "healthy", label: "Site yard 3" },
  { id: "S-07", x: 88, y: 76, tone: "healthy", label: "Solar array B" },
];

const ALERTS: Array<{ tone: StatusTone; title: string; site: string; age: string }> = [
  { tone: "critical", title: "Inverter offline", site: "Warehouse C · INV-2", age: "2m" },
  { tone: "atrisk", title: "Charger temp above threshold", site: "EV hub 12 · CH-07", age: "11m" },
  { tone: "atrisk", title: "Battery SoC trending low", site: "Tower N-4 · BAT-1", age: "38m" },
];

const fill: Record<StatusTone, string> = {
  healthy: "var(--sw-healthy)",
  atrisk: "var(--sw-atrisk)",
  critical: "var(--sw-critical)",
  info: "var(--sw-info)",
  neutral: "var(--sw-neutral)",
  pending: "var(--sw-neutral)",
};

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Window
        title="sitewatch · operations · northwind-demo"
        meta={<DemoTag />}
        className="shadow-lg"
        bodyClassName="grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
      >
        {/* Map */}
        <div className="relative aspect-[4/3] border-b border-line bg-sunken bg-grid md:aspect-auto md:min-h-[360px] md:border-b-0 md:border-r">
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Meta>Region · North grid</Meta>
          </div>
          <div className="absolute right-3 top-3 hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="healthy" /> 5</span>
            <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="atrisk" /> 1</span>
            <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="critical" /> 1</span>
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Abstract terrain / service area outlines */}
            <path
              d="M6 44 C 18 30, 30 36, 42 24 S 66 14, 78 22 S 96 40, 92 58 S 76 86, 60 90 S 30 92, 18 78 S 2 60, 6 44 Z"
              fill="none"
              stroke="var(--sw-border-strong)"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M12 52 C 22 44, 30 50, 40 40 S 60 30, 72 36 S 88 50, 82 64 S 68 80, 54 82 S 30 80, 22 70 S 8 60, 12 52 Z"
              fill="var(--sw-accent-soft)"
              fillOpacity="0.35"
              stroke="none"
            />
            {/* Links between sites */}
            {[
              [SITES[0], SITES[1]],
              [SITES[1], SITES[2]],
              [SITES[2], SITES[4]],
              [SITES[1], SITES[3]],
              [SITES[3], SITES[6]],
              [SITES[1], SITES[5]],
            ].map(([a, b], i) => (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--sw-border-strong)"
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
                className="motion-ok:animate-draw"
                style={{ "--draw-length": 2000, "--draw-delay": `${400 + i * 120}ms` } as CSSProperties}
              />
            ))}
          </svg>

          {SITES.map((s, i) => (
            <div
              key={s.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 motion-ok:animate-marker-in"
              style={{ left: `${s.x}%`, top: `${s.y}%`, "--marker-delay": `${600 + i * 90}ms` } as CSSProperties}
            >
              <span
                className={cn("block size-2.5 rounded-full ring-2 ring-surface", s.tone !== "healthy" && "animate-pulse-ring")}
                style={{ background: fill[s.tone], color: fill[s.tone] }}
              />
              {s.tone !== "healthy" ? (
                <span className="absolute left-3 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-sm border border-line bg-surface px-1.5 py-0.5 font-mono text-2xs text-ink shadow-sm sm:block">
                  {s.id} · {s.label}
                </span>
              ) : null}
            </div>
          ))}

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Meta>Grid 52.4 / -1.9</Meta>
            <span className="h-px w-8 bg-line-strong" aria-hidden />
            <Meta>7 sites · 41 assets</Meta>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="text-xs font-semibold text-ink">Open alerts</span>
            <Meta>3 active</Meta>
          </div>
          <ul className="divide-y divide-line">
            {ALERTS.map((a, i) => (
              <li
                key={a.title}
                className="flex items-start gap-2.5 px-3 py-2.5 motion-ok:animate-rise"
                style={{ "--rise-delay": `${900 + i * 140}ms` } as CSSProperties}
              >
                <StatusDot tone={a.tone} className="mt-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">{a.title}</p>
                  <p className="truncate font-mono text-2xs text-ink-3">{a.site}</p>
                </div>
                <span className="font-mono text-2xs text-ink-3 tabular">{a.age}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-line px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Asset health</span>
              <Meta>41 assets</Meta>
            </div>
            <div className="flex h-2 overflow-hidden rounded-sm bg-sunken" role="img" aria-label="Asset health: mostly healthy, a few at risk, one critical">
              <span className="w-[82%] bg-healthy" />
              <span className="w-[13%] bg-atrisk" />
              <span className="w-[5%] bg-critical" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-2xs text-ink-2">
              <span className="inline-flex items-center gap-1.5"><StatusDot tone="healthy" /> 34 healthy</span>
              <span className="inline-flex items-center gap-1.5"><StatusDot tone="atrisk" /> 5 at risk</span>
              <span className="inline-flex items-center gap-1.5"><StatusDot tone="critical" /> 2 critical</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line bg-surface-2 px-3 py-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-2xs text-ink-3">
              <span className="size-1.5 rounded-full bg-healthy animate-ticker" aria-hidden /> Telemetry stream · live
            </span>
            <Meta>SLA at risk · 1</Meta>
          </div>
        </div>
      </Window>
    </div>
  );
}
