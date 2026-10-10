"use client";
import { useCallback, useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Skeleton, ErrorState } from "@/components/ui/misc";
import type { Column } from "@/components/ui/DataTable";
import { useActingAs } from "./ActingAs";

/* ── formatting (fixed locale/time zone so output is stable) ── */
const dt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const dtt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
export const fmtDate = (iso: string | null | undefined): string => (iso ? dt.format(new Date(iso)) : "—");
export const fmtDateTime = (iso: string | null | undefined): string => (iso ? dtt.format(new Date(iso)) : "—");

/* ── async loading with explicit loading / error states ── */
export type LoadState<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

/** `fn` must be stable (module-level or memoised); it is re-run only on retry. */
export function useLoad<T>(fn: () => Promise<T>): { state: LoadState<T>; retry: () => void } {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    fn().then(
      (data) => { if (live) setState({ status: "ready", data }); },
      (e: unknown) => { if (live) setState({ status: "error", message: e instanceof Error ? e.message : "Unknown error" }); },
    );
    return () => { live = false; };
  }, [fn, attempt]);
  const retry = useCallback(() => { setState({ status: "loading" }); setAttempt((a) => a + 1); }, []);
  return { state, retry };
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
    </div>
  );
}

export function AsyncView<T>({ state, retry, skeleton, children }: { state: LoadState<T>; retry: () => void; skeleton?: ReactNode; children: (d: T) => ReactNode }) {
  if (state.status === "loading") return <>{skeleton ?? <TableSkeleton />}</>;
  if (state.status === "error") return <ErrorState text={state.message} action={<button onClick={retry} className="min-h-9 rounded-md border border-danger px-4 text-sm font-semibold text-danger">Retry</button>} />;
  return <>{children(state.data)}</>;
}

/* ── layout atoms ── */
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-extrabold text-navy sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, children, actions, className, id }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string; id?: string }) {
  const hid = useId();
  return (
    <section aria-labelledby={title ? hid : undefined} id={id} className={cn("rounded-md border border-line bg-white", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          {title && <h2 id={hid} className="text-sm font-bold text-navy">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** Honest label: this action only changes local, in-memory demo state. */
export function SimulatedTag({ label = "Simulated" }: { label?: string }) {
  return <Badge tone="gold" className="uppercase tracking-wide">{label}</Badge>;
}

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";
const extraTones: Record<string, Tone> = {
  "Pending approval": "warning", "Blocked: evidence missing": "danger", "Received (demo)": "success", "Not received": "danger", "Not uploaded": "danger",
  "Failed verification": "danger", "Pending review": "warning", "Expiring soon": "warning", Expired: "danger", "Not matched": "danger", "Awaiting bank file": "warning",
  "Not applicable (cash)": "neutral", "Submitted for verification": "warning", "Draft result": "neutral", "Published (simulated)": "success", "Cancelled (simulated)": "danger",
  "Rescheduled (simulated)": "info", "Queued for reconciliation (simulated)": "info", "Matched (simulated)": "success", "Resolved (simulated)": "success",
};
export function StatusPill({ status }: { status: string }) {
  const tone = extraTones[status];
  return tone ? <Badge tone={tone}>{status}</Badge> : <StatusBadge status={status} />;
}

export function KpiTile({ label, value, hint, href }: { label: string; value: string; hint?: string; href: string }) {
  return (
    <Link href={href} className="group block rounded-md border border-line bg-white p-3.5 transition-colors hover:border-gold-antique focus-visible:border-gold-antique">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-navy">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted group-hover:text-ink">{hint}</p>}
    </Link>
  );
}

/** Tells the user what the current acting role can do on this page. */
export function MakerCheckerNote({ makerCan, checkerCan }: { makerCan: string; checkerCan: string }) {
  const { role } = useActingAs();
  return (
    <p className="mb-4 flex items-start gap-2 rounded-md border border-navy/20 bg-navy/5 px-3 py-2 text-xs text-navy">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong>Maker-checker (demo):</strong> acting as <strong>{role}</strong>. Maker: {makerCan} Checker: {checkerCan} Use the switch in the top bar to change role. This is a demonstration; a real system enforces separation of duties server-side.
      </span>
    </p>
  );
}

/* ── filter controls ── */
const ctl = "min-h-9 rounded-md border border-line bg-white px-2.5 text-sm text-ink focus:border-navy";
export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-muted">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={ctl}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
export function FilterSearch({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <div className="flex min-w-48 flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-muted">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(ctl, "w-full pl-8")} />
      </div>
    </div>
  );
}
export function FilterBar({ children, count, total }: { children: ReactNode; count?: number; total?: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-3 rounded-md border border-line bg-white p-3">
      {children}
      {count !== undefined && <p className="ml-auto self-center text-xs text-muted" role="status">Showing {count}{total !== undefined ? ` of ${total}` : ""}</p>}
    </div>
  );
}
export const allOption = (label: string) => ({ value: "all", label });

/* ── compact buttons ── */
export function SmallButton({ children, variant = "outline", className, ...p }: { variant?: "outline" | "solid" | "danger" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = variant === "solid" ? "bg-navy text-ivory hover:opacity-90" : variant === "danger" ? "border border-danger text-danger hover:bg-danger/5" : "border border-line text-navy hover:bg-ivory";
  return <button type="button" {...p} className={cn("inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50", v, className)}>{children}</button>;
}

/* ── dense responsive table: rows on md+, stacked cards on mobile ── */
export function AdminTable<T>({ columns, rows, rowKey, caption, empty }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; caption: string; empty?: ReactNode }) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-line bg-white md:block">
        <table className="w-full text-left text-[13px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-navy/5 text-[11px] uppercase tracking-wide text-navy">
            <tr>{columns.map((c) => <th key={c.key} scope="col" className={cn("whitespace-nowrap px-3 py-2 font-bold", c.className)}>{c.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={rowKey(r)} className="hover:bg-ivory/60">{columns.map((c) => <td key={c.key} className={cn("px-3 py-1.5 align-middle", c.className)}>{c.render(r)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden" aria-label={caption}>
        {rows.map((r) => (
          <li key={rowKey(r)} className="rounded-md border border-line bg-white p-3">
            <dl className="space-y-1.5 text-[13px]">
              {columns.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3"><dt className="shrink-0 text-muted">{c.header}</dt><dd className="min-w-0 text-right font-medium">{c.render(r)}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

export function KeyValue({ items }: { items: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.k} className="flex justify-between gap-3 border-b border-line/60 pb-1.5"><dt className="text-muted">{i.k}</dt><dd className="text-right font-medium">{i.v}</dd></div>
      ))}
    </dl>
  );
}

/** Shared validation wording for reason prompts. */
export const minReason = 8;
export const reasonError = `Enter a reason of at least ${minReason} characters.`;

/** Plain textarea with label, used inside dialogs (reason / notes). */
export function ReasonField({ label, value, onChange, error, hint }: { label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-ink">{label}</label>
      <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} rows={3} className={cn("w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus:border-navy", error && "border-danger")} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
