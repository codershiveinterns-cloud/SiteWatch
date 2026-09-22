import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("mb-3 flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-3", align === "center" && "justify-center")}>
        {index ? <span className="text-accent-text">{index}</span> : null}
        {index ? <span aria-hidden className="h-px w-4 bg-line-strong" /> : null}
        {eyebrow}
      </p>
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-ink sm:text-[1.85rem] sm:leading-[2.3rem] lg:text-[2.15rem] lg:leading-[2.65rem]">{title}</h2>
      {lede ? <p className="mt-4 text-pretty text-md leading-relaxed text-ink-2">{lede}</p> : null}
    </div>
  );
}

/** Small monospace metadata label used across product visuals. */
export function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-2xs uppercase tracking-wider text-ink-3", className)}>{children}</span>;
}

/** Labels a product visual as coming from the demo workspace. */
export function DemoTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-line bg-surface/80 px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider text-ink-3", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-atrisk" />
      Demo workspace
    </span>
  );
}

/** Product-window chrome so every visualization reads as the same app. */
export function Window({
  title,
  children,
  className,
  bodyClassName,
  meta,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-surface shadow-md", className)}>
      <div className="flex h-9 min-w-0 items-center gap-2 border-b border-line bg-surface-2 px-3">
        <span aria-hidden className="flex gap-1">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </span>
        <span className="ml-1 min-w-0 flex-1 truncate font-mono text-2xs text-ink-3">{title}</span>
        {meta ? <span className="ml-auto flex shrink-0 items-center gap-2">{meta}</span> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
