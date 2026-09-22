"use client";

import * as React from "react";
import { StatusDot, type StatusTone } from "@/components/ui/status-indicator";
import { Meta } from "./primitives";

type Alert = { id: number; tone: StatusTone; title: string; site: string; age: string };

const FEED: Omit<Alert, "id">[] = [
  { tone: "critical", title: "Inverter offline", site: "Warehouse C · INV-2", age: "2m" },
  { tone: "atrisk", title: "Charger temp above threshold", site: "EV hub 12 · CH-07", age: "11m" },
  { tone: "atrisk", title: "Battery SoC trending low", site: "Tower N-4 · BAT-1", age: "38m" },
  { tone: "atrisk", title: "String output −12% vs peers", site: "Solar array A · STR-14", age: "just now" },
  { tone: "healthy", title: "Generator test completed", site: "Site yard 3 · GEN-3", age: "just now" },
  { tone: "critical", title: "Rectifier fault", site: "Tower N-12 · RECT-1", age: "just now" },
  { tone: "healthy", title: "HVAC zone 2 back in range", site: "Warehouse C · HVAC-2", age: "just now" },
];

function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Rotating alert feed for the hero visual. A new event enters at the top
 * every few seconds and the oldest one leaves, so the console reads as
 * live without any real data behind it.
 */
export function LiveAlerts() {
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = React.useState<Alert[]>(() => FEED.slice(0, 3).map((a, i) => ({ ...a, id: i })));
  const next = React.useRef(3);

  React.useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      setItems((prev) => {
        const src = FEED[next.current % FEED.length];
        const id = next.current + 100;
        next.current += 1;
        return [{ ...src, id }, ...prev.slice(0, 2)];
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const active = items.filter((a) => a.tone !== "healthy").length;

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="text-xs font-semibold text-ink">Open alerts</span>
        <Meta>{active} active</Meta>
      </div>
      <ul className="divide-y divide-line" aria-live="off">
        {items.map((a, i) => (
          <li
            key={a.id}
            className={i === 0 && a.id >= 100 ? "flex items-start gap-2.5 px-3 py-2.5 motion-ok:animate-slide-down-in" : "flex items-start gap-2.5 px-3 py-2.5 motion-ok:animate-rise"}
            style={a.id < 100 ? ({ "--rise-delay": `${900 + i * 140}ms` } as React.CSSProperties) : undefined}
          >
            <StatusDot tone={a.tone} pulse={i === 0 && a.tone !== "healthy"} className="mt-1.5" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{a.title}</p>
              <p className="truncate font-mono text-2xs text-ink-3">{a.site}</p>
            </div>
            <span className="font-mono text-2xs text-ink-3 tabular">{a.age}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
