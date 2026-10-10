"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState, DemoNote } from "@/components/ui/misc";
import { formatBps, formatINR } from "@/lib/money";
import type { Auction, AuctionState } from "@/data/types";
import { DataGate, FilterChips, PageHeader } from "../ui";
import { schemeFor, type Snapshot } from "../DashboardData";
import { formatDateTime } from "../format";

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
  return (
    <Card>
      <CardBody className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2"><StatusBadge status={a.state} /><span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ivory">SIMULATED</span></div>
        <h3 className="mt-3 font-heading font-bold text-emerald">{s?.name ?? a.schemeId}</h3>
        <p className="text-sm text-muted">Instalment {a.instalmentNo} · {formatDateTime(a.scheduledAt)}</p>
        {a.state === "Result published" && <p className="mt-2 text-sm">Winning ticket <strong>{a.winningTicket}</strong> at {formatBps(a.discountBps ?? 0)} discount{s && a.discountBps != null ? ` (gross ${formatINR(s.rules.grossChit)})` : ""}</p>}
        {a.state === "Result pending verification" && <p className="mt-2 text-sm text-muted">Provisional result is unverified.</p>}
        <Link href={`/dashboard/auctions/${a.id}`} className="mt-4 inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-emerald hover:underline">View auction<ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </CardBody>
    </Card>
  );
}

function Auctions({ d }: { d: Snapshot }) {
  const [filter, setFilter] = useState("all");
  const countOf = (g: Group) => d.auctions.filter((a) => g.states.includes(a.state)).length;
  const visible = groups.filter((g) => filter === "all" || g.key === filter);
  return (
    <>
      <PageHeader title="Auctions" intro="Auctions for the schemes you belong to. All auctions in this demo are simulated; results are never authoritative." />
      <div className="mb-6 space-y-3">
        <DemoNote>SIMULATED AUCTIONS. Times are shown as scheduled; production uses server-side time and validation.</DemoNote>
        <FilterChips label="Filter by auction state" value={filter} onChange={setFilter}
          options={[{ value: "all", label: "All", count: d.auctions.length }, ...groups.map((g) => ({ value: g.key, label: g.label, count: countOf(g) }))]} />
      </div>
      {d.auctions.length === 0 ? <EmptyState title="No auctions yet" text="Auctions for your schemes will be listed here." /> : (
        <div className="space-y-8">
          {visible.map((g) => {
            const items = d.auctions.filter((a) => g.states.includes(a.state)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
            if (filter === "all" && items.length === 0) return null;
            return (
              <section key={g.key} aria-labelledby={`g-${g.key}`}>
                <h2 id={`g-${g.key}`} className="mb-3 text-base font-bold text-emerald">{g.label} <span className="font-normal text-muted">({items.length})</span></h2>
                {items.length === 0 ? <p className="text-sm text-muted">No auctions in this state.</p> : <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((a) => <li key={a.id}><AuctionCard a={a} d={d} /></li>)}</ul>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function AuctionsView() { return <DataGate>{(d) => <Auctions d={d} />}</DataGate>; }
