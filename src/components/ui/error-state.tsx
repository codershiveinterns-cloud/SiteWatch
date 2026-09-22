import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  reference,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  reference?: string;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-md border border-critical/30 bg-critical-soft/60 px-6 py-10 text-center", className)}>
      <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-surface text-critical shadow-sm">
        <AlertTriangle className="size-4" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-2">{description}</p> : null}
      {reference ? <p className="mt-2 font-mono text-2xs text-ink-3">ref {reference}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
