import * as React from "react";
import { ListOrdered, Radar, UserCheck, Waves } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./primitives";

const ITEMS = [
  { icon: ListOrdered, title: "Incident prioritization", body: "Open incidents ranked by severity, SLA risk and asset criticality, so the queue reads top-down." },
  { icon: Radar, title: "Predictive maintenance signals", body: "Telemetry history cross-checked to flag assets likely to fail soon. Surfaced for review, never auto-scheduled." },
  { icon: UserCheck, title: "Assignment recommendations", body: "Best-fit technician suggested from location, current load and skill match. The manager confirms." },
  { icon: Waves, title: "Anomaly detection", body: "Patterns that static thresholds miss, caught against each asset's own baseline." },
];

export function AiSection() {
  return (
    <section className="border-y border-line bg-surface py-20 lg:py-28" aria-labelledby="ai-title">
      <div className="container-m">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <SectionHeading
              index="08"
              eyebrow="Assistance & automation"
              title={<span id="ai-title">From reacting to anticipating.</span>}
              lede="Once the operational record exists, the platform can help with judgement calls. Every recommendation is explainable and stays a recommendation until an operations manager acts on it."
            />
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {ITEMS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="m-reveal bg-canvas p-5 motion-ok:animate-rise" style={{ "--rise-delay": `${i * 100}ms` } as React.CSSProperties}>
                  <Icon className="size-4 text-accent" aria-hidden />
                  <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
