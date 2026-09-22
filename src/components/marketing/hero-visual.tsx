import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { DemoTag, Meta } from "./primitives";
import { LiveAlerts } from "./live-alerts";

type Site = { id: string; x: number; y: number; tone: StatusTone; label: string; metric: string };

const SITES: Site[] = [
  { id: "S-01", x: 16, y: 34, tone: "healthy", label: "Solar array A", metric: "642 kW" },
  { id: "S-02", x: 33, y: 60, tone: "healthy", label: "Tower N-4", metric: "54.2 V" },
  { id: "S-03", x: 52, y: 26, tone: "atrisk", label: "EV hub 12", metric: "65 °C" },
  { id: "S-04", x: 66, y: 68, tone: "critical", label: "Warehouse C", metric: "0 kW" },
  { id: "S-05", x: 83, y: 38, tone: "healthy", label: "Tower N-9", metric: "96 %" },
  { id: "S-06", x: 42, y: 84, tone: "healthy", label: "Site yard 3", metric: "62 %" },
  { id: "S-07", x: 88, y: 78, tone: "healthy", label: "Solar array B", metric: "298 kW" },
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 4],
  [1, 3],
  [3, 6],
  [1, 5],
  [3, 4],
];

const color: Record<StatusTone, string> = {
  healthy: "var(--sw-healthy)",
  atrisk: "var(--sw-atrisk)",
  critical: "var(--sw-critical)",
  info: "var(--sw-info)",
  neutral: "var(--sw-neutral)",
  pending: "var(--sw-neutral)",
};

/** Contour rings drawn as smooth closed curves around the region centre. */
const CONTOURS = [
  "M18 40 C 26 24, 44 22, 56 20 S 84 26, 88 44 S 80 76, 62 82 S 30 84, 20 68 S 10 52, 18 40 Z",
  "M26 42 C 32 30, 46 28, 56 28 S 78 32, 80 46 S 74 70, 60 74 S 36 76, 28 64 S 20 52, 26 42 Z",
  "M34 44 C 38 36, 48 34, 56 36 S 70 40, 72 48 S 68 64, 58 66 S 42 68, 36 60 S 30 50, 34 44 Z",
];

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Console is always rendered as a dark NOC screen, whatever the page theme. */}
      <div data-theme="dark" className="console-frame overflow-hidden rounded-xl bg-surface text-ink">
        <div className="flex h-9 min-w-0 items-center gap-2 border-b border-line bg-surface-2 px-3">
          <span aria-hidden className="flex gap-1">
            <span className="size-2 rounded-full bg-line-strong" />
            <span className="size-2 rounded-full bg-line-strong" />
            <span className="size-2 rounded-full bg-line-strong" />
          </span>
          <span className="ml-1 min-w-0 flex-1 truncate font-mono text-2xs text-ink-3">sitewatch · operations · northwind-demo</span>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            <DemoTag />
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* Map */}
          <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-sunken bg-dots md:aspect-auto md:min-h-[380px] md:border-b-0 md:border-r">
            {/* vignette + region tint */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,color-mix(in_srgb,var(--sw-accent)_14%,transparent),transparent_75%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_50%,transparent_55%,var(--sw-sunken)_100%)]" />

            {/* radar sweep */}
            <div aria-hidden className="sw-radar pointer-events-none absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 motion-ok:animate-radar [mask-image:radial-gradient(circle,black_0%,black_45%,transparent_62%)]" style={{ background: "conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--sw-accent) 18%, transparent) 30deg, transparent 60deg)" }} />

            <div className="absolute left-3 top-3 z-10">
              <Meta>Region · North grid</Meta>
            </div>
            <div className="absolute right-3 top-3 z-10 hidden items-center gap-3 sm:flex">
              <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="healthy" /> 5</span>
              <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="atrisk" /> 1</span>
              <span className="inline-flex items-center gap-1.5 text-2xs text-ink-2"><StatusDot tone="critical" /> 1</span>
            </div>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              {CONTOURS.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--sw-accent)" strokeOpacity={0.16 - i * 0.03} strokeWidth="0.35" vectorEffect="non-scaling-stroke" className="motion-ok:animate-breathe" style={{ animationDelay: `${i * 900}ms` } as CSSProperties} />
              ))}
              <path d={CONTOURS[2]} fill="var(--sw-accent)" fillOpacity="0.06" />
              {LINKS.map(([a, b], i) => {
                const A = SITES[a];
                const B = SITES[b];
                const id = `hero-link-${i}`;
                return (
                  <g key={id}>
                    <path id={id} d={`M${A.x} ${A.y} L${B.x} ${B.y}`} fill="none" stroke="var(--sw-border-strong)" strokeWidth="0.35" vectorEffect="non-scaling-stroke" strokeDasharray="1.5 2.2" />
                    <circle r="0.9" fill="var(--sw-accent)" className="sw-packet" style={{ filter: "drop-shadow(0 0 2px var(--sw-accent))" }}>
                      <animateMotion dur={`${3.2 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.5}s`}>
                        <mpath href={`#${id}`} />
                      </animateMotion>
                    </circle>
                  </g>
                );
              })}
            </svg>

            {SITES.map((s, i) => (
              <div
                key={s.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 motion-ok:animate-marker-in"
                style={{ left: `${s.x}%`, top: `${s.y}%`, "--marker-delay": `${500 + i * 90}ms` } as CSSProperties}
              >
                <span className="sw-dot" style={{ "--marker": color[s.tone] } as CSSProperties} data-ping={s.tone !== "healthy"} data-delay={i % 2} />
                {s.tone !== "healthy" ? (
                  <span className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-md border border-line bg-surface/95 px-2 py-1 font-mono text-2xs text-ink shadow-md backdrop-blur sm:flex">
                    <span className="font-semibold">{s.id}</span>
                    <span className="text-ink-2">{s.label}</span>
                    <span style={{ color: color[s.tone] }}>{s.metric}</span>
                  </span>
                ) : null}
              </div>
            ))}

            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
              <Meta>Grid 52.4 / -1.9</Meta>
              <span className="h-px w-8 bg-line-strong" aria-hidden />
              <Meta>7 sites · 41 assets</Meta>
            </div>
          </div>

          {/* Side panel */}
          <div className="flex min-w-0 flex-col">
            <LiveAlerts />

            <div className="mt-auto border-t border-line px-3 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Asset health</span>
                <Meta>41 assets</Meta>
              </div>
              <div className="flex h-2 overflow-hidden rounded-sm bg-sunken" role="img" aria-label="Asset health: mostly healthy, a few at risk, one critical">
                <span className="w-[82%] bg-healthy motion-ok:animate-grow-x" style={{ "--bar-delay": "1100ms" } as CSSProperties} />
                <span className="w-[13%] bg-atrisk motion-ok:animate-grow-x" style={{ "--bar-delay": "1300ms" } as CSSProperties} />
                <span className="w-[5%] bg-critical motion-ok:animate-grow-x" style={{ "--bar-delay": "1450ms" } as CSSProperties} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-2xs text-ink-2">
                <span className="inline-flex items-center gap-1.5"><StatusDot tone="healthy" /> 34 healthy</span>
                <span className="inline-flex items-center gap-1.5"><StatusDot tone="atrisk" /> 5 at risk</span>
                <span className="inline-flex items-center gap-1.5"><StatusDot tone="critical" /> 2 critical</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-3 py-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-2xs text-ink-3">
                <span className="size-1.5 shrink-0 rounded-full bg-healthy animate-ticker" aria-hidden /> Telemetry · live
              </span>
              <svg viewBox="0 0 120 20" className="hidden h-4 min-w-0 flex-1 xl:block" aria-hidden>
                <polyline points="0,14 10,12 20,13 30,9 40,11 50,7 60,8 70,5 80,9 90,6 100,4 110,7 120,5" fill="none" stroke="var(--sw-accent)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" className="motion-ok:animate-draw" style={{ "--draw-length": 2000, "--draw-delay": "1200ms" } as CSSProperties} />
              </svg>
              <Meta className="whitespace-nowrap">SLA at risk · 1</Meta>
            </div>
          </div>
        </div>
      </div>
      {/* Soft reflection under the console */}
      <div aria-hidden className="pointer-events-none absolute inset-x-8 -bottom-6 h-10 rounded-[100%] bg-[radial-gradient(50%_100%_at_50%_0%,color-mix(in_srgb,var(--sw-accent)_25%,transparent),transparent)] blur-md" />
    </div>
  );
}
