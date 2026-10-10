"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { MessageCircleQuestion, Search, X } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { AnimatedNumber } from "@/components/motion/CountUp";
import { cn } from "@/lib/cn";
import { generalFaqs } from "../faqs";
import { useTr } from "@/i18n/LanguageProvider";
import { RichT } from "./RichT";

const cats = ["All", ...Array.from(new Set(generalFaqs.map((f) => f.cat ?? "Other")))];

export function FaqExplorer() {
  const tr = useTr();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return generalFaqs.filter((f) => (cat === "All" || (f.cat ?? "Other") === cat) && (!t || `${f.q} ${f.a} ${tr(f.q)} ${tr(f.a)}`.toLowerCase().includes(t)));
  }, [q, cat, tr]);
  return (
    <div>
      <div role="search" aria-label={tr("Search the FAQ")}>
        <label className="relative block">
          <span className="sr-only">{tr("Search questions")}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search questions, e.g. dividend, auction, KYC")} className="min-h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-12 text-base shadow-[var(--shadow-2)] transition focus:border-emerald focus:outline-none focus:ring-4 focus:ring-emerald/10" />
          <AnimatePresence>
            {q && <motion.button type="button" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} onClick={() => setQ("")} aria-label={tr("Clear search")} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ivory hover:text-ink"><X className="h-4 w-4" /></motion.button>}
          </AnimatePresence>
        </label>
        <LayoutGroup>
          <fieldset className="mt-4">
            <legend className="sr-only">{tr("Filter by category")}</legend>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => {
                const on = cat === c;
                return (
                  <label key={c} className={cn("relative inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-within:ring-4 focus-within:ring-gold/40", on ? "text-ivory ring-emerald" : "bg-white text-ink ring-line hover:text-emerald hover:ring-gold-antique")}>
                    <input type="radio" name="faq-cat" value={c} checked={on} onChange={() => setCat(c)} className="sr-only" />
                    {on && <motion.span layoutId="faq-chip" aria-hidden className="absolute inset-0 rounded-full bg-emerald" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className="relative">{tr(c)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </LayoutGroup>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-muted"><span className="font-serif text-2xl italic text-emerald"><AnimatedNumber value={list.length} /></span> {tr("of {n} questions", { n: generalFaqs.length })}</p>

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          {list.length > 0 ? (
            <motion.div key={`${cat}|${q.trim().toLowerCase()}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <Accordion items={list.map((f) => ({ q: tr(f.q), a: tr(f.a) }))} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center rounded-3xl border border-dashed border-gold-antique/50 bg-white px-6 py-14 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/15 ring-8 ring-gold/5"><MessageCircleQuestion className="h-8 w-8 text-gold-antique" /></span>
              <h2 className="mt-4 font-serif text-2xl text-emerald"><RichT text="No answer found <i>yet</i>" accent="italic text-gold-antique" /></h2>
              <p className="mt-2 max-w-sm text-sm text-muted">{tr("Try fewer words or another category — or send us your question.")}</p>
              <Link href="/contact" className="mt-4 font-semibold text-emerald underline">{tr("Contact us")}</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-8 text-sm text-muted"><RichT text="Still have a question? {link}." parts={{ link: <Link href="/contact" className="font-semibold text-emerald underline">{tr("Contact us")}</Link> }} /></p>
    </div>
  );
}
