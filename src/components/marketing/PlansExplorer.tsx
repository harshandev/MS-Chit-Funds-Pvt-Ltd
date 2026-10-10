"use client";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { schemeService } from "@/services";
import type { Scheme } from "@/data/types";
import { rupees } from "@/lib/money";
import { cn } from "@/lib/cn";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
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

const selectCls = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink focus:border-emerald";

function Sel({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>{children}</select>
    </label>
  );
}

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

export function PlansExplorer() {
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [f, setF] = useState<Filters>(initial);
  const [view, setView] = useState<"card" | "list">("card");

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

  if (failed) return <ErrorState title="Could not load schemes" text="Please try again." action={<Button onClick={() => window.location.reload()}>Reload</Button>} />;

  return (
    <div>
      <form role="search" aria-label="Filter chit plans" onSubmit={(e) => e.preventDefault()} className="rounded-lg border border-line bg-white p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Search schemes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search by name, amount or status" className="min-h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm focus:border-emerald" />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Sel label="Chit value" value={f.value} onChange={(v) => set("value", v)}>{Object.entries(valueBands).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}</Sel>
          <Sel label="Monthly instalment" value={f.inst} onChange={(v) => set("inst", v)}>{Object.entries(instBands).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}</Sel>
          <Sel label="Duration" value={f.dur} onChange={(v) => set("dur", v)}>{Object.entries(durBands).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}</Sel>
          <Sel label="Status" value={f.status} onChange={(v) => set("status", v)}>
            <option value="all">Any status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </Sel>
          <Sel label="Sort by" value={f.sort} onChange={(v) => set("sort", v as Sort)}>{sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Sel>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm font-semibold text-ink">
          {schemes ? `${results.length} of ${schemes.length} schemes` : "Loading schemes…"}
        </p>
        <div className="flex items-center gap-2">
          {dirty && <button onClick={() => setF(initial)} className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-semibold text-emerald hover:bg-emerald-50"><X className="h-4 w-4" />Clear filters</button>}
          <div role="group" aria-label="Layout" className="inline-flex overflow-hidden rounded-md border border-line bg-white">
            {([["card", LayoutGrid, "Card view"], ["list", List, "List view"]] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={label} className={cn("inline-flex h-11 w-11 items-center justify-center", view === v ? "bg-emerald text-ivory" : "text-muted hover:bg-ivory")}><Icon className="h-4 w-4" /></button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {!schemes ? (
          <div className={cn("grid gap-6", view === "card" ? "md:grid-cols-2 lg:grid-cols-3" : "")} aria-busy="true">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 w-full" />)}
          </div>
        ) : results.length === 0 ? (
          <EmptyState title="No schemes match these filters" text="Try widening your search or clearing the filters." action={<Button variant="secondary" onClick={() => setF(initial)}>Clear filters</Button>} />
        ) : (
          <ul className={cn("grid gap-6", view === "card" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
            {results.map((s) => <li key={s.id} className="flex"><div className="flex w-full"><SchemeCard scheme={s} layout={view} /></div></li>)}
          </ul>
        )}
      </div>
      <p className="mt-8 text-sm text-muted">All schemes shown are illustrative demo schemes. Participation, eligibility and commencement depend on approved scheme terms and regulatory requirements.</p>
    </div>
  );
}
