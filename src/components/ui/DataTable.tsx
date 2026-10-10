import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode; className?: string; }

/** Table on md+, stacked label/value cards on mobile. */
export function DataTable<T>({ columns, rows, rowKey, caption }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; caption: string }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-ivory text-xs uppercase tracking-wide text-muted">
            <tr>{columns.map((c) => <th key={c.key} scope="col" className={cn("px-4 py-3 font-semibold", c.className)}>{c.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={rowKey(r)}>{columns.map((c) => <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>{c.render(r)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden" aria-label={caption}>
        {rows.map((r) => (
          <li key={rowKey(r)} className="rounded-lg border border-line bg-white p-4">
            <dl className="space-y-2 text-sm">
              {columns.map((c) => (
                <div key={c.key} className="flex justify-between gap-4"><dt className="text-muted">{c.header}</dt><dd className="text-right font-medium">{c.render(r)}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
