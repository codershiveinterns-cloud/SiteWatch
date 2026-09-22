import type { CSSProperties } from "react";

/** Server-rendered SVG sparkline; values are plotted in order. */
export function Sparkline({
  values,
  className,
  stroke = "var(--sw-accent)",
  height = 36,
}: {
  values: number[];
  className?: string;
  stroke?: string;
  height?: number;
}) {
  if (values.length < 2) return <div className={className} style={{ height }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${height - 3 - ((v - min) / span) * (height - 6)}`).join(" ");
  const last = values[values.length - 1];
  const lastY = height - 3 - ((last - min) / span) * (height - 6);
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className={className} style={{ height, width: "100%" } as CSSProperties} aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <circle cx="100" cy={lastY} r="2" fill={stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
