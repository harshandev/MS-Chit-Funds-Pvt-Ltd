import { formatINRPrecise, formatBps, type Bps } from "@/lib/money";
import type { ChitBreakdown, SchemeRules } from "@/lib/chit";
import { DefList } from "./ui";

export function BreakdownTable({ b, rules, discountBps }: { b: ChitBreakdown; rules: SchemeRules; discountBps: Bps }) {
  return (
    <DefList reveal rows={[
      { label: "Gross chit amount", value: formatINRPrecise(b.gross) },
      { label: `Discount (${formatBps(discountBps)} of gross)`, value: `− ${formatINRPrecise(b.discount)}` },
      { label: "Net chit amount to winning ticket (gross − discount)", value: <strong>{formatINRPrecise(b.netChit)}</strong> },
      { label: `Foreman commission (${formatBps(rules.commissionBps)} of gross)`, value: formatINRPrecise(b.commission) },
      { label: "Distributable dividend (discount − commission)", value: formatINRPrecise(b.distributable) },
      { label: `Dividend per ticket (${rules.dividendBasis === "all_tickets" ? `all ${rules.tickets} tickets` : `${rules.tickets - 1} non-prized tickets`})`, value: formatINRPrecise(b.dividendPerTicket) },
      { label: "Scheme instalment", value: formatINRPrecise(rules.instalment) },
      { label: "Payable by a non-winning ticket", value: formatINRPrecise(b.payableNonWinner) },
      { label: "Payable by the winning ticket", value: formatINRPrecise(b.payableWinner) },
      { label: "Instalments remaining after this auction", value: b.remainingAfterWin },
      { label: "Future obligation of winning ticket", value: formatINRPrecise(b.futureObligationWinner) },
    ]} />
  );
}
