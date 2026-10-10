"use client";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { computeBreakdown, validateRules, type SchemeRules } from "@/lib/chit";
import { formatBps, formatINR, pctToBps, rupees } from "@/lib/money";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { ChitChart, ProjectionChart, type ProjectionPoint } from "./ChitChart";
import { Money } from "./pages/Money";
import { RangeSlider } from "./pages/RangeSlider";
import { SplitBar } from "./pages/SplitBar";
import { useTr } from "@/i18n/LanguageProvider";
import { RichT } from "./pages/RichT";

const DEFAULTS = { gross: "300000", tickets: "30", instalments: "30", instalment: "10000", discount: "15", commission: "5", winMonth: "1" };
type Inputs = typeof DEFAULTS;
type Key = keyof Inputs;
const MAX_DISCOUNT_BPS = 3000;
const MAX_RUPEES = 100_000_000;

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function fieldErrors(i: Inputs) {
  const e: Partial<Record<Key, string>> = {};
  const g = num(i.gross), t = num(i.tickets), n = num(i.instalments), m = num(i.instalment), d = num(i.discount), c = num(i.commission), w = num(i.winMonth);
  if (!Number.isFinite(g) || g <= 0) e.gross = "Enter an amount greater than zero."; else if (g > MAX_RUPEES) e.gross = "Amount is too large for this calculator.";
  if (!Number.isInteger(t) || t < 2) e.tickets = "Enter a whole number of at least 2."; else if (t > 1000) e.tickets = "Enter 1,000 or fewer.";
  if (!Number.isInteger(n) || n < 1) e.instalments = "Enter a whole number of at least 1."; else if (n > 1000) e.instalments = "Enter 1,000 or fewer.";
  if (!Number.isFinite(m) || m <= 0) e.instalment = "Enter an amount greater than zero."; else if (m > MAX_RUPEES) e.instalment = "Amount is too large for this calculator.";
  if (!Number.isFinite(d) || d < 0) e.discount = "Discount cannot be negative."; else if (d > 100) e.discount = "Discount cannot exceed 100%.";
  if (!Number.isFinite(c) || c < 0) e.commission = "Commission cannot be negative."; else if (c > 100) e.commission = "Commission cannot exceed 100%.";
  if (!Number.isInteger(w) || w < 1 || (Number.isInteger(n) && n >= 1 && w > n)) e.winMonth = "Enter a whole instalment number between 1 and the total instalments.";
  return e;
}

/** Hard bounds enforced when a typed value is committed (blur). Slider ranges are tighter, for comfortable dragging. */
const bounds: Record<Key, { min: number; max: number; int: boolean }> = {
  gross: { min: 1, max: MAX_RUPEES, int: false }, tickets: { min: 2, max: 1000, int: true }, instalments: { min: 1, max: 1000, int: true },
  instalment: { min: 1, max: MAX_RUPEES, int: false }, discount: { min: 0, max: MAX_DISCOUNT_BPS / 100, int: false }, commission: { min: 0, max: 100, int: false }, winMonth: { min: 1, max: 1000, int: true },
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const tr = useTr();
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? "font-bold text-emerald" : "text-ink"}`}>
      <dt className="text-sm">{tr(label)}</dt>
      <dd className="text-right tabular-nums">{tr(value)}</dd>
    </div>
  );
}

function CalcField({ label, value, onChange, onCommit, error, hint, slider, prefix, suffix }: {
  label: string; value: string; onChange: (v: string) => void; onCommit: () => void; error?: string; hint?: string;
  slider: { min: number; max: number; step: number; tone?: "emerald" | "gold" }; prefix?: string; suffix?: string;
}) {
  const tr = useTr();
  const id = useId();
  const n = num(value);
  return (
    <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-[var(--shadow-1)] transition-shadow focus-within:shadow-[var(--shadow-2)]">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">{tr(label)}</label>
        <div className={cn("flex items-center rounded-xl border bg-ivory/60 px-3 transition focus-within:border-emerald focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald/10", error ? "border-danger" : "border-line")}>
          {prefix && <span className="text-sm text-muted">{prefix}</span>}
          <input id={id} type="number" inputMode="decimal" value={value} min={slider.min} step={slider.step} onChange={(e) => onChange(e.target.value)} onBlur={onCommit} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} className="h-11 w-28 bg-transparent text-right text-base font-bold tabular-nums text-emerald focus:outline-none sm:w-32" />
          {suffix && <span className="ml-1 text-sm text-muted">{suffix}</span>}
        </div>
      </div>
      <RangeSlider label={tr("{label} slider", { label: tr(label) })} hideLabel value={Number.isFinite(n) ? n : slider.min} min={slider.min} max={slider.max} step={slider.step} onChange={(v) => onChange(String(v))} tone={slider.tone} className="mt-2" />
      <AnimatePresence initial={false}>
        {error ? <motion.p key="e" id={`${id}-e`} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs font-medium text-danger">{tr(error)}</motion.p>
          : hint ? <p key="h" className="mt-2 text-xs text-muted">{tr(hint)}</p> : null}
      </AnimatePresence>
    </div>
  );
}

export function CalculatorClient() {
  const tr = useTr();
  const [i, setI] = useState<Inputs>(DEFAULTS);

  const update = (k: Key) => (v: string) => setI((p) => {
    const next = { ...p, [k]: v };
    // Keep the assumed winning instalment inside the scheme when the duration shrinks.
    if (k === "instalments") { const n = num(v), w = num(p.winMonth); if (Number.isInteger(n) && n >= 1 && Number.isInteger(w) && w > n) next.winMonth = String(n); }
    return next;
  });
  const commit = (k: Key) => () => setI((p) => {
    const { min, int } = bounds[k];
    let max = bounds[k].max;
    if (k === "winMonth" && Number.isInteger(num(p.instalments))) max = Math.min(max, num(p.instalments));
    let v = num(p[k]);
    if (!Number.isFinite(v)) v = Number(DEFAULTS[k]);
    v = Math.min(max, Math.max(min, v));
    if (int) v = Math.round(v);
    return { ...p, [k]: String(v) };
  });

  const calc = useMemo(() => {
    const errs = fieldErrors(i);
    const notes: string[] = [];
    if (Object.keys(errs).length > 0) return { errs, notes, b: null };
    const rules: SchemeRules = {
      grossChit: rupees(num(i.gross)), tickets: num(i.tickets), instalments: num(i.instalments), instalment: rupees(num(i.instalment)),
      commissionBps: pctToBps(num(i.commission)), maxDiscountBps: MAX_DISCOUNT_BPS, dividendBasis: "all_tickets", prizedReceivesDividend: false,
    };
    const dBps = pctToBps(num(i.discount));
    for (const issue of validateRules(rules, dBps)) {
      if (issue.message.startsWith("Note:")) notes.push(issue.message.replace(/^Note:\s*/, ""));
      else {
        const key = issue.field === "grossChit" ? "gross" : (issue.field as Key);
        errs[key] = errs[key] ?? issue.message;
      }
    }
    if (Object.keys(errs).length > 0) return { errs, notes, b: null };
    return { errs, notes, b: computeBreakdown(rules, dBps, num(i.winMonth)), rules, dBps };
  }, [i]);

  const { errs, notes, b } = calc;
  const rules = "rules" in calc ? calc.rules : undefined;

  const projection = useMemo<ProjectionPoint[]>(() => {
    if (!b || !rules) return [];
    const win = num(i.winMonth);
    let paid = 0;
    return Array.from({ length: rules.instalments }, (_, k) => {
      const m = k + 1;
      paid += m < win ? b.payableNonWinner : b.payableWinner;
      return { month: m, paid: paid / 100, received: m >= win ? b.netChit / 100 : 0 };
    });
  }, [b, rules, i.winMonth]);

  const segs = b ? [
    { label: tr("Net chit to winner"), value: b.netChit, color: "var(--emerald)" },
    { label: tr("Foreman commission"), value: Math.min(b.commission, b.discount), color: "var(--gold)" },
    { label: tr("Dividend pool"), value: b.distributable, color: "var(--navy)" },
  ] : [];
  const totalPaid = projection.length ? projection[projection.length - 1].paid * 100 : 0;

  return (
    <div className="pb-28 lg:pb-0">
      <div className="grid gap-8 lg:grid-cols-5 [&>*]:min-w-0">
        <div className="space-y-4 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-extrabold text-emerald">{tr("Scheme inputs")}</h2>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="sm" onClick={() => setI((p) => ({ ...p, instalment: String(Math.round(num(p.gross) / num(p.tickets))) }))} disabled={!!errs.gross || !!errs.tickets}><Sparkles className="h-4 w-4" />{tr("Instalment = chit ÷ tickets")}</Button>
              <Button variant="ghost" size="sm" onClick={() => setI(DEFAULTS)}><RotateCcw className="h-4 w-4" />{tr("Reset")}</Button>
            </div>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate aria-label={tr("Calculator inputs")}>
            <CalcField label="Gross chit" prefix="₹" value={i.gross} onChange={update("gross")} onCommit={commit("gross")} error={errs.gross} slider={{ min: 50000, max: 5000000, step: 10000 }} hint="The total pot each month." />
            <CalcField label="Number of tickets" value={i.tickets} onChange={update("tickets")} onCommit={commit("tickets")} error={errs.tickets} slider={{ min: 5, max: 100, step: 1 }} />
            <CalcField label="Number of instalments" value={i.instalments} onChange={update("instalments")} onCommit={commit("instalments")} error={errs.instalments} slider={{ min: 5, max: 100, step: 1 }} />
            <CalcField label="Monthly instalment" prefix="₹" value={i.instalment} onChange={update("instalment")} onCommit={commit("instalment")} error={errs.instalment} slider={{ min: 500, max: 200000, step: 500 }} />
            <CalcField label="Illustrative discount" suffix="%" value={i.discount} onChange={update("discount")} onCommit={commit("discount")} error={errs.discount} slider={{ min: 0, max: MAX_DISCOUNT_BPS / 100, step: 0.5, tone: "gold" }} hint={tr("Configured maximum in this demo: {pct}", { pct: formatBps(MAX_DISCOUNT_BPS) })} />
            <CalcField label="Foreman commission" suffix="%" value={i.commission} onChange={update("commission")} onCommit={commit("commission")} error={errs.commission} slider={{ min: 0, max: 10, step: 0.5, tone: "gold" }} hint="Configured per scheme; editable here for what-if only." />
            <div className="sm:col-span-2">
              <CalcField label="Assumed winning instalment no." value={i.winMonth} onChange={update("winMonth")} onCommit={commit("winMonth")} error={errs.winMonth} slider={{ min: 1, max: Math.max(1, Math.min(100, Number.isInteger(num(i.instalments)) ? num(i.instalments) : 30)), step: 1 }} hint="Used to count remaining instalments after winning." />
            </div>
          </form>
          <AnimatePresence>
            {notes.length > 0 && <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1 overflow-hidden rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-ink">{notes.map((n) => <li key={n}>{tr(n)}</li>)}</motion.ul>}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 text-ivory shadow-[var(--shadow-3)]">
              <div aria-hidden className="aurora pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />
              <div className="relative">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy">{tr("Illustrative — not investment returns or a quote")}</p>
                <AnimatePresence mode="wait" initial={false}>
                  {b && rules ? (
                    <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-ivory/60">{tr("Net chit amount to the winning ticket")}</p>
                      <p className="font-serif text-5xl text-gold-soft sm:text-6xl"><Money paise={b.netChit} /></p>
                      <dl className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-ivory/5 p-3 ring-1 ring-ivory/10"><dt className="text-[11px] text-ivory/60">{tr("Non-winner pays")}</dt><dd className="mt-0.5 text-lg font-bold tabular-nums"><Money paise={b.payableNonWinner} /></dd></div>
                        <div className="rounded-2xl bg-ivory/5 p-3 ring-1 ring-ivory/10"><dt className="text-[11px] text-ivory/60">{tr("Dividend per ticket")}</dt><dd className="mt-0.5 text-lg font-bold tabular-nums"><Money paise={b.dividendPerTicket} /></dd></div>
                      </dl>
                    </motion.div>
                  ) : (
                    <motion.p key="bad" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 flex items-start gap-2 rounded-2xl bg-danger/20 p-4 text-sm"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />{tr("Fix the highlighted inputs to see results.")}</motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {b && rules && (
              <Card><CardBody>
                <h2 className="text-lg font-bold text-emerald">{tr("Where the gross chit goes")}</h2>
                <div className="mt-3"><SplitBar segs={segs} className="h-4" /></div>
                <div className="mt-4"><ChitChart b={b} /></div>
              </CardBody></Card>
            )}
          </div>
        </div>
      </div>

      {b && rules && (
        <div className="mt-10 grid gap-8 lg:grid-cols-5 [&>*]:min-w-0">
          <Reveal className="lg:col-span-3">
            <Card><CardBody>
              <h2 className="text-lg font-bold text-emerald"><RichT text="Month-by-month <i>timeline</i>" /></h2>
              <p className="mt-1 text-sm text-muted">{tr("Cumulative amounts for one ticket that wins in instalment {n}. Assumes the same sample discount every month. A cash-flow illustration only — not a return or a forecast.", { n: i.winMonth })}</p>
              <div className="mt-4"><ProjectionChart data={projection} winMonth={num(i.winMonth)} /></div>
              <p className="mt-3 text-sm text-ink"><RichT text="Total paid over {n} instalments in this illustration: {amount}" vars={{ n: rules.instalments }} parts={{ amount: <strong className="tabular-nums text-emerald"><AnimatedNumber value={totalPaid / 100} format={(n) => formatINR(Math.round(n) * 100)} /></strong> }} /></p>
            </CardBody></Card>
          </Reveal>
          <Reveal className="lg:col-span-2" delay={0.1}>
            <div className="space-y-6">
              <Card><CardBody>
                <h2 className="text-lg font-bold text-emerald">{tr("All results")}</h2>
                <dl className="mt-3 divide-y divide-line">
                  <Row label="Gross chit" value={formatINR(b.gross)} />
                  <Row label="Illustrative discount" value={formatINR(b.discount)} />
                  <Row label="Net chit amount" value={formatINR(b.netChit)} strong />
                  <Row label="Foreman commission" value={formatINR(b.commission)} />
                  <Row label="Illustrative distribution (dividend pool)" value={formatINR(b.distributable)} />
                  <Row label="Dividend per ticket" value={formatINR(b.dividendPerTicket)} />
                  <Row label="Estimated payable by winning subscriber" value={formatINR(b.payableWinner)} />
                  <Row label="Remaining instalments after winning" value={String(b.remainingAfterWin)} />
                  <Row label="Non-winner payable" value={formatINR(b.payableNonWinner)} strong />
                </dl>
              </CardBody></Card>
              <Card><CardBody>
                <h2 className="text-lg font-bold text-emerald">{tr("Assumptions")}</h2>
                <dl className="mt-3 divide-y divide-line text-sm">
                  <Row label="Dividend shared by" value="All tickets" />
                  <Row label="Winning ticket receives later dividends" value="No" />
                  <Row label="Maximum discount" value={tr("{pct} of gross chit", { pct: formatBps(MAX_DISCOUNT_BPS) })} />
                  <Row label="Commission taken from" value="The auction discount" />
                  <Row label="Timeline discount" value="Same sample discount each month" />
                  <Row label="Rounding" value="Whole paise; dividend rounded down" />
                </dl>
                <p className="mt-3 text-xs text-muted">{tr("Real schemes follow their approved agreement; these assumptions are demo defaults.")}</p>
              </CardBody></Card>
            </div>
          </Reveal>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-12px_rgb(24_37_31/0.2)] backdrop-blur lg:hidden" role="region" aria-label={tr("Result summary")}>
        {b ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <div><p className="text-xs text-muted">{tr("Net chit")}</p><p className="font-bold tabular-nums text-emerald"><Money paise={b.netChit} /></p></div>
            <div><p className="text-xs text-muted">{tr("Non-winner payable")}</p><p className="font-bold tabular-nums text-emerald"><Money paise={b.payableNonWinner} /></p></div>
            <p className="max-w-[7rem] text-[11px] font-semibold leading-tight text-gold-antique">{tr("Illustrative estimate")}</p>
          </div>
        ) : <p className="text-sm text-danger">{tr("Fix the highlighted inputs to see results.")}</p>}
      </div>
    </div>
  );
}
