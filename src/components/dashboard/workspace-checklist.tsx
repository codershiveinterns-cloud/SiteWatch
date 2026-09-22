import { Check } from "lucide-react";

const SERVICES = [
  { title: "Organization workspace", detail: "Isolated tenant with its own members, sessions and data" },
  { title: "Authentication", detail: "Email and password sign-in with server-side sessions" },
  { title: "Role-based access", detail: "Admin, Operations Manager, Field Technician and Viewer, enforced server-side" },
  { title: "Operations console", detail: "Responsive console with navigation, account controls and settings" },
  { title: "Health monitoring", detail: "Application and database checks reported on this dashboard" },
];

export function WorkspaceChecklist() {
  return (
    <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {SERVICES.map((item) => (
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
  );
}
