import * as React from "react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./primitives";

const STEPS = [
  { n: "01", title: "Connect", body: "Bring sites and asset data into one registry, then point telemetry feeds at the ingestion API." },
  { n: "02", title: "Detect", body: "Threshold and anomaly rules evaluate every reading and raise alerts with the asset attached." },
  { n: "03", title: "Respond", body: "Alerts become incidents. The right technician is assigned by location, skill and load." },
  { n: "04", title: "Resolve", body: "Progress, SLA status and field updates stay visible until the incident is closed." },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface py-20 lg:py-28" aria-labelledby="how-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading index="03" eyebrow="How it works" title={<span id="how-title">From reading to resolution, in one loop.</span>} />
        </Reveal>
        <Reveal as="div" className="mt-12">
        <ol className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-[11px] hidden h-px bg-line lg:block" />
          <div aria-hidden className="m-reveal absolute left-0 right-0 top-[11px] hidden h-px origin-left bg-accent/60 motion-ok:animate-grow-x lg:block" style={{ animationDuration: "1600ms" }} />
          {STEPS.map((s, i) => (
            <li key={s.n} className="m-reveal relative motion-ok:animate-rise" style={{ "--rise-delay": `${i * 220}ms` } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="relative z-10 flex size-6 items-center justify-center rounded-full border border-line-strong bg-surface font-mono text-2xs text-accent-text motion-ok:animate-marker-in m-reveal" style={{ "--marker-delay": `${i * 220 + 200}ms` } as React.CSSProperties}>
                  {s.n}
                </span>
                <span className="h-px flex-1 bg-line lg:hidden" aria-hidden />
              </div>
              <h3 className="mt-4 text-md font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        </Reveal>
      </div>
    </section>
  );
}
