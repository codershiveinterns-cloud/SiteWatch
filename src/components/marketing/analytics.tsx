import type { CSSProperties } from "react";
import { Reveal } from "./reveal";
import { DemoTag, Meta, SectionHeading, Window } from "./primitives";

const UPTIME = [99.2, 99.6, 98.1, 99.8, 99.4, 99.9, 97.6, 99.7];
const ALERTS = [12, 9, 15, 7, 11, 6, 14, 8, 5, 9, 4, 7];
const MTTR = [4.2, 3.8, 3.1, 3.4, 2.9, 2.6, 2.4, 2.2];

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${40 - ((v - min) / (max - min || 1)) * 34 - 3}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-12 w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" className="motion-ok:animate-draw" style={{ "--draw-length": 2000 } as CSSProperties} />
    </svg>
  );
}

export function Analytics() {
  return (
    <section id="analytics" className="scroll-mt-20 py-20 lg:py-28" aria-labelledby="an-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading
            index="07"
            eyebrow="Operational analytics"
            title={<span id="an-title">Understand how the operation actually performs.</span>}
            lede="Uptime, mean time to resolve, alert volume and technician performance, cut by site, asset class and period. Planned for Milestone 4; the visuals below show the intended experience with illustrative figures."
          />
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <Window title="sitewatch · analytics · last 8 weeks" meta={<DemoTag />} bodyClassName="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-surface p-4">
              <Meta>Uptime · all sites</Meta>
              <p className="mt-1 text-xl font-semibold text-ink tabular">99.4%</p>
              <Sparkline values={UPTIME} stroke="var(--sw-healthy)" />
              <p className="font-mono text-2xs text-ink-3">Weekly · target 99.5%</p>
            </div>
            <div className="bg-surface p-4">
              <Meta>Mean time to resolve</Meta>
              <p className="mt-1 text-xl font-semibold text-ink tabular">2.2 h</p>
              <Sparkline values={MTTR.map((v) => -v)} stroke="var(--sw-accent)" />
              <p className="font-mono text-2xs text-ink-3">Weekly · trending down</p>
            </div>
            <div className="bg-surface p-4">
              <Meta>Alert volume</Meta>
              <p className="mt-1 text-xl font-semibold text-ink tabular">107</p>
              <div className="mt-2 flex h-12 items-end gap-1" role="img" aria-label="Illustrative weekly alert counts">
                {ALERTS.map((v, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-[2px] bg-atrisk/80 motion-ok:animate-bar-grow"
                    style={{ height: `${(v / 15) * 100}%`, "--bar-delay": `${i * 50}ms` } as CSSProperties}
                  />
                ))}
              </div>
              <p className="mt-1 font-mono text-2xs text-ink-3">12 weeks · by rule available</p>
            </div>
            <div className="bg-surface p-4">
              <Meta>Technician performance</Meta>
              <ul className="mt-2 space-y-2">
                {[
                  ["P. Nair", 92],
                  ["D. Reyes", 84],
                  ["J. Osei", 71],
                ].map(([n, pct], i) => (
                  <li key={n as string}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink">{n}</span>
                      <span className="font-mono text-2xs text-ink-3 tabular">{pct}% in SLA</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-sunken">
                      <div className="h-full rounded-sm bg-accent motion-ok:animate-bar-grow origin-left" style={{ width: `${pct}%`, "--bar-delay": `${i * 90}ms` } as CSSProperties} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Window>
        </Reveal>
      </div>
    </section>
  );
}
