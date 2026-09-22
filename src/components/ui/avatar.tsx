import { cn, initials } from "@/lib/utils";

const sizes = { sm: "size-6 text-2xs", md: "size-8 text-xs", lg: "size-10 text-sm" } as const;

/** Deterministic hue from a name so avatars stay stable across renders. */
function hue(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function Avatar({ name, size = "md", className }: { name: string; size?: keyof typeof sizes; className?: string }) {
  const h = hue(name);
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none ring-1 ring-inset ring-black/5 dark:ring-white/10", sizes[size], className)}
      style={{ background: `hsl(${h} 45% 90%)`, color: `hsl(${h} 45% 28%)` }}
      data-avatar
    >
      {initials(name)}
    </span>
  );
}
