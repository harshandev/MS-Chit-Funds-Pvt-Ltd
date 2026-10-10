"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Circular progress that springs to its value when scrolled into view. `value` is 0-100. */
export function ProgressRing({ value, size = 64, stroke = 6, children, label, className, color = "var(--emerald)", track = "var(--line)" }: {
  value: number; size?: number; stroke?: number; children?: ReactNode; label?: string; className?: string; color?: string; track?: string;
}) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value)) / 100;
  const r = (size - stroke) / 2;
  const c = size / 2;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          initial={reduce ? { pathLength: v } : { pathLength: 0 }}
          whileInView={{ pathLength: v }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 55, damping: 16, delay: 0.15 }}
        />
      </svg>
      {children !== undefined && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
