import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { Reveal } from "./reveal";
import { DemoTag, SectionHeading } from "./primitives";

const STEPS: Array<{ label: string; time: string; tone: StatusTone; detail: string; meta: string }> = [
  { label: "Alert detected", time: "09:14:02", tone: "critical", detail: "INV-2 stopped reporting output; rule inverter_offline matched.", meta: "Telemetry · Warehouse C" },
  { label: "Incident created", time: "09:14:03", tone: "critical", detail: "INC-1042 opened automatically with priority Critical and the asset linked.", meta: "SLA timer started · 2h" },
  { label: "Technician assigned", time: "09:21", tone: "info", detail: "P. Nair selected: 4.2 km away, inverter skills, two open jobs.", meta: "Assigned by Ops Manager" },
  { label: "Field update", time: "10:05", tone: "atrisk", detail: "On site. DC disconnect tripped; resetting and checking string fuses.", meta: "From mobile · photo attached" },
  { label: "Resolved", time: "10:26", tone: "healthy", detail: "Output restored at 96 kW. Incident closed inside SLA.", meta: "1h 12m to resolve" },
];

export function IncidentTimeline() {
  return (
    <section id="response" className="scroll-mt-20 border-b border-line bg-surface py-20 lg:py-28" aria-labelledby="resp-title">
      <div className="container-m">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <SectionHeading
              index="06"
              eyebrow="Incident response"
              title={<span id="resp-title">Alert to resolution, with nothing falling through.</span>}
              lede="Each stage is a recorded state change, not a message in a chat thread. Managers see where every incident stands; technicians see only what is theirs."
            />
            <div className="mt-6">
              <DemoTag />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ol className="relative border-l border-line-strong/60 pl-6 sm:pl-8">
              <span aria-hidden className="m-reveal absolute -left-px top-0 bottom-0 w-px bg-accent/50 motion-ok:animate-line-grow" style={{ animationDuration: "2200ms" }} />
              {STEPS.map((s, i) => (
                <li key={s.label} className={cn("m-reveal relative pb-8 last:pb-0 motion-ok:animate-rise")} style={{ "--rise-delay": `${i * 320}ms` } as React.CSSProperties}>
                  <span className="m-reveal absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-surface ring-1 ring-line-strong motion-ok:animate-marker-in sm:-left-[39px]" style={{ "--marker-delay": `${i * 320 + 150}ms` } as React.CSSProperties}>
                    <StatusDot tone={s.tone} pulse={i === 0} />
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold text-ink">{s.label}</h3>
                    <span className="font-mono text-2xs text-ink-3 tabular">{s.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{s.detail}</p>
                  <p className="mt-1 font-mono text-2xs uppercase tracking-wider text-ink-3">{s.meta}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
