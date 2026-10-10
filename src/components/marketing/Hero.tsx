"use client";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useLang, useTr } from "@/i18n/LanguageProvider";
import { buttonClass } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tilt } from "@/components/motion/Tilt";
import { CountUp } from "@/components/motion/CountUp";
import { computeBreakdown } from "@/lib/chit";
import { formatINR } from "@/lib/money";
import { ILLUSTRATIVE_DISCOUNT_BPS, lakh, showcaseScheme } from "./constants";
import { ChitWheel } from "./home/ChitWheel";

const ease = [0.22, 1, 0.36, 1] as const;

function HeroTitle({ title }: { title: string }) {
  const reduce = useReducedMotion();
  const words = title.split(" ");
  const last = words.pop() ?? "";
  const mask = "inline-block overflow-hidden pb-[0.14em] align-bottom";
  return (
    <h1 id="hero-title" aria-label={title} className="font-serif text-[2.75rem] leading-[1.04] tracking-tight text-ivory sm:text-6xl lg:text-7xl">
      {words.map((w, i) => (
        <span key={i} aria-hidden className={mask}>
          <motion.span className="inline-block" initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.25 + i * 0.08, ease }}>{w}&nbsp;</motion.span>
        </span>
      ))}
      <span aria-hidden className={mask}>
        <motion.span className="inline-block" initial={reduce ? false : { y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.1, delay: 0.25 + words.length * 0.08 + 0.1, ease }}>
          <em className="text-shimmer pr-[0.14em] italic [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">{last}</em>
        </motion.span>
      </span>
    </h1>
  );
}

function SummaryCard() {
  const tr = useTr();
  const reduce = useReducedMotion();
  const s = showcaseScheme;
  const b = computeBreakdown(s.rules, ILLUSTRATIVE_DISCOUNT_BPS);
  const months = [1, 2, 3, 4, 5, 6];
  return (
    <Tilt max={7} className="relative w-full max-w-md rounded-2xl">
      <div role="group" aria-label={tr("Illustrative financial summary")} className="relative overflow-hidden rounded-2xl border border-ivory/15 bg-ivory/[0.07] p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{tr("Financial summary")}</p>
            <p className="mt-1 text-sm font-semibold text-ivory">{tr(s.name)}</p>
          </div>
          <span className="rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-soft">{tr("Illustrative")}</span>
        </div>
        <p className="relative mt-6 text-[11px] uppercase tracking-wider text-ivory/60">{tr("Net chit for a winning ticket")}</p>
        <p className="relative font-serif text-5xl text-ivory tabular-nums"><CountUp value={b.netChit} duration={1.8} format={(n) => formatINR(Math.round(n / 100) * 100)} /></p>
        <p className="relative text-xs text-ivory/60">{tr("of a {gross} chit, after a sample {pct}% auction discount", { gross: lakh(tr, b.gross), pct: ILLUSTRATIVE_DISCOUNT_BPS / 100 })}</p>
        <dl className="relative mt-5 grid grid-cols-3 gap-3 border-t border-ivory/15 pt-4 text-sm">
          <div><dt className="text-[11px] text-ivory/60">{tr("Instalment")}</dt><dd className="font-bold tabular-nums text-ivory"><CountUp value={s.rules.instalment} format={(n) => formatINR(Math.round(n))} /></dd></div>
          <div><dt className="text-[11px] text-ivory/60">{tr("Dividend / ticket")}</dt><dd className="font-bold tabular-nums text-gold-soft"><CountUp value={b.dividendPerTicket} format={(n) => formatINR(Math.round(n))} /></dd></div>
          <div><dt className="text-[11px] text-ivory/60">{tr("Contribution")}</dt><dd className="font-bold tabular-nums text-ivory"><CountUp value={b.payableNonWinner} format={(n) => formatINR(Math.round(n))} /></dd></div>
        </dl>
        <div className="relative mt-5 border-t border-ivory/15 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ivory/60">{tr("Sample contribution timeline")}</p>
          <div className="relative mt-5 px-1.5">
            <div aria-hidden className="absolute left-1.5 right-1.5 top-[7px] h-px bg-ivory/15" />
            <motion.div aria-hidden className="absolute left-1.5 right-1.5 top-[7px] h-px origin-left bg-gold" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.8, delay: 1.1, ease }} />
            <ol className="relative flex justify-between">
              {months.map((m, i) => (
                <li key={m} className="flex flex-col items-center gap-2">
                  <motion.span aria-hidden className="h-[15px] w-[15px] rounded-full border-2 border-gold bg-emerald-950" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 16, delay: 1.1 + i * 0.3 }} />
                  <span className="text-[11px] font-semibold text-ivory/80">{tr("M{m}", { m })}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-3 text-xs text-ivory/70">{tr("About {amt} per month after a sample dividend.", { amt: formatINR(b.payableNonWinner) })}</p>
        </div>
        <p className="relative mt-4 text-[11px] leading-relaxed text-ivory/55">{tr("Illustrative demo scheme. Assumes the same sample discount every month; real auctions vary. Not an offer, quote or return.")}</p>
      </div>
    </Tilt>
  );
}

export function Hero() {
  const { t, tr } = useLang();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const wheelY = useTransform(scrollY, [0, 900], [0, reduce ? 0 : 140]);
  const wheelRotate = useTransform(scrollY, [0, 1200], [0, reduce ? 0 : 110]);
  const textY = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -50]);
  const cardY = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -110]);
  const fade = useTransform(scrollY, [0, 650], [1, reduce ? 1 : 0.2]);
  const mx = useMotionValue(70), my = useMotionValue(30);
  const gx = useSpring(mx, { stiffness: 60, damping: 20 }), gy = useSpring(my, { stiffness: 60, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(520px circle at ${gx}% ${gy}%, rgb(212 175 55 / 0.16), transparent 62%)`;

  return (
    <section
      aria-labelledby="hero-title"
      className="grain relative -mt-16 flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-emerald-900 pb-16 pt-28 text-ivory"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100); my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora absolute -left-[10%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-emerald-700/50 blur-[110px]" />
        <div className="aurora absolute -right-[8%] top-[28%] h-[30rem] w-[30rem] rounded-full bg-gold/25 blur-[120px] [animation-delay:-6s]" />
        <div className="aurora absolute bottom-[-12%] left-[28%] h-[28rem] w-[28rem] rounded-full bg-emerald/70 blur-[100px] [animation-delay:-11s]" />
        <motion.div className="absolute inset-0" style={{ background: glow }} />
        <div className="absolute inset-0 [background-image:linear-gradient(rgb(248_246_239/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(248_246_239/0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_60%_40%,#000_10%,transparent_70%)]" />
      </div>
      <motion.div aria-hidden style={{ y: wheelY, rotate: wheelRotate }} className="pointer-events-none absolute -right-[38%] top-[8%] w-[120vw] max-w-[860px] opacity-40 sm:-right-[14%] sm:opacity-60 lg:-right-[8%] lg:top-1/2 lg:-translate-y-1/2 lg:opacity-70">
        <ChitWheel />
      </motion.div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <motion.div style={{ y: textY, opacity: fade }}>
          <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />{t("hero.eyebrow")}
          </motion.p>
          <div className="mt-6"><HeroTitle title={t("hero.title")} /></div>
          <motion.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease }} className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg">{t("hero.text")}</motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.05, ease }} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic><Link href="/chit-plans" className={buttonClass("gold", "lg", "w-full shadow-[0_10px_40px_-8px_rgb(212_175_55/0.55)] sm:w-auto")}>{t("hero.cta1")} <ArrowRight className="h-4 w-4" aria-hidden /></Link></Magnetic>
            <Magnetic><Link href="/how-it-works" className={buttonClass("glass", "lg", "w-full sm:w-auto")}>{t("hero.cta2")}</Link></Magnetic>
          </motion.div>
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1.3 }} className="mt-10 max-w-md border-l-2 border-gold pl-4 text-sm font-medium text-ivory/85">{t("hero.line")}</motion.p>
        </motion.div>
        <motion.div style={{ y: cardY }} initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7, ease }} className="flex justify-center lg:justify-end">
          <div className="float w-full max-w-md"><SummaryCard /></div>
        </motion.div>
      </div>

      <a href="#playground" aria-label={tr("Scroll to the interactive chit month")} className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] text-ivory/50 hover:text-gold sm:flex">
        {tr("Scroll")} <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
