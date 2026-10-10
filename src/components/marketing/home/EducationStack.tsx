"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { learnTopics } from "./topics";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const details: Record<string, string[]> = {
  "how-chit-funds-work": ["A fixed group of people each contribute an instalment every month.", "Each month the pooled amount is given to one member, decided as set out in the scheme agreement.", "Over the full term, every ticket takes part in the same cycle."],
  "auction-discounts": ["In an auction, members may bid a discount on the gross chit amount.", "The winning ticket receives the gross chit less that discount.", "The discount is shared between foreman commission and a dividend pool, as the scheme terms define."],
  "after-winning": ["Winning receives the chit amount for that month; it does not end your participation.", "Instalments continue for the remaining months of the scheme.", "Dividend treatment for a prized ticket depends on the approved agreement."],
  "future-instalments": ["Instalments continue every month for the full term of the scheme.", "The amount you pay in a month can vary by the dividend shared that month.", "Missing an instalment can have consequences set out in your agreement."],
  "reading-agreement": ["Look for the instalment schedule, commission and maximum discount.", "Check how auctions, tie-breaks and defaults are handled.", "Ask questions about anything unclear before you sign."],
};

export function EducationStack() {
  const [open, setOpen] = useState<string>(learnTopics[0].id);
  return (
    <section aria-labelledby="learn-title" className="relative overflow-x-clip bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>Learn</Eyebrow>
          <h2 id="learn-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">Understand before <em className="text-gold-antique">you decide.</em></h2>
          <p className="mt-4 text-base leading-relaxed text-muted">Short, plain-language guides to the ideas behind a chit. Tap a card to open it, then read the full guide when you are ready.</p>
          <p className="mt-6 text-xs text-muted">General education only; your scheme agreement governs your participation.</p>
        </Reveal>
        <LayoutGroup>
          <ul className="space-y-3">
            {learnTopics.map((t, i) => {
              const isOpen = open === t.id;
              return (
                <motion.li layout key={t.id} transition={{ layout: { type: "spring", stiffness: 260, damping: 30 } }}
                  className={cn("overflow-hidden rounded-2xl border bg-ivory transition-[border-color,box-shadow,background-color] duration-300", isOpen ? "border-gold-antique bg-white shadow-[var(--shadow-3)]" : "border-line hover:border-gold-antique/60")}>
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={`learn-${t.id}`} onClick={() => setOpen(isOpen ? "" : t.id)} className="flex min-h-16 w-full items-center gap-4 p-4 text-left sm:p-5">
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300", isOpen ? "bg-emerald text-gold" : "bg-emerald-50 text-emerald")}><t.icon className="h-5 w-5" aria-hidden /></span>
                      <span className="flex-1"><span className="block text-xs font-bold text-gold-antique">{String(i + 1).padStart(2, "0")}</span><span className="block text-base font-bold text-emerald sm:text-lg">{t.title}</span></span>
                      <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted transition-transform duration-300", isOpen && "rotate-180")} aria-hidden />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`learn-${t.id}`} key="p" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="px-5 pb-5 sm:pl-[5.25rem]">
                          <p className="text-sm leading-relaxed text-muted">{t.text}</p>
                          <ul className="mt-3 space-y-2">
                            {details[t.id].map((d, k) => (
                              <motion.li key={d} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + k * 0.08 }} className="flex gap-2.5 text-sm text-ink"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{d}</motion.li>
                            ))}
                          </ul>
                          <Link href={`/how-it-works#${t.id}`} className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-emerald hover:text-emerald-700">Read the full guide <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </LayoutGroup>
      </div>
    </section>
  );
}
