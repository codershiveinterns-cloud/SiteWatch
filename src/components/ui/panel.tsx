import * as React from "react";
import { cn } from "@/lib/utils";

/** Bordered surface. Deliberately compact: a container, not a "card". */
export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn("panel", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-start justify-between gap-3 border-b border-line px-4 py-3", className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink leading-5">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-ink-3">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function PanelBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-4 py-4", className)}>{children}</div>;
}

export function DescriptionList({ items, className }: { items: Array<{ label: string; value: React.ReactNode; mono?: boolean }>; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[minmax(5rem,max-content)_1fr] gap-x-5 gap-y-2.5", className)}>
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <dt className="pt-0.5 text-xs font-medium text-ink-3">{item.label}</dt>
          <dd className={cn("text-sm text-ink min-w-0 break-words", item.mono && "font-mono text-xs")}>{item.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
