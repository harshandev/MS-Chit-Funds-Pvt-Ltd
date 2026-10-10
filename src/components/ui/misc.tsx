import Link from "next/link";
import { ChevronRight, ChevronLeft, Inbox, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-[linear-gradient(110deg,var(--line)_30%,var(--ivory)_50%,var(--line)_70%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]", className)} aria-hidden />;
}
export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 ring-8 ring-gold/5"><Inbox className="h-7 w-7 text-gold-antique" /></span>
      <h3 className="mt-3 text-lg font-bold text-emerald">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function ErrorState({ title = "Something went wrong", text, action }: { title?: string; text?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-lg border border-danger/30 bg-danger/5 px-6 py-10 text-center">
      <AlertCircle className="h-8 w-8 text-danger" />
      <h3 className="mt-3 text-lg font-bold text-danger">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? <Link href={it.href} className="hover:text-emerald hover:underline">{it.label}</Link> : <span aria-current="page" className="font-semibold text-ink">{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-md px-3 font-semibold text-emerald disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
      <span className="text-muted">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-md px-3 font-semibold text-emerald disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
    </nav>
  );
}
/** Standard "illustrative" disclaimer used wherever data is not real. */
export function DemoNote({ children = "Illustrative demo data — not an actual scheme, quote or offer." }: { children?: ReactNode }) {
  return <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-medium text-[#6b5400]">{children}</p>;
}
