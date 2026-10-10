"use client";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";

/** Tiny animated trend line. Pass real values only; draws itself once when scrolled into view. */
export function Sparkline({ values, className, stroke = "var(--emerald)", label }: { values: number[]; className?: string; stroke?: string; label?: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  const W = 100, H = 32, P = 3;
  const pts = values.length >= 2 ? values : [values[0] ?? 0, values[0] ?? 0];
  const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  const xy = pts.map((v, i) => [P + (i / (pts.length - 1)) * (W - 2 * P), H - P - ((v - min) / span) * (H - 2 * P)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0].toFixed(2)} ${H} L${xy[0][0].toFixed(2)} ${H} Z`;
  const last = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={cn("h-8 w-full overflow-visible", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0.28 }} />
          <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#${id})`} initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 }} />
      <motion.path d={line} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeOut" }} />
      <motion.circle cx={last[0]} cy={last[1]} r="2" fill={stroke} initial={reduce ? false : { opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 1, type: "spring" }} />
    </svg>
  );
}
