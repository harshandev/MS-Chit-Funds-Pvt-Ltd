"use client";
import { motion, useReducedMotion } from "motion/react";
import { useTr } from "@/i18n/LanguageProvider";

export interface Seg { label: string; value: number; color: string; text?: string }

/** Horizontal stacked bar whose segments glide when values change. Colours are CSS variables. */
export function SplitBar({ segs, className = "h-4" }: { segs: Seg[]; className?: string }) {
  const reduce = useReducedMotion();
  const tr = useTr();
  const total = segs.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
  return (
    <div className={`flex w-full gap-0.5 overflow-hidden rounded-full bg-line/60 ${className}`} role="presentation">
      {segs.map((s) => {
        const pct = (Math.max(0, s.value) / total) * 100;
        return (
          <motion.div
            key={s.label}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ background: s.color, minWidth: pct > 0 ? 3 : 0 }}
            title={tr(s.label)}
          />
        );
      })}
    </div>
  );
}

export function Legend({ segs, fmt, dark }: { segs: Seg[]; fmt: (v: number) => string; dark?: boolean }) {
  const tr = useTr();
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
      {segs.map((s) => (
        <li key={s.label} className="min-w-0">
          <p className={`flex items-center gap-2 text-xs ${dark ? "text-ivory/70" : "text-muted"}`}><span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded" style={{ background: s.color }} />{tr(s.label)}</p>
          <p className={`mt-0.5 pl-[18px] text-base font-bold tabular-nums ${dark ? "text-ivory" : "text-ink"}`}>{fmt(s.value)}</p>
        </li>
      ))}
    </ul>
  );
}
