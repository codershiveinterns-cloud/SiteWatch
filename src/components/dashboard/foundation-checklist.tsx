import { Check } from "lucide-react";
import { MILESTONE_META } from "@/lib/modules";
import { cn } from "@/lib/utils";

const DELIVERED = [
  { title: "Multi-tenant schema", detail: "Organization, User, Membership and Session with tenant-scoped access" },
  { title: "Authentication", detail: "Email/password sign-up and sign-in, hashed passwords, server-side sessions" },
  { title: "Role-based access control", detail: "Admin, Operations Manager, Field Technician and Viewer, enforced server-side" },
  { title: "Application shell", detail: "Responsive console with navigation, account controls and settings foundation" },
  { title: "Staging deployment", detail: "Production build, health check and environment configuration" },
];

export function FoundationChecklist() {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <ol className="space-y-2.5">
        {DELIVERED.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-healthy-soft text-healthy-text">
              <Check className="size-3" strokeWidth={3} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="text-xs text-ink-3">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <ol className="relative space-y-3 border-l border-line pl-4">
        {([2, 3, 4, 5] as const).map((n, i) => (
          <li key={n} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-surface",
                i === 0 ? "bg-accent" : "bg-line-strong",
              )}
            />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xs text-ink-3">M{n}</span>
              <p className={cn("text-sm font-medium", i === 0 ? "text-ink" : "text-ink-2")}>{MILESTONE_META[n].title}</p>
            </div>
            <p className="text-xs text-ink-3">{MILESTONE_META[n].window}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
