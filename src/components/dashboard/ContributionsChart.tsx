"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Payment } from "@/data/types";
import { formatINR, formatINRPrecise } from "@/lib/money";

interface Row { instalment: string; no: number; successful: number; inProgress: number; other: number }

export function contributionsByInstalment(payments: Payment[]): Row[] {
  const map = new Map<number, Row>();
  for (const p of payments) {
    const row = map.get(p.instalmentNo) ?? { instalment: `#${p.instalmentNo}`, no: p.instalmentNo, successful: 0, inProgress: 0, other: 0 };
    const rupees = p.amount / 100;
    if (p.status === "Successful") row.successful += rupees;
    else if (p.status === "Pending" || p.status === "Under reconciliation") row.inProgress += rupees;
    else row.other += rupees;
    map.set(p.instalmentNo, row);
  }
  return [...map.values()].sort((a, b) => a.no - b.no);
}

const series = [
  { key: "successful", name: "Successful", color: "var(--emerald)" },
  { key: "inProgress", name: "Pending / under reconciliation", color: "var(--gold-antique)" },
  { key: "other", name: "Failed / refunded (not counted)", color: "var(--navy)" },
] as const;

export function ContributionsChart({ payments }: { payments: Payment[] }) {
  const rows = contributionsByInstalment(payments);
  return (
    <figure aria-labelledby="chart-caption">
      <figcaption id="chart-caption" className="sr-only">Payment amounts by instalment number, split by payment status. A data table with the same values follows.</figcaption>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-hidden>
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.name}</li>
        ))}
      </ul>
      <div className="h-64 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="instalment" tickLine={false} axisLine={{ stroke: "var(--line)" }} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} />
            <YAxis width={52} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} tickFormatter={(v: number) => `₹${v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : v}`} />
            <Tooltip cursor={{ fill: "var(--emerald-50)" }} formatter={(v, name) => [formatINR(Number(v) * 100), String(name)]} labelFormatter={(l) => `Instalment ${String(l).replace("#", "")}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }} />
            {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} maxBarSize={44} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="sr-only"><table>
        <caption>Payment amounts by instalment and status</caption>
        <thead><tr><th scope="col">Instalment</th><th scope="col">Successful</th><th scope="col">Pending or under reconciliation</th><th scope="col">Failed or refunded</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.no}><th scope="row">{r.instalment}</th><td>{formatINRPrecise(r.successful * 100)}</td><td>{formatINRPrecise(r.inProgress * 100)}</td><td>{formatINRPrecise(r.other * 100)}</td></tr>
          ))}
        </tbody>
      </table></div>
    </figure>
  );
}
