import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--sw-accent)" />
      <path d="M8 21 L12.5 12 L16 18.5 L19.5 9 L24 21" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="21" r="2.2" fill="#fff" />
    </svg>
  );
}

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact ? <span className="text-md font-semibold tracking-tight text-ink">SiteWatch</span> : null}
    </span>
  );
}
