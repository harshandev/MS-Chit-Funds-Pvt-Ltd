import { computeBreakdown, type SchemeRules } from "@/lib/chit";
import { formatBps, formatINR, type Bps } from "@/lib/money";
import { DemoNote } from "@/components/ui/misc";

/** Worked, labelled-illustrative breakdown driven by lib/chit computeBreakdown. */
export function BreakdownPanel({ rules, discountBps, instalmentNo = 1, title = "Illustrative worked example" }: {
  rules: SchemeRules; discountBps: Bps; instalmentNo?: number; title?: string;
}) {
  const b = computeBreakdown(rules, discountBps, instalmentNo);
  const rows: { label: string; value: string; how: string; strong?: boolean }[] = [
    { label: "Gross chit", value: formatINR(b.gross), how: "The total chit value defined in the scheme." },
    { label: `Auction discount (${formatBps(discountBps)}, illustrative)`, value: `− ${formatINR(b.discount)}`, how: "The discount a winning bidder accepts. Here a sample percentage, not a real auction result." },
    { label: `Foreman commission (${formatBps(rules.commissionBps)}, configured)`, value: formatINR(b.commission), how: "Set per scheme in the approved agreement and taken from the discount." },
    { label: "Net chit amount", value: formatINR(b.netChit), how: "Gross chit minus the discount: the amount for the winning ticket.", strong: true },
    { label: "Distributable amount (dividend pool)", value: formatINR(b.distributable), how: "Discount minus commission, shared among tickets as set in the agreement." },
    { label: "Dividend per ticket", value: formatINR(b.dividendPerTicket), how: `Pool divided across ${rules.dividendBasis === "all_tickets" ? "all" : "non-prized"} tickets (rounded down).` },
    { label: "Customer contribution (non-winning ticket)", value: formatINR(b.payableNonWinner), how: "Monthly instalment minus the dividend per ticket.", strong: true },
  ];
  return (
    <div>
      <h3 className="text-lg font-bold text-emerald">{title}</h3>
      <div className="mt-3"><DemoNote>Illustrative demo scheme — the discount used here is a sample, not an auction outcome or an offer.</DemoNote></div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-ivory text-xs uppercase tracking-wider text-muted">
            <tr><th scope="col" className="px-4 py-3">Item</th><th scope="col" className="px-4 py-3 text-right">Amount</th><th scope="col" className="px-4 py-3">How it is derived</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.label} className={r.strong ? "bg-emerald-50/60" : undefined}>
                <th scope="row" className="px-4 py-3 font-semibold text-ink">{r.label}</th>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-emerald">{r.value}</td>
                <td className="px-4 py-3 text-muted">{r.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
