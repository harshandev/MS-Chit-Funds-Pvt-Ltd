"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Info } from "lucide-react";
import { schemes } from "@/data/demo";
import { computeBreakdown } from "@/lib/chit";
import { formatINR } from "@/lib/money";
import { AnimatedNumber } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { useTr } from "@/i18n/LanguageProvider";
import { lakh } from "../constants";
import { cn } from "@/lib/cn";

const scheme = schemes[1]; // ₹3 lakh illustrative scheme
const presets = [5, 15, 25];
const R = 84;
const C = 2 * Math.PI * R;

const parts = [
  { key: "net", label: "Net chit to winner", color: "var(--emerald)" },
  { key: "commission", label: "Foreman commission", color: "var(--navy)" },
  { key: "dividend", label: "Dividend pool", color: "var(--gold)" },
] as const;

export function Playground() {
  const tr = useTr();
  const id = useId();
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(15);
  const bps = Math.round(pct * 100);
  const b = computeBreakdown(scheme.rules, bps);
  const gross = b.gross;
  const commissionShown = Math.min(b.commission, b.discount);
  const fr = { net: b.netChit / gross, commission: commissionShown / gross, dividend: b.distributable / gross };
  const values = { net: b.netChit, commission: b.commission, dividend: b.distributable };
  const lens = parts.map((p) => fr[p.key] * C);
  const arcs = parts.map((p, i) => ({ ...p, len: lens[i], offset: -lens.slice(0, i).reduce((x, y) => x + y, 0) }));
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 120, damping: 20 };
  const fill = (pct / 30) * 100;
  const belowCommission = b.discount < b.commission;

  return (
    <section id="playground" aria-labelledby="playground-title" className="relative scroll-mt-16 overflow-x-clip bg-ivory py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <Eyebrow>{tr("Try a chit month")}</Eyebrow>
          <h2 id="playground-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">{tr("Drag the discount.")} <em className="text-gold-antique">{tr("Watch the pot split.")}</em></h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{tr("In an auction, the winning ticket accepts a discount on the gross chit. See how that discount is shared between foreman commission and a dividend pool for everyone.")}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-3)]">
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            {/* controls */}
            <div className="p-6 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-antique">{tr(scheme.name)}</p>
              <p className="mt-1 text-sm text-muted">{tr("Gross chit")} <span className="font-semibold text-ink">{lakh(tr, gross)}</span> · {tr("{n} tickets", { n: scheme.rules.tickets })} · {tr("sample commission 5%")}</p>

              <div className="mt-8 flex items-end justify-between">
                <label htmlFor={id} className="text-sm font-semibold text-ink">{tr("Auction discount")}</label>
                <p className="font-serif text-6xl leading-none text-emerald tabular-nums"><AnimatedNumber value={pct} format={(n) => n.toFixed(1).replace(/\.0$/, "")} /><span className="text-3xl text-gold-antique">%</span></p>
              </div>
              <input
                id={id} type="range" min={0} max={30} step={0.5} value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                aria-valuetext={tr("{pct} percent discount", { pct })}
                className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-emerald [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgb(0_0_0/0.3)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                style={{ background: `linear-gradient(90deg, var(--gold) ${fill}%, var(--line) ${fill}%)` }}
              />
              <div className="mt-2 flex justify-between text-xs text-muted" aria-hidden><span>0%</span><span>10%</span><span>20%</span><span>30%</span></div>

              <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label={tr("Discount presets")}>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">{tr("Try")}</span>
                {presets.map((p) => (
                  <button key={p} type="button" onClick={() => setPct(p)} aria-pressed={pct === p}
                    className={cn("min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors", pct === p ? "border-emerald bg-emerald text-ivory" : "border-line bg-white text-ink hover:border-gold-antique")}>{p}%</button>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{tr("Dividend per ticket this month")}</p>
                <p className="mt-1 font-serif text-4xl text-emerald tabular-nums"><AnimatedNumber value={b.dividendPerTicket} format={(n) => formatINR(Math.round(n))} /></p>
                <p className="mt-1 text-sm text-muted">{tr("A non-winning ticket would pay about")} <span className="font-semibold text-ink tabular-nums"><AnimatedNumber value={b.payableNonWinner} format={(n) => formatINR(Math.round(n))} /></span> {tr("of the {amt} instalment.", { amt: formatINR(scheme.rules.instalment) })}</p>
              </div>
              {belowCommission && (
                <p role="status" className="mt-3 flex gap-2 text-sm text-warning"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{tr("At this discount nothing is left after the sample commission, so no dividend is distributed.")}</p>
              )}
            </div>

            {/* visual */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-900 p-6 text-ivory sm:p-9">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
                <div className="relative h-52 w-52 shrink-0">
                  <svg viewBox="0 0 200 200" role="img" aria-label={tr("Gross chit split: {net} net to winner, {com} commission, {div} dividend pool", { net: formatINR(b.netChit), com: formatINR(b.commission), div: formatINR(b.distributable) })} className="h-full w-full -rotate-90">
                    <circle cx="100" cy="100" r={R} fill="none" stroke="rgb(248 246 239 / 0.1)" strokeWidth="22" />
                    {arcs.map((a) => (
                      <motion.circle key={a.key} cx="100" cy="100" r={R} fill="none" strokeWidth="22" stroke={a.key === "net" ? "var(--emerald-700)" : a.color === "var(--navy)" ? "var(--gold-soft)" : a.color}
                        initial={false} animate={{ strokeDasharray: `${Math.max(0, a.len - 1.5)} ${C}`, strokeDashoffset: a.offset }} transition={spring} />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/60">{tr("Gross chit")}</span>
                    <span className="font-serif text-3xl tabular-nums">{lakh(tr, gross)}</span>
                  </div>
                </div>
                <ul className="w-full space-y-3">
                  {parts.map((p) => (
                    <li key={p.key} className="flex items-center justify-between gap-3 rounded-xl border border-ivory/10 bg-ivory/5 px-4 py-3">
                      <span className="flex items-center gap-2.5 text-sm">
                        <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: p.key === "net" ? "var(--emerald-700)" : p.key === "commission" ? "var(--gold-soft)" : "var(--gold)" }} />
                        {tr(p.label)}
                      </span>
                      <span className="font-bold tabular-nums"><AnimatedNumber value={values[p.key]} format={(n) => formatINR(Math.round(n))} /></span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mt-8" aria-hidden>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-ivory/10">
                  {arcs.map((a) => (
                    <motion.div key={a.key} initial={false} animate={{ width: `${Math.max(0, fr[a.key] * 100)}%` }} transition={spring}
                      className="h-full" style={{ background: a.key === "net" ? "var(--emerald-700)" : a.key === "commission" ? "var(--gold-soft)" : "var(--gold)" }} />
                  ))}
                </div>
                <p className="mt-2 text-xs text-ivory/60">{tr("Discount {amt} = commission + dividend pool", { amt: formatINR(b.discount) })}</p>
              </div>
              <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xs text-xs leading-relaxed text-ivory/65"><span className="font-bold text-gold-soft">{tr("Illustrative — not a quote or return.")}</span> {tr("Sample figures from a demo scheme; real auctions and terms follow the approved agreement.")}</p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/calculator" className={buttonClass("gold", "sm")}>{tr("Open calculator")} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                  <Link href="/transparency" className={buttonClass("glass", "sm")}>{tr("Transparency")}</Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
