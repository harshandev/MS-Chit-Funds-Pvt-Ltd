"use client";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";

/** Month-by-month ladder: before the win, the win month, and the instalments still to pay afterwards. */
export function InstalmentLadder({ n, winMonth, className }: { n: number; winMonth: number; className?: string }) {
  const reduce = useReducedMotion();
  const tr = useTr();
  const months = Array.from({ length: n }, (_, i) => i + 1);
  const remaining = Math.max(0, n - winMonth);
  return (
    <div className={className}>
      <ol className="grid grid-cols-5 gap-1.5 sm:grid-cols-10" aria-label={tr("Instalments 1 to {n}. Win in instalment {w}; {r} instalments remain.", { n, w: winMonth, r: remaining })}>
        {months.map((m) => {
          const state = m < winMonth ? "before" : m === winMonth ? "win" : "after";
          return (
            <motion.li
              key={m}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(m, 40) * 0.012, duration: 0.35 }}
              className={cn(
                "grid aspect-square place-items-center rounded-lg text-[11px] font-bold tabular-nums transition-colors duration-300",
                state === "before" && "bg-emerald/15 text-emerald",
                state === "win" && "bg-gold text-navy shadow-[0_0_0_4px] shadow-gold/25",
                state === "after" && "border border-dashed border-emerald/40 bg-white text-emerald",
              )}
              aria-label={tr("Instalment {m}: {s}", { m, s: tr(state === "before" ? "before the win" : state === "win" ? "winning month" : "still to pay") })}
            >
              {m}
            </motion.li>
          );
        })}
      </ol>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded bg-emerald/15" />{tr("Before the win")}</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded bg-gold" />{tr("Winning month")}</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded border border-dashed border-emerald/40" />{tr("Still to pay after winning ({n})", { n: remaining })}</li>
      </ul>
    </div>
  );
}
