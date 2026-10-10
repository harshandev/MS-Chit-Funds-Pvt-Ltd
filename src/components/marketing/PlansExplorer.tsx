"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowUpDown, LayoutGrid, List, Search, SearchX, X } from "lucide-react";
import { schemeService } from "@/services";
import type { Scheme } from "@/data/types";
import { rupees } from "@/lib/money";
import { cn } from "@/lib/cn";
import { ErrorState, Skeleton } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { Spotlight } from "@/components/motion/Spotlight";
import { Tilt } from "@/components/motion/Tilt";
import { AnimatedNumber } from "@/components/motion/CountUp";
import { SchemeCard } from "./SchemeCard";

type Sort = "default" | "value-asc" | "value-desc" | "inst-asc" | "inst-desc" | "dur-asc" | "dur-desc";
interface Filters { q: string; value: string; inst: string; dur: string; status: string; sort: Sort }
const initial: Filters = { q: "", value: "all", inst: "all", dur: "all", status: "all", sort: "default" };

const L = (n: number) => rupees(n * 100000);
const valueBands: Record<string, { label: string; test: (p: number) => boolean }> = {
  all: { label: "Any chit value", test: () => true },
  lte3: { label: "Up to ₹3 lakh", test: (p) => p <= L(3) },
  "3to5": { label: "₹3 lakh to ₹5 lakh", test: (p) => p > L(3) && p <= L(5) },
  gt5: { label: "Above ₹5 lakh", test: (p) => p > L(5) },
};
const instBands: Record<string, { label: string; test: (p: number) => boolean }> = {
  all: { label: "Any instalment", test: () => true },
  lte5: { label: "Up to ₹5,000", test: (p) => p <= rupees(5000) },
  "5to15": { label: "₹5,001 to ₹15,000", test: (p) => p > rupees(5000) && p <= rupees(15000) },
  gt15: { label: "Above ₹15,000", test: (p) => p > rupees(15000) },
};
const durBands: Record<string, { label: string; test: (m: number) => boolean }> = {
  all: { label: "Any duration", test: () => true },
  lte24: { label: "Up to 24 months", test: (m) => m <= 24 },
  "25to30": { label: "25 to 30 months", test: (m) => m >= 25 && m <= 30 },
  gt30: { label: "Over 30 months", test: (m) => m > 30 },
};
const sorts: { value: Sort; label: string }[] = [
  { value: "default", label: "Recommended order" },
  { value: "value-asc", label: "Chit value: low to high" },
  { value: "value-desc", label: "Chit value: high to low" },
  { value: "inst-asc", label: "Instalment: low to high" },
  { value: "inst-desc", label: "Instalment: high to low" },
  { value: "dur-asc", label: "Duration: short to long" },
  { value: "dur-desc", label: "Duration: long to short" },
];

function sortSchemes(list: Scheme[], sort: Sort): Scheme[] {
  const key: Record<Exclude<Sort, "default">, (s: Scheme) => number> = {
    "value-asc": (s) => s.rules.grossChit, "value-desc": (s) => -s.rules.grossChit,
    "inst-asc": (s) => s.rules.instalment, "inst-desc": (s) => -s.rules.instalment,
    "dur-asc": (s) => s.rules.instalments, "dur-desc": (s) => -s.rules.instalments,
  };
  if (sort === "default") return list;
  const k = key[sort];
  return [...list].sort((a, b) => k(a) - k(b));
}

/** Animated single-select chip group (radio semantics). */
function ChipGroup({ legend, uid, value, onChange, options }: { legend: string; uid: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([k, label]) => {
          const on = value === k;
          return (
            <label key={k} className={cn("relative inline-flex min-h-10 cursor-pointer items-center rounded-full px-3.5 text-sm font-semibold ring-1 transition-colors focus-within:ring-4 focus-within:ring-gold/40", on ? "text-ivory ring-emerald" : "bg-white text-ink ring-line hover:text-emerald hover:ring-gold-antique")}>
              <input type="radio" name={uid} value={k} checked={on} onChange={() => onChange(k)} className="sr-only" />
              {on && <motion.span layoutId={`chip-${uid}`} aria-hidden className="absolute inset-0 rounded-full bg-emerald" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PlansExplorer() {
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [f, setF] = useState<Filters>(initial);
  const [view, setView] = useState<"card" | "list">("card");
  const reduce = useReducedMotion();

  useEffect(() => {
    let live = true;
    schemeService.list().then((s) => { if (live) setSchemes(s); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));
  const statuses = useMemo(() => Array.from(new Set((schemes ?? []).map((s) => s.status))), [schemes]);

  const results = useMemo(() => {
    if (!schemes) return [];
    const q = f.q.trim().toLowerCase();
    const filtered = schemes.filter((s) =>
      (!q || `${s.name} ${s.summary} ${s.status}`.toLowerCase().includes(q)) &&
      valueBands[f.value].test(s.rules.grossChit) &&
      instBands[f.inst].test(s.rules.instalment) &&
      durBands[f.dur].test(s.rules.instalments) &&
      (f.status === "all" || s.status === f.status));
    return sortSchemes(filtered, f.sort);
  }, [schemes, f]);

  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const activeCount = [f.q.trim() && 1, f.value !== "all" && 1, f.inst !== "all" && 1, f.dur !== "all" && 1, f.status !== "all" && 1].filter(Boolean).length;

  if (failed) return <ErrorState title="Could not load schemes" text="Please try again." action={<Button onClick={() => window.location.reload()}>Reload</Button>} />;

  const opt = (m: Record<string, { label: string }>): [string, string][] => Object.entries(m).map(([k, b]) => [k, b.label]);

  return (
    <div>
      <form role="search" aria-label="Filter chit plans" onSubmit={(e) => e.preventDefault()} className="rounded-2xl border border-line/80 bg-white p-4 shadow-[var(--shadow-2)] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search schemes</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input type="search" value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search by name, amount or status" className="min-h-12 w-full rounded-xl border border-line bg-ivory/60 pl-10 pr-3 text-sm transition focus:border-emerald focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald/10" />
          </label>
          <label className="relative block">
            <span className="sr-only">Sort by</span>
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <select value={f.sort} onChange={(e) => set("sort", e.target.value as Sort)} className="min-h-12 w-full appearance-none rounded-xl border border-line bg-ivory/60 pl-10 pr-8 text-sm font-semibold transition focus:border-emerald focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald/10 sm:w-64">{sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </label>
        </div>
        <LayoutGroup>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <ChipGroup legend="Chit value" uid="value" value={f.value} onChange={(v) => set("value", v)} options={opt(valueBands)} />
            <ChipGroup legend="Monthly instalment" uid="inst" value={f.inst} onChange={(v) => set("inst", v)} options={opt(instBands)} />
            <ChipGroup legend="Duration" uid="dur" value={f.dur} onChange={(v) => set("dur", v)} options={opt(durBands)} />
            <ChipGroup legend="Status" uid="status" value={f.status} onChange={(v) => set("status", v)} options={[["all", "Any status"], ...statuses.map((s): [string, string] => [s, s])]} />
          </div>
        </LayoutGroup>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm font-semibold text-ink">
          {schemes ? (
            <><span className="font-serif text-3xl italic text-emerald tabular-nums"><AnimatedNumber value={results.length} /></span> <span className="text-muted">of {schemes.length} schemes{activeCount > 0 ? ` · ${activeCount} filter${activeCount > 1 ? "s" : ""} on` : ""}</span></>
          ) : "Loading schemes…"}
        </p>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {dirty && (
              <motion.button key="clr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setF(initial)} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-emerald transition-colors hover:bg-emerald-50"><X className="h-4 w-4" />Clear filters</motion.button>
            )}
          </AnimatePresence>
          <div role="group" aria-label="Layout" className="relative inline-flex rounded-full border border-line bg-white p-1">
            {([["card", LayoutGrid, "Card view"], ["list", List, "List view"]] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={label} className={cn("relative inline-flex h-9 w-10 items-center justify-center rounded-full transition-colors", view === v ? "text-ivory" : "text-muted hover:text-emerald")}>
                {view === v && <motion.span layoutId="view-pill" aria-hidden className="absolute inset-0 rounded-full bg-emerald" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                <Icon className="relative h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {!schemes ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading schemes">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
          </div>
        ) : results.length === 0 ? (
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-3xl border border-dashed border-gold-antique/50 bg-white px-6 py-16 text-center">
            <motion.span animate={reduce ? undefined : { rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.2 }} className="grid h-20 w-20 place-items-center rounded-full bg-gold/15 ring-8 ring-gold/5"><SearchX className="h-9 w-9 text-gold-antique" /></motion.span>
            <h3 className="mt-5 font-serif text-3xl text-emerald">No schemes <span className="italic text-gold-antique">match</span> these filters</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">Try widening your search or clearing a filter or two.</p>
            <Button variant="secondary" className="mt-5" onClick={() => setF(initial)}>Clear filters</Button>
          </motion.div>
        ) : (
          <motion.ul layout className={cn("grid gap-6", view === "card" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
            <AnimatePresence mode="popLayout" initial={!reduce}>
              {results.map((s) => (
                <motion.li key={s.id} layout={reduce ? false : "position"} initial={reduce ? false : { opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} className="flex">
                  <Spotlight className="flex w-full rounded-2xl">
                    <Tilt max={view === "card" ? 4 : 1.5} className="relative flex w-full rounded-2xl"><SchemeCard scheme={s} layout={view} /></Tilt>
                  </Spotlight>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
      <p className="mt-8 text-sm text-muted">All schemes shown are illustrative demo schemes. Participation, eligibility and commencement depend on approved scheme terms and regulatory requirements.</p>
    </div>
  );
}
