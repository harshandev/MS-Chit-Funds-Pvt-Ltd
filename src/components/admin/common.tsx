"use client";
import { useCallback, useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/misc";
import { ShimmerBlock } from "@/components/ui/fx";
import { Sparkline } from "@/components/ui/Sparkline";
import { CountUp, AnimatedNumber } from "@/components/motion/CountUp";
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
      <ShimmerBlock className="h-8 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => <ShimmerBlock key={i} className="h-10 w-full" />)}
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
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-navy sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, children, actions, className, id }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string; id?: string }) {
  const hid = useId();
  return (
    <section aria-labelledby={title ? hid : undefined} id={id} className={cn("rounded-xl border border-line/80 bg-white shadow-[var(--shadow-1),0_8px_24px_-14px_rgb(11_31_58/0.18)]", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-4 py-3">
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

export interface KpiDelta { text: string; tone: "up" | "down" | "flat" | "warn" | "ok"; /** whether the arrow icon should show */ arrow?: boolean }
const deltaCls: Record<KpiDelta["tone"], string> = {
  up: "bg-success/10 text-success", ok: "bg-success/10 text-success", down: "bg-danger/10 text-danger", warn: "bg-warning/10 text-warning", flat: "bg-navy/10 text-navy",
};
/** Animated delta chip: pops in, arrow icon for direction. */
export function DeltaChip({ delta }: { delta: KpiDelta }) {
  const reduce = useReducedMotion();
  return (
    <motion.span initial={reduce ? false : { opacity: 0, scale: 0.7, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.5 }}
      className={cn("inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[11px] font-bold", deltaCls[delta.tone])}>
      {delta.arrow && (delta.tone === "down" ? <ArrowDownRight className="h-3 w-3" aria-hidden /> : <ArrowUpRight className="h-3 w-3" aria-hidden />)}
      {delta.text}
    </motion.span>
  );
}

export function KpiTile({ label, value, hint, href, count, format, delta, spark, sparkLabel }: {
  label: string; value: string; hint?: string; href: string;
  /** When set, the figure counts up to this number (formatted by `format`) instead of showing `value` statically. */
  count?: number; format?: (n: number) => string; delta?: KpiDelta; spark?: number[]; sparkLabel?: string;
}) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-xl border border-line/80 bg-white p-3.5 shadow-[var(--shadow-1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[var(--shadow-2)] focus-visible:border-gold-antique">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-gold-antique to-gold transition-transform duration-500 group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
        {delta && <DeltaChip delta={delta} />}
      </div>
      <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums text-navy">
        {count !== undefined ? <CountUp value={count} format={format} /> : value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted group-hover:text-ink">{hint}</p>}
      {spark && spark.length > 1 && <div className="mt-2"><Sparkline values={spark} label={sparkLabel} stroke="var(--navy)" /></div>}
    </Link>
  );
}

/** Tells the user what the current acting role can do on this page. */
export function MakerCheckerNote({ makerCan, checkerCan }: { makerCan: string; checkerCan: string }) {
  const { role } = useActingAs();
  return (
    <p className="mb-4 flex items-start gap-2 rounded-xl border border-navy/15 bg-navy/5 px-3 py-2.5 text-xs text-navy">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong>Maker-checker (demo):</strong> acting as <strong>{role}</strong>. Maker: {makerCan} Checker: {checkerCan} Use the switch in the top bar to change role. This is a demonstration; a real system enforces separation of duties server-side.
      </span>
    </p>
  );
}

/* ── filter controls ── */
const ctl = "min-h-9 rounded-lg border border-line bg-white px-2.5 text-sm text-ink focus:border-navy";
/** Few options: animated chip group with a sliding highlight. Many options: native select. Same props either way. */
export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId();
  if (options.length <= 6) {
    return (
      <div className="flex flex-col gap-1">
        <span id={id} className="text-xs font-semibold text-muted">{label}</span>
        <LayoutGroup id={id}>
          <div role="group" aria-labelledby={id} className="flex flex-wrap gap-1.5">
            {options.map((o) => {
              const on = value === o.value;
              return (
                <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(o.value)}
                  className={cn("relative min-h-9 rounded-full border px-3 text-[13px] font-semibold transition-colors", on ? "border-transparent text-ivory" : "border-line bg-white text-ink hover:border-navy/40 hover:bg-navy/5")}>
                  {on && <motion.span layoutId="fchip" className="absolute inset-0 rounded-full bg-navy" transition={{ type: "spring", stiffness: 450, damping: 34 }} />}
                  <span className="relative">{o.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    );
  }
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
/** Filter bar: sticky under the top bar on md+, with a live (animated) result count. */
export function FilterBar({ children, count, total }: { children: ReactNode; count?: number; total?: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-line/80 bg-white/90 p-3 shadow-[var(--shadow-1)] backdrop-blur-md md:sticky md:top-14 md:z-20">
      {children}
      {count !== undefined && <p className="ml-auto self-center text-xs text-muted" role="status">Showing <strong className="tabular-nums text-ink"><AnimatedNumber value={count} /></strong>{total !== undefined ? ` of ${total}` : ""}</p>}
    </div>
  );
}
export const allOption = (label: string) => ({ value: "all", label });

/* ── compact buttons ── */
export function SmallButton({ children, variant = "outline", className, ...p }: { variant?: "outline" | "solid" | "danger" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = variant === "solid" ? "bg-navy text-ivory shadow-[var(--shadow-1)] hover:bg-navy/90 hover:shadow-[var(--shadow-2)]" : variant === "danger" ? "border border-danger text-danger hover:bg-danger/5" : "border border-line text-navy hover:bg-ivory";
  return <button type="button" {...p} className={cn("inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-[background-color,transform,box-shadow] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100", v, className)}>{children}</button>;
}

/* ── dense responsive table: rows on md+, stacked cards on mobile ── */
const rowIn = (i: number, reduce: boolean | null) => ({ initial: reduce ? false as const : { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: Math.min(i, 12) * 0.025, ease: [0.22, 1, 0.36, 1] as const } });
export function AdminTable<T>({ columns, rows, rowKey, caption, empty }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; caption: string; empty?: ReactNode }) {
  const reduce = useReducedMotion();
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-line/80 bg-white shadow-[var(--shadow-1)] md:block">
        <table className="w-full text-left text-[13px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-navy/5 text-[11px] uppercase tracking-wide text-navy">
            <tr>{columns.map((c) => <th key={c.key} scope="col" className={cn("whitespace-nowrap px-3 py-2.5 font-bold", c.className)}>{c.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.map((r, i) => (
              <motion.tr key={rowKey(r)} {...rowIn(i, reduce)} className="transition-colors hover:bg-navy/[0.035] [&>td:first-child]:transition-shadow hover:[&>td:first-child]:shadow-[inset_3px_0_0_var(--gold-antique)]">
                {columns.map((c) => <td key={c.key} className={cn("px-3 py-2 align-middle", c.className)}>{c.render(r)}</td>)}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden" aria-label={caption}>
        {rows.map((r, i) => (
          <motion.li key={rowKey(r)} {...rowIn(i, reduce)} className="rounded-xl border border-line/80 bg-white p-3 shadow-[var(--shadow-1)]">
            <dl className="space-y-1.5 text-[13px]">
              {columns.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3"><dt className="shrink-0 text-muted">{c.header}</dt><dd className="min-w-0 text-right font-medium">{c.render(r)}</dd></div>
              ))}
            </dl>
          </motion.li>
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
