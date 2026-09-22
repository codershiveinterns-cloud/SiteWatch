import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputBase, inputClass } from "./input";

/**
 * GET-based filter form: every control is a named input and submitting the
 * form updates the URL, so filters are shareable and server-rendered.
 */
export function FilterBar({ action, children, className }: { action: string; children: React.ReactNode; className?: string }) {
  return (
    <form action={action} method="get" className={cn("flex flex-wrap items-center gap-2", className)} role="search">
      {children}
    </form>
  );
}

export function SearchInput({ name = "q", defaultValue, placeholder }: { name?: string; defaultValue?: string; placeholder: string }) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(inputClass, "pl-8")}
      />
    </div>
  );
}

export function FilterSelect({ name, defaultValue, label, options }: { name: string; defaultValue?: string; label: string; options: Array<{ value: string; label: string }> }) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} aria-label={label} className={cn(inputBase, "w-auto min-w-36 max-w-full pr-8")}>
      <option value="">{label}: all</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
