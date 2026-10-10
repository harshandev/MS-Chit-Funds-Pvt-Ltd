"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Coins, Gavel, Gift, HandCoins, Pause, Play, Repeat, Users } from "lucide-react";
import { computeBreakdown } from "@/lib/chit";
import { formatINR } from "@/lib/money";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "../constants";
import { useTr } from "@/i18n/LanguageProvider";

const icons = [Users, Coins, Gavel, HandCoins, Gift, Repeat];

/** Animated six-stage month cycle with play / pause / prev / next. All figures use the illustrative sample scheme. */
export function ChitCycle() {
  const tr = useTr();
  const r = showcaseScheme.rules;
  const b = useMemo(() => computeBreakdown(r, ILLUSTRATIVE_DISCOUNT_BPS), [r]);
  const stages = useMemo(() => [
    { t: tr("Members contribute"), s: tr("Every ticket pays its monthly instalment."), d: tr("In the sample, {n} tickets each pay {amt}.", { n: r.tickets, amt: formatINR(r.instalment) }) },
    { t: tr("The monthly pot forms"), s: tr("All instalments together make the gross chit."), d: tr("{n} × {inst} = {gross} gross chit for the month.", { n: r.tickets, inst: formatINR(r.instalment), gross: formatINR(b.gross) }) },
    { t: tr("The auction"), s: tr("Eligible members offer how much of the pot they would give up."), d: tr("A sample {pct}% discount is {amt}. Real rules come from the approved agreement.", { pct: ILLUSTRATIVE_DISCOUNT_BPS / 100, amt: formatINR(b.discount) }) },
    { t: tr("The winner receives the net chit"), s: tr("Gross chit minus the winning discount, subject to payout conditions."), d: tr("{gross} − {disc} = {net} net chit (sample).", { gross: formatINR(b.gross), disc: formatINR(b.discount), net: formatINR(b.netChit) }) },
    { t: tr("The dividend is shared"), s: tr("Discount minus the foreman commission goes back to members."), d: tr("{disc} − {comm} = {pool}, about {per} per ticket (sample).", { disc: formatINR(b.discount), comm: formatINR(b.commission), pool: formatINR(b.distributable), per: formatINR(b.dividendPerTicket) }) },
    { t: tr("The next month begins"), s: tr("The winner keeps paying; the cycle repeats until every ticket has had its turn."), d: tr("In the sample the scheme runs for {n} monthly instalments.", { n: r.instalments }) },
  ], [r, b, tr]);
  const N = stages.length;

  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const playing = inView && !paused && !hold && !reduce;
  const step = ((tick % N) + N) % N;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 3400);
    return () => clearInterval(id);
  }, [playing]);

  const go = (to: number) => setTick((t) => t + ((to - (((t % N) + N) % N) + N) % N));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setTick((t) => t + 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setTick((t) => t - 1); }
    else if (e.key === " " && e.target === e.currentTarget) { e.preventDefault(); setPaused((p) => !p); }
  };

  const pos = (i: number) => { const a = ((-90 + i * (360 / N)) * Math.PI) / 180; return { x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a) }; };

  return (
    <div
      ref={wrap}
      role="group"
      aria-roledescription="carousel"
      aria-label={tr("The monthly chit cycle. Use arrow keys to step, space to pause.")}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      className="grid gap-8 rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-900 p-5 text-ivory shadow-[var(--shadow-3)] outline-none focus-visible:ring-4 focus-visible:ring-gold/50 sm:p-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-center"
    >
      <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.6" strokeDasharray="1.2 1.6" />
          <motion.circle cx="50" cy="50" r="38" fill="none" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" transform="rotate(-90 50 50)" initial={false} animate={{ pathLength: (step + 1) / N }} transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }} />
          <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.4" />
          <motion.g initial={false} animate={{ rotate: tick * (360 / N) }} transition={{ type: "spring", stiffness: 70, damping: 16 }} style={{ transformOrigin: "50px 50px" }}>
            <circle cx="50" cy="12" r="2.2" fill="var(--gold-soft)" />
            <circle cx="50" cy="12" r="4.4" fill="var(--gold)" fillOpacity="0.25" />
          </motion.g>
        </svg>
        {stages.map((s, i) => {
          const Icon = icons[i];
          const on = i === step;
          const p = pos(i);
          return (
            <button
              key={s.t}
              type="button"
              onClick={() => go(i)}
              aria-label={tr("Stage {n} of {total}: {title}", { n: i + 1, total: N, title: s.t })}
              aria-current={on ? "step" : undefined}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className="absolute grid h-[17%] w-[17%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
            >
              <motion.span
                animate={{ scale: on ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={`grid h-full w-full place-items-center rounded-full border transition-colors duration-300 ${on ? "border-gold bg-gold text-navy shadow-[0_0_0_6px] shadow-gold/20" : i < step ? "border-gold/50 bg-emerald-700/70 text-gold-soft" : "border-ivory/20 bg-emerald-900 text-ivory/70 hover:border-gold/60"}`}
              >
                <Icon className="h-[46%] w-[46%]" aria-hidden />
              </motion.span>
            </button>
          );
        })}
        <div className="absolute inset-[27%] grid place-items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.25 }}>
              <p className="font-serif text-5xl italic text-gold sm:text-6xl">{step + 1}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ivory/60">{tr("of {n}", { n: N })}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{tr("The chit cycle · illustrative")}</p>
        <div aria-live={playing ? "off" : "polite"} className="mt-3 min-h-[11rem]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <h3 className="font-heading text-2xl font-extrabold text-ivory sm:text-3xl">{stages[step].t}</h3>
              <p className="mt-2 text-ivory/80">{stages[step].s}</p>
              <p className="mt-4 rounded-xl border border-gold/30 bg-white/5 p-4 text-sm tabular-nums text-gold-soft">{stages[step].d}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setTick((t) => t - 1)} aria-label={tr("Previous stage")} className="grid h-11 w-11 place-items-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold active:scale-90"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={!playing} aria-label={playing ? tr("Pause automatic stepping") : tr("Play automatic stepping")} className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-navy transition hover:bg-gold-soft active:scale-95">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? tr("Pause") : tr("Play")}
          </button>
          <button type="button" onClick={() => setTick((t) => t + 1)} aria-label={tr("Next stage")} className="grid h-11 w-11 place-items-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold active:scale-90"><ChevronRight className="h-5 w-5" /></button>
          <ol className="ml-auto flex gap-1.5" aria-hidden>
            {stages.map((s, i) => <li key={s.t} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-gold" : "w-1.5 bg-ivory/25"}`} />)}
          </ol>
        </div>
        <p className="mt-4 text-xs text-ivory/50">{tr("Sample scheme and sample discount only — not an offer, quote or real auction result.")}</p>
      </div>
    </div>
  );
}
