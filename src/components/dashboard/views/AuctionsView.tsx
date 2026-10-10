"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { CardBody } from "@/components/ui/Card";
import { StepTracker } from "@/components/ui/StepTracker";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { EmptyState, DemoNote } from "@/components/ui/misc";
import { formatBps, formatINR } from "@/lib/money";
import { useTr } from "@/i18n/LanguageProvider";
import type { Auction, AuctionState } from "@/data/types";
import { DataGate, FilterChips, PageHeader, StatusChip, Surface } from "../ui";
import { auctionSteps } from "../auctionSteps";
import { schemeFor, type Snapshot } from "../DashboardData";
import { useDates } from "../format";

type Group = { key: string; label: string; states: AuctionState[] };
const groups: Group[] = [
  { key: "Scheduled", label: "Scheduled", states: ["Scheduled"] },
  { key: "Open", label: "Open", states: ["Open"] },
  { key: "Closed", label: "Closed", states: ["Closed"] },
  { key: "Pending", label: "Result pending verification", states: ["Result pending verification"] },
  { key: "Published", label: "Result published", states: ["Result published"] },
  { key: "Cancelled", label: "Cancelled / rescheduled", states: ["Cancelled", "Rescheduled"] },
];

function AuctionCard({ a, d }: { a: Auction; d: Snapshot }) {
  const s = schemeFor(d, a.schemeId);
  const tr = useTr();
  const { formatDateTime } = useDates();
  const steps = auctionSteps(a.state, tr);
  const reduce = useReducedMotion();
  return (
    <motion.div whileHover={reduce ? undefined : { y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="h-full">
      <Surface hover className="h-full">
        <CardBody className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-2"><StatusChip status={a.state} /><span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ivory">{tr("SIMULATED")}</span></div>
          <h3 className="mt-3 font-heading font-bold text-emerald">{s ? tr(s.name) : a.schemeId}</h3>
          <p className="text-sm text-muted">{tr("Instalment {n}", { n: a.instalmentNo })} · {formatDateTime(a.scheduledAt)}</p>
          {steps ? <StepTracker steps={steps} label={tr("Lifecycle of auction for instalment {n}", { n: a.instalmentNo })} compact className="mt-4" /> : <p className="mt-4 rounded-xl bg-line/50 px-3 py-2 text-xs text-muted">{a.state === "Cancelled" ? tr("Cancelled: no result exists.") : tr("Rescheduled: a new schedule will be notified.")}</p>}
          {a.state === "Result published" && <p className="mt-3 text-sm">{tr(s && a.discountBps != null ? "Winning ticket {n} at {pct} discount (gross {amt})" : "Winning ticket {n} at {pct} discount", { n: a.winningTicket ?? "", pct: formatBps(a.discountBps ?? 0), amt: s ? formatINR(s.rules.grossChit) : "" })}</p>}
          {a.state === "Result pending verification" && <p className="mt-3 text-sm text-muted">{tr("Provisional result is unverified.")}</p>}
          <Link href={`/dashboard/auctions/${a.id}`} className="group mt-auto inline-flex min-h-11 items-center gap-1 self-start pt-4 text-sm font-semibold text-emerald"><span className="underline-offset-4 group-hover:underline">{tr("View auction")}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></Link>
        </CardBody>
      </Surface>
    </motion.div>
  );
}

function Auctions({ d }: { d: Snapshot }) {
  const tr = useTr();
  const [filter, setFilter] = useState("all");
  const countOf = (g: Group) => d.auctions.filter((a) => g.states.includes(a.state)).length;
  const visible = groups.filter((g) => filter === "all" || g.key === filter);
  return (
    <>
      <PageHeader title={tr("Auctions")} intro={tr("Auctions for the schemes you belong to. All auctions in this demo are simulated; results are never authoritative.")} />
      <div className="mb-6 space-y-3">
        <DemoNote>{tr("SIMULATED AUCTIONS. Times are shown as scheduled; production uses server-side time and validation.")}</DemoNote>
        <FilterChips label={tr("Filter by auction state")} value={filter} onChange={setFilter}
          options={[{ value: "all", label: tr("All"), count: d.auctions.length }, ...groups.map((g) => ({ value: g.key, label: tr(g.label), count: countOf(g) }))]} />
      </div>
      {d.auctions.length === 0 ? <EmptyState title={tr("No auctions yet")} text={tr("Auctions for your schemes will be listed here.")} /> : (
        <div className="space-y-8">
          {visible.map((g) => {
            const items = d.auctions.filter((a) => g.states.includes(a.state)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
            if (filter === "all" && items.length === 0) return null;
            return (
              <section key={g.key} aria-labelledby={`g-${g.key}`}>
                <h2 id={`g-${g.key}`} className="mb-3 text-base font-bold text-emerald">{tr(g.label)} <span className="font-normal text-muted">({items.length})</span></h2>
                {items.length === 0 ? <p className="text-sm text-muted">{tr("No auctions in this state.")}</p> : <Stagger key={`${filter}-${g.key}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((a) => <StaggerItem key={a.id}><AuctionCard a={a} d={d} /></StaggerItem>)}</Stagger>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function AuctionsView() { return <DataGate>{(d) => <Auctions d={d} />}</DataGate>; }
