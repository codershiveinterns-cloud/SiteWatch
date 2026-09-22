import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./reveal";
import { Meta, SectionHeading } from "./primitives";

function Card({ title, body, children, className, delay = 0 }: { title: string; body: string; children?: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal as="article" delay={delay} className={cn("card-lift flex flex-col rounded-lg border border-line bg-surface shadow-sm", className)}>
      <div className="px-5 pt-5">
        <h3 className="text-md font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
      </div>
      {children ? <div className="mt-auto px-5 pb-5 pt-5">{children}</div> : <div className="pb-5" />}
    </Reveal>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-20 py-20 lg:py-28" aria-labelledby="cap-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Core capabilities"
            title={<span id="cap-title">Everything between a sensor reading and a closed ticket.</span>}
            lede="SiteWatch is built as one connected system: the registry feeds monitoring, monitoring feeds incidents, incidents feed the field and the analytics."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card
            className="lg:col-span-3"
            title="Site & asset visibility"
            body="A centralized registry of sites and assets with category, GPS position, specifications and install dates. Status is derived from what the asset is actually reporting."
          >
            <div data-theme="dark" className="console-frame overflow-hidden rounded-lg bg-surface text-ink">
              <table className="w-full text-xs">
                <thead className="bg-surface-2 text-left">
                  <tr>
                    <th className="px-3 py-1.5 font-mono text-2xs font-medium uppercase tracking-wider text-ink-3">Asset</th>
                    <th className="px-3 py-1.5 font-mono text-2xs font-medium uppercase tracking-wider text-ink-3">Site</th>
                    <th className="px-3 py-1.5 font-mono text-2xs font-medium uppercase tracking-wider text-ink-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ["INV-2", "Warehouse C", "critical", "Critical"],
                    ["CH-07", "EV hub 12", "atrisk", "At risk"],
                    ["BAT-1", "Tower N-4", "atrisk", "At risk"],
                    ["PV-A1", "Solar array A", "healthy", "Healthy"],
                  ].map(([a, s, t, l]) => (
                    <tr key={a}>
                      <td className="px-3 py-1.5 font-mono text-ink">{a}</td>
                      <td className="px-3 py-1.5 text-ink-2">{s}</td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex items-center gap-1.5 text-ink-2">
                          <StatusDot tone={t as "critical" | "atrisk" | "healthy"} /> {l}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card
            className="lg:col-span-3"
            delay={80}
            title="Automated alerts"
            body="Telemetry arrives through API and webhook endpoints. Threshold and anomaly rules turn breaches into alerts with the asset already attached."
          >
            <div data-theme="dark" className="console-frame rounded-lg bg-surface bg-dots p-3 text-ink">
              <div className="flex items-center justify-between">
                <Meta>CH-07 · charger_temp_c</Meta>
                <Badge tone="atrisk">Threshold 65 °C</Badge>
              </div>
              <svg viewBox="0 0 300 70" className="mt-2 h-16 w-full" aria-hidden>
                <line x1="0" y1="26" x2="300" y2="26" stroke="var(--sw-atrisk)" strokeWidth="1" strokeDasharray="3 3" />
                <path
                  d="M0 55 L30 52 L60 54 L90 48 L120 50 L150 44 L180 40 L210 34 L240 30 L262 24 L280 18 L300 16"
                  fill="none"
                  stroke="var(--sw-accent)"
                  strokeWidth="1.5"
                  className="m-reveal motion-ok:animate-draw"
                  style={{ "--draw-length": 2000 } as CSSProperties}
                />
                <circle cx="262" cy="24" r="3" fill="var(--sw-atrisk)" className="m-reveal animate-pulse-ring motion-ok:animate-marker-in" style={{ color: "var(--sw-atrisk)", "--marker-delay": "1500ms" } as CSSProperties} />
              </svg>
              <p className="mt-1 font-mono text-2xs text-ink-3">Alert raised at 65.4 °C · rule: charger_temp &gt; 65 for 5 min</p>
            </div>
          </Card>

          <Card
            className="lg:col-span-2"
            title="Incident management"
            body="Alerts become incidents automatically, with priority, description and linked asset. Status moves from open to closed with nothing lost between."
          >
            <ol data-theme="dark" className="console-frame flex flex-wrap gap-1.5 rounded-lg bg-surface p-3 text-ink">
              {["Open", "Assigned", "In progress", "Resolved", "Closed"].map((s, i) => (
                <li
                  key={s}
                  className="m-reveal rounded-sm border border-line px-2 py-1 font-mono text-2xs text-ink-3 motion-ok:animate-glow-step"
                  style={{ "--step-delay": `${i * 1200}ms` } as CSSProperties}
                >
                  {s}
                </li>
              ))}
            </ol>
          </Card>

          <Card
            className="lg:col-span-2"
            delay={80}
            title="Field coordination"
            body="Assign technicians by location, skills and current workload, then follow their updates from the field."
          >
            <ul data-theme="dark" className="console-frame space-y-1.5 rounded-lg bg-surface p-2.5 text-ink">
              {[
                ["P. Nair", "4.2 km", "Inverters", "2 open"],
                ["D. Reyes", "11 km", "Chargers", "1 open"],
                ["J. Osei", "27 km", "Towers", "0 open"],
              ].map(([n, d, s, l], i) => (
                <li
                  key={n}
                  className={cn("m-reveal grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-sm border px-2.5 py-1.5 text-xs motion-ok:animate-rise", i === 0 ? "border-accent/40 bg-accent-soft/60" : "border-line")}
                  style={{ "--rise-delay": `${200 + i * 140}ms` } as CSSProperties}
                >
                  <span className="font-medium text-ink">{n}</span>
                  <span className="font-mono text-2xs text-ink-3">{d} · {s}</span>
                  <span className="font-mono text-2xs text-ink-3">{l}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            className="lg:col-span-2"
            delay={160}
            title="SLA tracking"
            body="Every incident carries a timer anchored to when it was created. Approaching breaches surface on the dashboard before they are missed."
          >
            <div data-theme="dark" className="console-frame space-y-2 rounded-lg bg-surface p-3 text-ink">
              {[
                ["INC-1042", "Critical", 72, "critical"],
                ["INC-1039", "High", 38, "atrisk"],
                ["INC-1035", "Medium", 12, "healthy"],
              ].map(([id, p, pct, tone]) => (
                <div key={id as string}>
                  <div className="flex items-center justify-between font-mono text-2xs text-ink-3">
                    <span>{id} · {p}</span>
                    <span>{pct}% elapsed</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-sunken">
                    <div
                      className={cn("m-reveal h-full rounded-sm motion-ok:animate-grow-x", tone === "critical" ? "bg-critical" : tone === "atrisk" ? "bg-atrisk" : "bg-healthy")}
                      style={{ width: `${pct}%`, "--bar-delay": "200ms" } as CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="md:col-span-2 lg:col-span-6"
            delay={200}
            title="Operational analytics"
            body="Uptime, mean time to resolve, alert volume trends and technician performance, by site, asset class and period."
          >
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Uptime", "by site and asset class"],
                ["MTTR", "from alert to resolved"],
                ["Alert volume", "trend and rule breakdown"],
                ["Technician load", "assignments and closure"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-line px-3 py-2.5">
                  <p className="text-sm font-medium text-ink">{k}</p>
                  <p className="text-xs text-ink-3">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
