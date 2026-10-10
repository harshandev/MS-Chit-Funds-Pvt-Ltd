"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton, ErrorState } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { useDashboard, type Snapshot } from "./DashboardData";

export function PageHeader({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold text-emerald sm:text-3xl">{title}</h1>
        {intro && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PanelTitle({ children, id, action }: { children: ReactNode; id?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="text-base font-bold text-emerald sm:text-lg">{children}</h2>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, accent }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-[var(--shadow-1)] sm:p-5", accent ? "border-gold/60" : "border-line")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {icon && <span className="text-gold-antique" aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 break-words font-heading text-2xl font-extrabold tracking-tight text-emerald">{value}</p>
      {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

export function DefList({ rows, className }: { rows: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line text-sm", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
          <dt className="text-muted">{r.label}</dt>
          <dd className="min-w-0 break-words text-right font-medium text-ink">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FilterChips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors", value === o.value ? "border-emerald bg-emerald text-ivory" : "border-line bg-white text-ink hover:border-emerald")}>
          {o.label}{o.count !== undefined && <span className="ml-1.5 opacity-70">({o.count})</span>}
        </button>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}

/** Shows loading skeleton / error state, then renders children with loaded data. */
export function DataGate({ children }: { children: (d: Snapshot) => ReactNode }) {
  const { status, data, error, retry } = useDashboard();
  if (status === "loading") return <PageSkeleton />;
  if (status === "error" || !data) {
    return <ErrorState title="We couldn't load your data" text={error ?? "Please try again."} action={<Button onClick={retry}>Try again</Button>} />;
  }
  return <>{children(data)}</>;
}
