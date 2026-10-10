"use client";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

/** Single-open accordion with smooth height animation. Keyboard operable (buttons + aria-expanded). */
export function Accordion({ items, defaultOpen }: { items: { q: string; a: React.ReactNode }[]; defaultOpen?: number }) {
  const base = useId();
  const [open, setOpen] = useState<string | null>(defaultOpen !== undefined && items[defaultOpen] ? items[defaultOpen].q : null);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line/80 bg-white shadow-[var(--shadow-1)]">
      {items.map((it, i) => {
        const isOpen = open === it.q;
        const pid = `${base}-p${i}`, bid = `${base}-b${i}`;
        return (
          <div key={it.q} className={isOpen ? "bg-emerald-50/40" : undefined}>
            <h3>
              <button
                id={bid}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => setOpen(isOpen ? null : it.q)}
                className="group flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left font-semibold text-ink transition-colors hover:text-emerald"
              >
                <span>{it.q}</span>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${isOpen ? "bg-gold text-navy" : "bg-ivory text-gold-antique group-hover:bg-gold/20"}`}>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="c"
                  id={pid}
                  role="region"
                  aria-labelledby={bid}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
