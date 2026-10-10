"use client";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChitBreakdown } from "@/lib/chit";
import { formatINR } from "@/lib/money";

/** Donut showing where the gross chit goes: net chit / commission / dividend pool. */
export function ChitChart({ b }: { b: ChitBreakdown }) {
  const data = [
    { name: "Net chit to winner", value: b.netChit, fill: "var(--emerald)" },
    { name: "Foreman commission", value: b.commission, fill: "var(--gold)" },
    { name: "Dividend pool", value: b.distributable, fill: "var(--navy)" },
  ].filter((d) => d.value > 0);
  return (
    <figure>
      <div className="h-56 w-full" role="img" aria-label={`Where the gross chit of ${formatINR(b.gross)} goes: ${data.map((d) => `${d.name} ${formatINR(d.value)}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none" isAnimationActive={false} />
            <Tooltip formatter={(v) => formatINR(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
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
