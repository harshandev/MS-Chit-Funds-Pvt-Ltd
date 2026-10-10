"use client";
import { useLang } from "@/i18n/LanguageProvider";
import { buttonClass } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { computeBreakdown } from "@/lib/chit";
import { formatINR, formatLakh } from "@/lib/money";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "./constants";
import { Container } from "./shared";

function GoldRings() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-[22rem] w-[22rem] text-gold sm:-right-10 sm:-top-10 sm:h-[26rem] sm:w-[26rem]">
      <g fill="none" stroke="currentColor">
        <circle cx="200" cy="200" r="190" strokeWidth="1" opacity="0.6" />
        <circle cx="200" cy="200" r="150" strokeWidth="1.5" strokeDasharray="3 7" opacity="0.8" />
        <circle cx="200" cy="200" r="110" strokeWidth="1" opacity="0.5" />
        <circle cx="200" cy="200" r="70" strokeWidth="2" opacity="0.4" />
        <path d="M200 10 V390 M10 200 H390" strokeWidth="0.5" opacity="0.35" />
      </g>
      <circle cx="200" cy="10" r="5" fill="currentColor" />
      <circle cx="350" cy="200" r="4" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function SummaryCard() {
  const s = showcaseScheme;
  const b = computeBreakdown(s.rules, ILLUSTRATIVE_DISCOUNT_BPS);
  const timeline = [1, 2, 3].map((m) => ({ m, due: b.payableNonWinner }));
  return (
    <div className="relative z-10 w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-[var(--shadow-3)] sm:p-7" role="group" aria-label="Illustrative financial summary">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-antique">Financial summary</p>
          <p className="mt-1 text-sm font-semibold text-ink">{s.name}</p>
        </div>
        <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-ink">Illustrative</span>
      </div>
      <p className="mt-5 text-xs uppercase tracking-wider text-muted">Net chit for a winning ticket</p>
      <p className="font-serif text-4xl text-emerald tabular-nums">{formatINR(b.netChit)}</p>
      <p className="text-xs text-muted">of a {formatLakh(b.gross)} chit, after a sample {ILLUSTRATIVE_DISCOUNT_BPS / 100}% auction discount</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
        <div><dt className="text-xs text-muted">Instalment</dt><dd className="font-bold tabular-nums">{formatINR(s.rules.instalment)}</dd></div>
        <div><dt className="text-xs text-muted">Dividend / ticket</dt><dd className="font-bold tabular-nums">{formatINR(b.dividendPerTicket)}</dd></div>
        <div><dt className="text-xs text-muted">Contribution</dt><dd className="font-bold tabular-nums">{formatINR(b.payableNonWinner)}</dd></div>
      </dl>
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Sample contribution timeline</p>
        <ol className="mt-3 space-y-0">
          {timeline.map((t, i) => (
            <li key={t.m} className="relative flex gap-3 pb-4 last:pb-0">
              {i < timeline.length - 1 && <span aria-hidden className="absolute left-[7px] top-4 h-full w-px bg-line" />}
              <span aria-hidden className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-gold-antique bg-white" />
              <div className="text-sm">
                <p className="font-semibold text-ink">Month {t.m}</p>
                <p className="text-muted">Auction held, then contribution of {formatINR(t.due)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">Illustrative demo scheme. Assumes the same sample discount every month; real auctions vary. Not an offer, quote or return.</p>
    </div>
  );
}

export function Hero() {
  const { t } = useLang();
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
      <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:py-24">
        <div className="rise">
          <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
          <h1 id="hero-title" className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-emerald sm:text-6xl">{t("hero.title")}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t("hero.text")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/chit-plans" className={buttonClass("primary", "lg")}>{t("hero.cta1")} <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/how-it-works" className={buttonClass("secondary", "lg")}>{t("hero.cta2")}</Link>
          </div>
          <p className="mt-8 border-l-2 border-gold pl-4 text-sm font-medium text-ink">{t("hero.line")}</p>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 overflow-hidden"><GoldRings /></div>
          <SummaryCard />
        </div>
      </Container>
    </section>
  );
}
