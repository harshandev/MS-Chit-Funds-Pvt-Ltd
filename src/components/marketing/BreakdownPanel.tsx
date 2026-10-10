"use client";
import { motion } from "motion/react";
import { computeBreakdown, type SchemeRules } from "@/lib/chit";
import { formatBps, formatINR, type Bps } from "@/lib/money";
import { cn } from "@/lib/cn";
import { DemoNote } from "@/components/ui/misc";
import { Money } from "./pages/Money";
import { useTr } from "@/i18n/LanguageProvider";

/** Worked, labelled-illustrative breakdown driven by lib/chit computeBreakdown. */
export function BreakdownPanel({ rules, discountBps, instalmentNo = 1, title = "Illustrative worked example" }: {
  rules: SchemeRules; discountBps: Bps; instalmentNo?: number; title?: string;
}) {
  const tr = useTr();
  const b = computeBreakdown(rules, discountBps, instalmentNo);
  const rows: { label: string; paise: number; prefix?: string; how: string; strong?: boolean }[] = [
    { label: tr("Gross chit"), paise: b.gross, how: tr("The total chit value defined in the scheme.") },
    { label: tr("Auction discount ({pct}, illustrative)", { pct: formatBps(discountBps) }), paise: b.discount, prefix: "− ", how: tr("The discount a winning bidder accepts. Here a sample percentage, not a real auction result.") },
    { label: tr("Foreman commission ({pct}, configured)", { pct: formatBps(rules.commissionBps) }), paise: b.commission, how: tr("Set per scheme in the approved agreement and taken from the discount.") },
    { label: tr("Net chit amount"), paise: b.netChit, how: tr("Gross chit minus the discount: the amount for the winning ticket."), strong: true },
    { label: tr("Distributable amount (dividend pool)"), paise: b.distributable, how: tr("Discount minus commission, shared among tickets as set in the agreement.") },
    { label: tr("Dividend per ticket"), paise: b.dividendPerTicket, how: tr(rules.dividendBasis === "all_tickets" ? "Pool divided across all tickets (rounded down)." : "Pool divided across non-prized tickets (rounded down).") },
    { label: tr("Customer contribution (non-winning ticket)"), paise: b.payableNonWinner, how: tr("Monthly instalment minus the dividend per ticket."), strong: true },
  ];
  return (
    <div>
      <h3 className="text-lg font-bold text-emerald">{tr(title)}</h3>
      <div className="mt-3"><DemoNote>{tr("Illustrative demo scheme — the discount used here is a sample, not an auction outcome or an offer.")}</DemoNote></div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line/80 bg-white shadow-[var(--shadow-2)]">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">{tr("{title}. Gross chit {amount}.", { title: tr(title), amount: formatINR(b.gross) })}</caption>
          <thead className="bg-emerald-950 text-xs uppercase tracking-wider text-ivory/70">
            <tr><th scope="col" className="px-4 py-3">{tr("Item")}</th><th scope="col" className="px-4 py-3 text-right">{tr("Amount")}</th><th scope="col" className="px-4 py-3">{tr("How it is derived")}</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <motion.tr key={r.label} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }} className={cn("transition-colors hover:bg-gold/10", r.strong && "bg-emerald-50/70")}>
                <th scope="row" className="px-4 py-3 font-semibold text-ink">{r.label}</th>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-emerald"><Money paise={r.paise} prefix={r.prefix} /></td>
                <td className="px-4 py-3 text-muted">{r.how}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
