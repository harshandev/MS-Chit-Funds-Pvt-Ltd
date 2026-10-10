"use client";
import { useId, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Check, Clock3, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";
import { ErrorState } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { ShimmerBlock, PulseDot } from "@/components/ui/fx";
import { Sparkline } from "@/components/ui/Sparkline";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Spotlight } from "@/components/motion/Spotlight";
import { Tilt } from "@/components/motion/Tilt";
import { useDashboard, type Snapshot } from "./DashboardData";

export function PageHeader({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-emerald sm:text-3xl">{title}</h1>
        <motion.span aria-hidden className="mt-2 block h-1 w-12 origin-left rounded-full bg-gold" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} />
        {intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PanelTitle({ children, id, action }: { children: ReactNode; id?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="font-heading text-base font-bold text-emerald sm:text-lg">{children}</h2>
      {action}
    </div>
  );
}

/** Layered, softly rounded surface used for every dashboard card. */
export function Surface({ className, hover, ...p }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return <div className={cn("min-w-0 rounded-2xl border border-line/80 bg-white shadow-[var(--shadow-1),0_8px_24px_-12px_rgb(24_37_31/0.12)]", hover && "transition-shadow duration-300 hover:shadow-[var(--shadow-3)]", className)} {...p} />;
}

export function StatCard({ label, value, hint, icon, accent, spark, sparkLabel, ring }: {
  label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; accent?: boolean; spark?: number[]; sparkLabel?: string; ring?: { value: number; label: string };
}) {
  return (
    <Tilt className="relative h-full rounded-2xl">
      <Spotlight className={cn("h-full overflow-hidden rounded-2xl border bg-white p-4 shadow-[var(--shadow-1),0_8px_24px_-12px_rgb(24_37_31/0.12)] sm:p-5", accent ? "border-gold/60 bg-linear-to-br from-white to-gold/10" : "border-line/80")}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
          {icon && <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", accent ? "bg-gold/25 text-gold-antique" : "bg-emerald-50 text-emerald")} aria-hidden>{icon}</span>}
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="min-w-0 break-words font-heading text-2xl font-extrabold tabular-nums tracking-tight text-emerald">{value}</p>
          {ring && <ProgressRing value={ring.value} size={46} stroke={5} label={ring.label}><span className="text-[10px] font-bold tabular-nums text-emerald">{Math.round(ring.value)}%</span></ProgressRing>}
        </div>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
        {spark && spark.length > 0 && <div className="mt-3"><Sparkline values={spark} label={sparkLabel} stroke={accent ? "var(--gold-antique)" : "var(--emerald)"} /></div>}
      </Spotlight>
    </Tilt>
  );
}

export function DefList({ rows, className, reveal }: { rows: { label: string; value: ReactNode }[]; className?: string; reveal?: boolean }) {
  const reduce = useReducedMotion();
  if (reveal && !reduce) {
    return (
      <motion.dl className={cn("divide-y divide-line text-sm", className)} initial="hide" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={{ hide: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}>
        {rows.map((r) => (
          <motion.div key={r.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5" variants={{ hide: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}>
            <dt className="text-muted">{r.label}</dt>
            <dd className="min-w-0 break-words text-right font-medium text-ink">{r.value}</dd>
          </motion.div>
        ))}
      </motion.dl>
    );
  }
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

/** Filter chips with a sliding highlight (shared layoutId) and live counts. */
export function FilterChips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  const gid = useId();
  return (
    <LayoutGroup id={gid}>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(o.value)}
              className={cn("relative min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors", on ? "border-transparent text-ivory" : "border-line bg-white text-ink hover:border-emerald/60 hover:bg-emerald-50")}>
              {on && <motion.span layoutId="chip-pill" className="absolute inset-0 rounded-full bg-emerald shadow-[0_4px_14px_-4px_rgb(6_78_59/0.6)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{o.label}{o.count !== undefined && <span className="ml-1.5 tabular-nums opacity-70">({o.count})</span>}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

type ChipTone = "ok" | "wait" | "bad" | "info" | "gold" | "idle";
const chipTone: Record<string, ChipTone> = {
  Successful: "ok", Verified: "ok", Active: "ok", "Result published": "ok", Resolved: "ok",
  Pending: "wait", "Under reconciliation": "wait", "In progress": "wait", "Under review": "wait", "Result pending verification": "wait", "Action required": "wait", "Enrolment pending": "wait", "In review": "wait",
  Failed: "bad", Rejected: "bad", Cancelled: "bad", Suspended: "bad",
  Open: "info", Scheduled: "info", Rescheduled: "info", Prized: "gold",
};
const chipCls: Record<ChipTone, string> = {
  ok: "bg-success/10 text-success ring-success/20", wait: "bg-warning/10 text-warning ring-warning/25", bad: "bg-danger/10 text-danger ring-danger/20",
  info: "bg-navy/10 text-navy ring-navy/15", gold: "bg-gold/20 text-gold-antique ring-gold/40", idle: "bg-line/60 text-ink ring-line",
};
/** Status chip with an animated icon: pulsing dot for in-progress, drawn tick for success. */
export function StatusChip({ status }: { status: string }) {
  const tone = chipTone[status] ?? "idle";
  const reduce = useReducedMotion();
  const tr = useTr();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={status} initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", chipCls[tone])}>
        {tone === "wait" ? <PulseDot /> : tone === "ok" ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : tone === "bad" ? <X className="h-3 w-3" strokeWidth={3} aria-hidden /> : tone === "info" ? <Clock3 className="h-3 w-3" aria-hidden /> : null}
        {tr(status)}
      </motion.span>
    </AnimatePresence>
  );
}

export function PageSkeleton() {
  const tr = useTr();
  return (
    <div aria-busy="true" aria-label={tr("Loading")}>
      <ShimmerBlock className="h-9 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => <ShimmerBlock key={i} className="h-32 rounded-2xl" />)}
      </div>
      <ShimmerBlock className="mt-6 h-64 w-full rounded-2xl" />
    </div>
  );
}

/** Shows loading skeleton / error state, then renders children with loaded data. */
export function DataGate({ children }: { children: (d: Snapshot) => ReactNode }) {
  const { status, data, error, retry } = useDashboard();
  const tr = useTr();
  if (status === "loading") return <PageSkeleton />;
  if (status === "error" || !data) {
    return <ErrorState title={tr("We couldn't load your data")} text={tr(error ?? "Please try again.")} action={<Button onClick={retry}>{tr("Try again")}</Button>} />;
  }
  return <>{children(data)}</>;
}
