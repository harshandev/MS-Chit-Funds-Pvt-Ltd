"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { showcaseScheme, ILLUSTRATIVE_DISCOUNT_BPS } from "../constants";
import { computeBreakdown } from "@/lib/chit";
import { formatINR, formatLakh } from "@/lib/money";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Eyebrow } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Receipt() {
  const reduce = useReducedMotion();
  const s = showcaseScheme;
  const b = computeBreakdown(s.rules, ILLUSTRATIVE_DISCOUNT_BPS);
  const lines = [
    { label: "Gross chit amount", note: "The full value of the chit", v: b.gross, share: 1, sign: "", tone: "bg-emerald" },
    { label: "Auction discount (15%)", note: "Offered by the winning bid", v: b.discount, share: b.discount / b.gross, sign: "−", tone: "bg-gold-antique" },
    { label: "Foreman commission (5%)", note: "Per the sample scheme rules", v: b.commission, share: b.commission / b.gross, sign: "−", tone: "bg-navy" },
    { label: "Net chit to winning ticket", note: "Gross minus discount", v: b.netChit, share: b.netChit / b.gross, sign: "=", tone: "bg-emerald-700", strong: true },
    { label: "Dividend pool", note: "Discount minus commission", v: b.distributable, share: b.distributable / b.gross, sign: "", tone: "bg-gold" },
    { label: `Dividend per ticket (${s.rules.tickets} tickets)`, note: "Pool shared equally", v: b.dividendPerTicket, share: b.dividendPerTicket / b.gross * s.rules.tickets, sign: "", tone: "bg-gold" },
    { label: "Contribution this month", note: "Instalment minus dividend", v: b.payableNonWinner, share: b.payableNonWinner / s.rules.instalment, sign: "", tone: "bg-emerald", strong: true },
  ];
  return (
    <section aria-labelledby="transparency-title" className="relative overflow-x-clip bg-gradient-to-b from-emerald-950 to-emerald-900 py-20 text-ivory sm:py-28">
      <div aria-hidden className="aurora pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-gold/15 blur-[110px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:items-center [&>*]:min-w-0">
        <Reveal className="lg:col-span-2">
          <Eyebrow className="text-gold">Transparency</Eyebrow>
          <h2 id="transparency-title" className="mt-2 font-serif text-4xl sm:text-5xl">Know where every number <em className="text-shimmer pr-[0.14em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">comes from.</em></h2>
          <p className="mt-4 text-base leading-relaxed text-ivory/75">Every figure in a chit has a source: the gross chit, the discount from the auction, the foreman commission, and the dividend shared back. We show the working, not just the result.</p>
          <div className="mt-8"><Magnetic><Link href="/transparency" className={buttonClass("gold", "lg")}>Explore Transparency <ArrowRight className="h-4 w-4" aria-hidden /></Link></Magnetic></div>
        </Reveal>

        <motion.div className="lg:col-span-3" initial={reduce ? "show" : "hide"} whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={{ hide: {}, show: { transition: { staggerChildren: 0.38 } } }}>
          <div className="relative mx-auto max-w-xl rotate-0 bg-ivory p-6 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] sm:p-9 sm:pb-12 lg:rotate-[1.2deg]" style={{ WebkitMaskImage: "linear-gradient(#000,#000), conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg)", WebkitMaskSize: "100% calc(100% - 9px), 18px 9px", WebkitMaskPosition: "top, bottom", WebkitMaskRepeat: "no-repeat, repeat-x", maskImage: "linear-gradient(#000,#000), conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg)", maskSize: "100% calc(100% - 9px), 18px 9px", maskPosition: "top, bottom", maskRepeat: "no-repeat, repeat-x" }}>
            <div className="flex items-start justify-between gap-3 border-b border-dashed border-ink/30 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-antique">Chit breakdown</p>
                <p className="mt-1 font-serif text-2xl text-emerald">{formatLakh(b.gross)} sample scheme</p>
              </div>
              <span className="rounded-full border border-gold-antique/50 bg-gold/15 px-2.5 py-0.5 text-xs font-semibold">Illustrative</span>
            </div>
            <ol className="mt-3 divide-y divide-dashed divide-ink/15">
              {lines.map((l) => (
                <motion.li key={l.label} variants={{ hide: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }} className="py-3.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="min-w-0"><p className={cn("text-sm", l.strong ? "font-bold text-emerald" : "font-semibold text-ink")}>{l.label}</p><p className="text-xs text-muted">{l.note}</p></div>
                    <p className={cn("shrink-0 tabular-nums", l.strong ? "text-xl font-extrabold text-emerald" : "text-base font-bold")}>{l.sign} <CountUp value={l.v} duration={1.2} format={(n) => formatINR(Math.round(n))} /></p>
                  </div>
                  <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <motion.div className={cn("h-full origin-left rounded-full", l.tone)} style={{ width: "100%" }} variants={{ hide: { scaleX: 0 }, show: { scaleX: Math.min(1, Math.max(0.02, l.share)), transition: { duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] } } }} />
                  </div>
                </motion.li>
              ))}
            </ol>
            <p className="mt-4 border-t border-dashed border-ink/30 pt-4 text-[11px] leading-relaxed text-muted">Illustrative demo figures from a sample scheme with a sample discount. Not a quote, offer or return. Real calculations follow the approved scheme agreement.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
