import * as React from "react";
import { Reveal } from "./reveal";
import { Meta, SectionHeading } from "./primitives";
import { RoleBadge } from "@/components/ui/badge";
import { ROLE_ORDER } from "@/lib/rbac/roles";

const POINTS = [
  { title: "Tenant isolation", body: "Each organization is a separate tenant. Every record belongs to an organization and every query is scoped to the one the session belongs to." },
  { title: "Role-based access", body: "Admin, Operations Manager, Field Technician and Viewer. Permissions are enforced on the server, not hidden in the interface." },
  { title: "Encryption", body: "Data is encrypted in transit and at rest. Passwords are hashed; sessions are opaque tokens held server-side." },
  { title: "Auditability", body: "Asset, incident and assignment changes are designed to be logged with who, what and when." },
  { title: "Built to scale", body: "One pilot deployment or many client organizations on the same platform, without redesign." },
];

export function Security() {
  return (
    <section id="security" className="scroll-mt-20 py-20 lg:py-28" aria-labelledby="sec-title">
      <div className="container-m">
        <Reveal>
          <SectionHeading
            index="09"
            eyebrow="Security & architecture"
            title={<span id="sec-title">Built for environments where access and data boundaries matter.</span>}
            lede="Operations data is shared with clients, contractors and field staff. The platform is structured so each of them sees exactly what they should."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Reveal>
            <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {POINTS.map((p, i) => (
                <div key={p.title} className="m-reveal bg-surface p-5 motion-ok:animate-rise" style={{ "--rise-delay": `${i * 80}ms` } as React.CSSProperties}>
                  <dt className="text-sm font-semibold text-ink">{p.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-2">{p.body}</dd>
                </div>
              ))}
              <div className="bg-surface-2 p-5">
                <dt className="text-sm font-semibold text-ink">No claims we can&rsquo;t back</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-2">Formal certifications are not claimed until they are obtained. What is listed here is what the architecture does.</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <Meta>Tenancy model</Meta>
              <div className="mt-3 space-y-2">
                {["Organization A", "Organization B"].map((org, i) => (
                  <div key={org} className="rounded-md border border-line bg-canvas p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">{org}</span>
                      <span className="font-mono text-2xs text-ink-3">tenant {i + 1}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {["Sites", "Assets", "Incidents"].map((k) => (
                        <span key={k} className="rounded-sm border border-line bg-surface px-2 py-1 text-center font-mono text-2xs text-ink-2">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <Meta>Roles</Meta>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ROLE_ORDER.map((r) => (
                    <RoleBadge key={r} role={r} />
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-3">
                  A user belongs to an organization through a membership that carries their role. No cross-tenant reads are possible by URL or id.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
