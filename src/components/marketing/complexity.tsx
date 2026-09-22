import * as React from "react";
import { FileSpreadsheet, Mail, MonitorDot, Phone, Route, Users } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { Reveal } from "./reveal";
import { SectionHeading } from "./primitives";

const SOURCES = [
  { icon: FileSpreadsheet, label: "Spreadsheets", detail: "Asset lists that drift out of date" },
  { icon: MonitorDot, label: "Monitoring tools", detail: "One console per vendor" },
  { icon: Phone, label: "Phone calls", detail: "Status lives in someone's head" },
  { icon: Mail, label: "Email threads", detail: "Alerts buried in inboxes" },
  { icon: Users, label: "Field teams", detail: "No shared view of who is where" },
  { icon: Route, label: "Site visits", detail: "Driving out to find out" },
];

export function Complexity() {
  return (
    <section id="platform" className="scroll-mt-20 border-t border-line bg-surface py-20 lg:py-28" aria-labelledby="complexity-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="The problem"
            title={<span id="complexity-title">One operational view. Fewer blind spots.</span>}
            lede="Distributed operations fall apart when the truth is spread across six places. Every extra system is another place a failing asset can hide until it becomes downtime."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
          {/* Fragmented sources */}
          <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {SOURCES.map(({ icon: Icon, label, detail }, i) => (
              <div
                key={label}
                className="m-reveal rounded-md border border-dashed border-line-strong/70 bg-canvas px-3 py-3 motion-ok:animate-rise"
                style={{ "--rise-delay": `${i * 70}ms` } as React.CSSProperties}
              >
                <Icon className="size-4 text-ink-3" aria-hidden />
                <p className="mt-2 text-sm font-medium text-ink">{label}</p>
                <p className="mt-0.5 text-xs text-ink-3">{detail}</p>
              </div>
            ))}
          </Reveal>

          {/* Convergence */}
          <Reveal delay={120} className="flex items-center justify-center lg:flex-col">
            <svg viewBox="0 0 120 60" className="h-10 w-28 rotate-90 text-line-strong lg:h-16 lg:w-32 lg:rotate-0" aria-hidden>
              {[8, 20, 32, 44, 52].map((y, i) => (
                <path key={i} d={`M0 ${y} C 50 ${y}, 60 30, 118 30`} fill="none" stroke="currentColor" strokeWidth="1" className="m-reveal motion-ok:animate-flow" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
              <circle cx="118" cy="30" r="2.5" fill="var(--sw-accent)" className="m-reveal animate-pulse-ring" style={{ color: "var(--sw-accent)" }} />
            </svg>
          </Reveal>

          {/* SiteWatch as the operational layer */}
          <Reveal delay={200}>
            <div data-theme="dark" className="console-frame rounded-xl bg-surface text-ink">
              <div className="rounded-xl">
                <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                  <LogoMark className="size-5" />
                  <span className="text-sm font-semibold text-ink">SiteWatch</span>
                  <span className="ml-auto font-mono text-2xs uppercase tracking-wider text-ink-3">Operational layer</span>
                </div>
                <ul className="divide-y divide-line">
                  {[
                    ["Registry", "Every site and asset, with location, category and status"],
                    ["Signals", "Telemetry and alerts evaluated in one place"],
                    ["Work", "Incidents, assignments and SLA timers"],
                    ["Field", "Technicians update from where they stand"],
                  ].map(([k, v], i) => (
                    <li
                      key={k}
                      className="m-reveal grid grid-cols-[5.5rem_1fr] gap-3 px-4 py-2.5 motion-ok:animate-rise"
                      style={{ "--rise-delay": `${300 + i * 110}ms` } as React.CSSProperties}
                    >
                      <span className="font-mono text-2xs uppercase tracking-wider text-accent-text">{k}</span>
                      <span className="text-sm text-ink-2">{v}</span>
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
