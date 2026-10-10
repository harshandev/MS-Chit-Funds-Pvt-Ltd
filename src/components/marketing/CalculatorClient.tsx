"use client";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { computeBreakdown, validateRules, type SchemeRules } from "@/lib/chit";
import { formatBps, formatINR, pctToBps, rupees } from "@/lib/money";
import { TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ChitChart } from "./ChitChart";

const DEFAULTS = { gross: "300000", tickets: "30", instalments: "30", instalment: "10000", discount: "15", commission: "5", winMonth: "1" };
type Inputs = typeof DEFAULTS;
const MAX_DISCOUNT_BPS = 3000;
const MAX_RUPEES = 100_000_000;

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function fieldErrors(i: Inputs) {
  const e: Partial<Record<keyof Inputs, string>> = {};
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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? "font-bold text-emerald" : "text-ink"}`}>
      <dt className="text-sm">{label}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}

export function CalculatorClient() {
  const [i, setI] = useState<Inputs>(DEFAULTS);
  const set = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => setI((p) => ({ ...p, [k]: e.target.value }));

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
        const key = issue.field === "grossChit" ? "gross" : (issue.field as keyof Inputs);
        errs[key] = errs[key] ?? issue.message;
      }
    }
    if (Object.keys(errs).length > 0) return { errs, notes, b: null };
    return { errs, notes, b: computeBreakdown(rules, dBps, num(i.winMonth)), rules, dBps };
  }, [i]);

  const { errs, notes, b } = calc;
  const rules = "rules" in calc ? calc.rules : undefined;

  return (
    <div className="grid gap-8 pb-28 lg:grid-cols-5 lg:pb-0">
      <div className="space-y-6 lg:col-span-3">
        <Card><CardBody>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-emerald">Scheme inputs</h2>
            <Button variant="ghost" size="sm" onClick={() => setI(DEFAULTS)}><RotateCcw className="h-4 w-4" />Reset</Button>
          </div>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
            <TextField label="Gross chit (₹)" type="number" inputMode="decimal" min={0} value={i.gross} onChange={set("gross")} error={errs.gross} />
            <TextField label="Number of tickets" type="number" inputMode="numeric" min={2} step={1} value={i.tickets} onChange={set("tickets")} error={errs.tickets} />
            <TextField label="Number of instalments" type="number" inputMode="numeric" min={1} step={1} value={i.instalments} onChange={set("instalments")} error={errs.instalments} />
            <TextField label="Monthly instalment (₹)" type="number" inputMode="decimal" min={0} value={i.instalment} onChange={set("instalment")} error={errs.instalment} />
            <TextField label="Illustrative discount (%)" type="number" inputMode="decimal" min={0} step={0.5} value={i.discount} onChange={set("discount")} hint={`Configured maximum in this demo: ${formatBps(MAX_DISCOUNT_BPS)}`} error={errs.discount} />
            <TextField label="Foreman commission (%)" type="number" inputMode="decimal" min={0} step={0.5} value={i.commission} onChange={set("commission")} hint="Configured per scheme; editable here for what-if only." error={errs.commission} />
            <TextField label="Assumed winning instalment no." type="number" inputMode="numeric" min={1} step={1} value={i.winMonth} onChange={set("winMonth")} hint="Used to count remaining instalments after winning." error={errs.winMonth} />
          </form>
          {notes.length > 0 && <ul className="mt-4 space-y-1 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-ink">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
        </CardBody></Card>

        <Card><CardBody>
          <h2 className="text-lg font-bold text-emerald">Assumptions</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            <Row label="Dividend shared by" value="All tickets (dividendBasis)" />
            <Row label="Winning ticket receives later dividends" value="No (prizedReceivesDividend = false)" />
            <Row label="Maximum discount" value={`${formatBps(MAX_DISCOUNT_BPS)} of gross chit`} />
            <Row label="Commission taken from" value="The auction discount" />
            <Row label="Rounding" value="Whole paise; dividend rounded down" />
          </dl>
          <p className="mt-3 text-xs text-muted">Real schemes follow their approved agreement; these assumptions are demo defaults.</p>
        </CardBody></Card>
      </div>

      <div className="lg:col-span-2">
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card><CardBody>
            <h2 className="text-lg font-bold text-emerald">Illustrative results</h2>
            {b && rules ? (
              <>
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
                <div className="mt-6"><ChitChart b={b} /></div>
              </>
            ) : (
              <p role="alert" className="mt-3 rounded-md bg-danger/5 p-4 text-sm text-danger">Fix the highlighted inputs to see results.</p>
            )}
          </CardBody></Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 py-3 shadow-[var(--shadow-3)] lg:hidden" role="region" aria-label="Result summary">
        {b ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <div><p className="text-xs text-muted">Net chit</p><p className="font-bold tabular-nums text-emerald">{formatINR(b.netChit)}</p></div>
            <div><p className="text-xs text-muted">Non-winner payable</p><p className="font-bold tabular-nums text-emerald">{formatINR(b.payableNonWinner)}</p></div>
            <p className="max-w-[7rem] text-[11px] leading-tight text-muted">Illustrative estimate</p>
          </div>
        ) : <p className="text-sm text-danger">Fix the highlighted inputs to see results.</p>}
      </div>
    </div>
  );
}
