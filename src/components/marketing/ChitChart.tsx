"use client";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChitBreakdown } from "@/lib/chit";
import { formatINR, formatLakh } from "@/lib/money";

/** Donut showing where the gross chit goes: net chit / commission / dividend pool. Animates on change. */
export function ChitChart({ b }: { b: ChitBreakdown }) {
  const data = [
    { name: "Net chit to winner", value: b.netChit, fill: "var(--emerald)" },
    { name: "Foreman commission", value: b.commission, fill: "var(--gold)" },
    { name: "Dividend pool", value: b.distributable, fill: "var(--navy)" },
  ].filter((d) => d.value > 0);
  return (
    <figure>
      <div className="relative h-56 w-full" role="img" aria-label={`Where the gross chit of ${formatINR(b.gross)} goes: ${data.map((d) => `${d.name} ${formatINR(d.value)}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} cornerRadius={6} stroke="none" startAngle={90} endAngle={-270} isAnimationActive animationDuration={700}>
              {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
            </Pie>
            <Tooltip formatter={(v) => formatINR(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Gross chit</p><p className="font-serif text-2xl text-emerald">{formatLakh(b.gross)}</p></div>
        </div>
      </div>
      <figcaption>
        <ul className="mt-2 space-y-1.5 text-sm">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2"><span aria-hidden className="h-3 w-3 rounded-sm" style={{ background: d.fill }} />{d.name}</span>
              <span className="font-semibold tabular-nums">{formatINR(d.value)}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

export interface ProjectionPoint { month: number; paid: number; received: number }

/** Cumulative cash-flow timeline for one ticket (rupees). Illustrative only. Includes a text alternative. */
export function ProjectionChart({ data, winMonth }: { data: ProjectionPoint[]; winMonth: number }) {
  const last = data[data.length - 1];
  const summary = last
    ? `Month-by-month illustration for a ticket that wins in instalment ${winMonth}: by month ${last.month} it has paid ${formatINR(last.paid * 100)} in total and received the net chit of ${formatINR(last.received * 100)}.`
    : "";
  return (
    <figure>
      <div className="h-72 w-full" role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--emerald)" stopOpacity={0.02} /></linearGradient>
              <linearGradient id="recvFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--gold)" stopOpacity={0.02} /></linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "var(--line)" }} tick={{ fontSize: 11, fill: "var(--ink-muted)" }} label={{ value: "Instalment month", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--ink-muted)" }} height={36} />
            <YAxis tickLine={false} axisLine={false} width={78} tick={{ fontSize: 11, fill: "var(--ink-muted)" }} tickFormatter={(v) => formatLakh(Number(v) * 100).replace(" lakh", "L").replace(" crore", "Cr")} />
            <Tooltip formatter={(v, n) => [formatINR(Number(v) * 100), n]} labelFormatter={(m) => `Month ${m}`} contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", fontSize: 12 }} />
            <ReferenceLine x={winMonth} stroke="var(--gold-antique)" strokeDasharray="4 3" label={{ value: "Win", position: "top", fontSize: 11, fill: "var(--gold-antique)" }} />
            <Area type="monotone" dataKey="paid" name="Paid in (cumulative)" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#paidFill)" isAnimationActive animationDuration={600} />
            <Area type="stepAfter" dataKey="received" name="Net chit received" stroke="var(--gold-antique)" strokeWidth={2.5} fill="url(#recvFill)" isAnimationActive animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-5 rounded bg-emerald" />Paid in (cumulative)</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-5 rounded bg-gold-antique" />Net chit received</span>
      </figcaption>
      <details className="group mt-3 rounded-xl border border-line bg-white text-sm">
        <summary className="min-h-11 cursor-pointer select-none px-4 py-3 font-semibold text-emerald">View the data as a table</summary>
        <div className="max-h-64 overflow-auto border-t border-line">
          <table className="w-full text-left text-sm tabular-nums">
            <caption className="sr-only">Cumulative amount paid and received by month, illustrative</caption>
            <thead className="sticky top-0 bg-ivory text-xs uppercase tracking-wider text-muted"><tr><th scope="col" className="px-4 py-2">Month</th><th scope="col" className="px-4 py-2 text-right">Paid in</th><th scope="col" className="px-4 py-2 text-right">Net chit received</th></tr></thead>
            <tbody className="divide-y divide-line">
              {data.map((d) => <tr key={d.month}><th scope="row" className="px-4 py-1.5 font-semibold">{d.month}{d.month === winMonth ? " (win)" : ""}</th><td className="px-4 py-1.5 text-right">{formatINR(d.paid * 100)}</td><td className="px-4 py-1.5 text-right">{formatINR(d.received * 100)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
