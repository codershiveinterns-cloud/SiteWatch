import { cn } from "@/lib/utils";

export type StatusTone = "healthy" | "atrisk" | "critical" | "neutral" | "info" | "pending";

const dot: Record<StatusTone, string> = {
  healthy: "bg-healthy text-healthy",
  atrisk: "bg-atrisk text-atrisk",
  critical: "bg-critical text-critical",
  info: "bg-info text-info",
  neutral: "bg-neutral text-neutral",
  pending: "bg-transparent border border-dashed border-ink-3 text-ink-3",
};

const text: Record<StatusTone, string> = {
  healthy: "text-healthy-text",
  atrisk: "text-atrisk-text",
  critical: "text-critical-text",
  info: "text-ink",
  neutral: "text-ink-2",
  pending: "text-ink-3",
};

export function StatusDot({ tone, pulse, className }: { tone: StatusTone; pulse?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", dot[tone], pulse && "animate-pulse-ring", className)}
    />
  );
}

export function StatusIndicator({
  tone,
  label,
  pulse,
  className,
  size = "sm",
}: {
  tone: StatusTone;
  label: string;
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-medium", size === "sm" ? "text-xs" : "text-sm", text[tone], className)}>
      <StatusDot tone={tone} pulse={pulse} />
      {label}
    </span>
  );
}
