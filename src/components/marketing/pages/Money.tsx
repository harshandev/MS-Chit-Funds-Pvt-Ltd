"use client";
import { AnimatedNumber } from "@/components/motion/CountUp";
import { formatINR, type Paise } from "@/lib/money";

/** Rupee amount (integer paise in) that tweens when the value changes. */
export function Money({ paise, prefix = "", className }: { paise: Paise; prefix?: string; className?: string }) {
  return <span className={className}>{prefix}<AnimatedNumber value={paise / 100} format={(n) => formatINR(Math.round(n * 100))} /></span>;
}
