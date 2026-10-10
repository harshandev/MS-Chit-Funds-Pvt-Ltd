"use client";
import { motion, useReducedMotion } from "motion/react";

/** Circle + checkmark that draws itself. */
export function AnimatedCheck({ size = 72, className }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const d = reduce ? 0 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden className={className}>
      <motion.circle cx="36" cy="36" r="32" stroke="var(--emerald)" strokeWidth="4" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 * d }} />
      <motion.circle cx="36" cy="36" r="28" fill="var(--emerald)" initial={{ scale: reduce ? 1 : 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.1 }} style={{ transformOrigin: "36px 36px" }} transition={{ delay: 0.3 * d, duration: 0.4 * d }} />
      <motion.path d="M23 37 L32 46 L50 27" stroke="var(--emerald)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45 * d, duration: 0.45 * d, ease: "easeOut" }} />
    </svg>
  );
}
