"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Skeleton block with a travelling highlight (transform-only; static under reduced motion). */
export function ShimmerBlock({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className={cn("relative overflow-hidden rounded-xl bg-line/60", className)}>
      {!reduce && (
        <motion.div
          className="absolute inset-y-0 -left-full w-full bg-linear-to-r from-transparent via-white/70 to-transparent"
          animate={{ x: ["0%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

/** Self-drawing checkmark in a ring. Uses currentColor. */
export function AnimatedCheck({ size = 40, className, delay = 0 }: { size?: number; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const from = reduce ? false : { pathLength: 0, opacity: 0 };
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} className={className} aria-hidden>
      <motion.circle cx="26" cy="26" r="23" fill="none" stroke="currentColor" strokeWidth="3" initial={from} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.55, delay, ease: "easeOut" }} />
      <motion.path d="M15 27.5 l8 8 l15 -17" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={from} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4, delay: delay + 0.4, ease: "easeOut" }} />
    </svg>
  );
}

/** Inline success confirmation with an animated checkmark. */
export function SuccessNote({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn("flex items-start gap-3 rounded-xl border border-success/25 bg-success/10 p-3.5 text-sm text-success", className)}
    >
      <AnimatedCheck size={28} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 text-ink">{children}</div>
    </motion.div>
  );
}

/** Small pulsing status dot. */
export function PulseDot({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span aria-hidden className={cn("relative inline-flex h-2 w-2", className)}>
      {!reduce && <motion.span className="absolute inset-0 rounded-full bg-current" animate={{ scale: [1, 2.4], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
    </span>
  );
}
