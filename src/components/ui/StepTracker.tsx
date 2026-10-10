"use client";
import { motion, useReducedMotion } from "motion/react";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export type StepState = "done" | "current" | "blocked" | "todo" | "skipped";
export interface Step { label: string; short?: string; state: StepState; note?: string; tag?: string }

const stateText: Record<StepState, string> = { done: "completed", current: "in progress", blocked: "blocked", todo: "not started", skipped: "not applicable" };
const nodeCls: Record<StepState, string> = {
  done: "border-emerald bg-emerald text-ivory",
  current: "border-gold-antique bg-white text-gold-antique",
  blocked: "border-danger bg-danger text-white",
  todo: "border-line bg-white text-muted",
  skipped: "border-line bg-ivory text-muted",
};

/** Animated horizontal step track used for approval workflows and auction lifecycles. */
export function StepTracker({ steps, label, compact, className, tone = "emerald" }: { steps: Step[]; label: string; compact?: boolean; className?: string; tone?: "emerald" | "navy" }) {
  const reduce = useReducedMotion();
  const done = tone === "navy" ? "border-navy bg-navy text-ivory" : nodeCls.done;
  const fill = tone === "navy" ? "bg-navy" : "bg-emerald";
  const size = compact ? "h-6 w-6" : "h-8 w-8";
  return (
    <ol aria-label={label} className={cn("flex w-full items-start", className)}>
      {steps.map((s, i) => {
        const next = steps[i + 1];
        const filled = s.state === "done" && next && next.state !== "todo" && next.state !== "skipped";
        return (
          <li key={s.label + i} aria-current={s.state === "current" ? "step" : undefined} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {next && (
              <span aria-hidden className={cn("absolute left-1/2 w-full -translate-y-1/2 overflow-hidden rounded-full bg-line", compact ? "top-3 h-0.5" : "top-4 h-[3px]")}>
                <motion.span className={cn("block h-full origin-left", next.state === "blocked" ? "bg-danger" : fill)} initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: filled ? 1 : 0 }} transition={{ duration: 0.55, delay: 0.12 + i * 0.18, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%" }} />
              </span>
            )}
            <motion.span
              aria-hidden
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: i * 0.1 }}
              className={cn("relative z-10 flex items-center justify-center rounded-full border-2 text-[11px] font-bold", size, s.state === "done" ? done : nodeCls[s.state])}
            >
              {s.state === "current" && !reduce && <motion.span className="absolute inset-[-5px] rounded-full border-2 border-gold-antique" animate={{ scale: [1, 1.25], opacity: [0.55, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }} />}
              {s.state === "done" ? <Check className={compact ? "h-3 w-3" : "h-4 w-4"} strokeWidth={3} /> : s.state === "blocked" ? <X className={compact ? "h-3 w-3" : "h-4 w-4"} strokeWidth={3} /> : s.state === "skipped" ? <Minus className="h-3 w-3" /> : s.state === "current" ? <span className="h-2 w-2 rounded-full bg-current" /> : i + 1}
            </motion.span>
            <span className="sr-only">{s.label}: {stateText[s.state]}{s.tag ? ` (${s.tag})` : ""}{s.note ? `. ${s.note}` : ""}</span>
            <span aria-hidden className={cn("mt-1.5 max-w-full px-0.5 font-semibold leading-tight", compact ? "text-[10px]" : "text-[11px] sm:text-xs", s.state === "todo" || s.state === "skipped" ? "text-muted" : s.state === "blocked" ? "text-danger" : "text-ink")}>
              <span className={s.short ? "sm:hidden" : "hidden"}>{s.short}</span>
              <span className={s.short ? "hidden sm:inline" : ""}>{s.label}</span>
            </span>
            {s.tag && <span aria-hidden className="mt-1 rounded bg-gold/20 px-1 text-[9px] font-extrabold uppercase tracking-wide text-gold-antique">{s.tag}</span>}
            {!compact && s.note && <span aria-hidden className="mt-0.5 hidden max-w-[9rem] text-[11px] leading-snug text-muted sm:block">{s.note}</span>}
          </li>
        );
      })}
    </ol>
  );
}
