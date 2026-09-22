import * as React from "react";
import { cn } from "@/lib/utils";
import { ROLE_META, type Role } from "@/lib/rbac/roles";

export type BadgeTone = "neutral" | "accent" | "healthy" | "atrisk" | "critical" | "info" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-neutral-soft text-ink-2",
  accent: "bg-accent-soft text-accent-text",
  healthy: "bg-healthy-soft text-healthy-text",
  atrisk: "bg-atrisk-soft text-atrisk-text",
  critical: "bg-critical-soft text-critical-text",
  info: "bg-info-soft text-ink",
  outline: "border border-line-strong text-ink-2 bg-transparent",
};

export function Badge({
  tone = "neutral",
  className,
  mono,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-2xs font-semibold whitespace-nowrap",
        mono ? "font-mono" : "uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const roleTone: Record<Role, BadgeTone> = {
  ADMIN: "accent",
  OPERATIONS_MANAGER: "info",
  FIELD_TECHNICIAN: "healthy",
  VIEWER: "neutral",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge tone={roleTone[role]} className={className}>
      {ROLE_META[role].label}
    </Badge>
  );
}
