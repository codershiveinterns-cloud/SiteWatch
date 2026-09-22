import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { StatusDot } from "@/components/ui/status-indicator";

const PILLARS = [
  { label: "Live asset registry", detail: "Every site and asset, one status language." },
  { label: "Alert → incident pipeline", detail: "Telemetry breaches become tracked work." },
  { label: "Field dispatch & SLAs", detail: "Assign by location, skill and load." },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Brand / context panel */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-sunken lg:flex lg:w-[46%] lg:max-w-[640px] lg:flex-col">
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="relative flex h-full flex-col px-12 py-10">
          <Link href="/login" className="w-fit rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <Wordmark />
          </Link>

          <div className="my-auto max-w-md">
            <p className="eyebrow mb-4">Remote asset monitoring</p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              One console for every remote site, asset and field response.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Solar farms, telecom towers, EV charging, warehouses and construction sites, monitored from a single
              tenant-isolated workspace.
            </p>

            <ul className="mt-8 space-y-3">
              {PILLARS.map((p, i) => (
                <li key={p.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border border-line bg-surface font-mono text-2xs text-ink-3">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{p.label}</p>
                    <p className="text-xs text-ink-3">{p.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 inline-flex items-center gap-4 rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink-2 shadow-sm">
              <span className="inline-flex items-center gap-1.5"><StatusDot tone="healthy" /> Healthy</span>
              <span className="inline-flex items-center gap-1.5"><StatusDot tone="atrisk" /> At risk</span>
              <span className="inline-flex items-center gap-1.5"><StatusDot tone="critical" /> Critical</span>
            </div>
          </div>

          <p className="font-mono text-2xs text-ink-3">Encrypted in transit · Per-tenant data isolation · Role-enforced access</p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center px-5 lg:hidden">
          <Link href="/login" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <Wordmark />
          </Link>
        </div>
        <div className="flex flex-1 items-start justify-center px-5 pb-10 pt-4 sm:items-center sm:px-8 sm:pt-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
