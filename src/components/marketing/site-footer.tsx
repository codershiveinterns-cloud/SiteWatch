import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { StatusDot } from "@/components/ui/status-indicator";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "#platform" },
      { label: "Monitoring", href: "#capabilities" },
      { label: "Incidents", href: "#response" },
      { label: "Analytics", href: "#analytics" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "#security" },
      { label: "Architecture", href: "#security" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Get started", href: "/signup" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-m py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-2">
              Remote asset monitoring and field operations for teams running distributed sites.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") ? (
                      <a href={l.href} className="text-sm text-ink-2 hover:text-ink">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-ink-2 hover:text-ink">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SiteWatch</p>
          <p className="inline-flex items-center gap-2 font-mono">
            <StatusDot tone="healthy" /> Platform foundation · Milestone 1
          </p>
        </div>
      </div>
    </footer>
  );
}
