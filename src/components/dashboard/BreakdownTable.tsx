"use client";
import { formatINRPrecise, formatBps, type Bps } from "@/lib/money";
import type { ChitBreakdown, SchemeRules } from "@/lib/chit";
import { useTr } from "@/i18n/LanguageProvider";
import { DefList } from "./ui";

export function BreakdownTable({ b, rules, discountBps }: { b: ChitBreakdown; rules: SchemeRules; discountBps: Bps }) {
  const tr = useTr();
  return (
    <DefList reveal rows={[
      { label: tr("Gross chit amount"), value: formatINRPrecise(b.gross) },
      { label: tr("Discount ({pct} of gross)", { pct: formatBps(discountBps) }), value: `− ${formatINRPrecise(b.discount)}` },
      { label: tr("Net chit amount to winning ticket (gross − discount)"), value: <strong>{formatINRPrecise(b.netChit)}</strong> },
      { label: tr("Foreman commission ({pct} of gross)", { pct: formatBps(rules.commissionBps) }), value: formatINRPrecise(b.commission) },
      { label: tr("Distributable dividend (discount − commission)"), value: formatINRPrecise(b.distributable) },
      { label: rules.dividendBasis === "all_tickets" ? tr("Dividend per ticket (all {n} tickets)", { n: rules.tickets }) : tr("Dividend per ticket ({n} non-prized tickets)", { n: rules.tickets - 1 }), value: formatINRPrecise(b.dividendPerTicket) },
      { label: tr("Scheme instalment"), value: formatINRPrecise(rules.instalment) },
      { label: tr("Payable by a non-winning ticket"), value: formatINRPrecise(b.payableNonWinner) },
      { label: tr("Payable by the winning ticket"), value: formatINRPrecise(b.payableWinner) },
      { label: tr("Instalments remaining after this auction"), value: b.remainingAfterWin },
      { label: tr("Future obligation of winning ticket"), value: formatINRPrecise(b.futureObligationWinner) },
    ]} />
  );
}
