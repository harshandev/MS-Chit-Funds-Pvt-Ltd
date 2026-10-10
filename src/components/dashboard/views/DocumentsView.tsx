"use client";
import { useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/Badge";
import { TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";
import type { DocumentItem } from "@/data/types";
import { useTr } from "@/i18n/LanguageProvider";
import { DataGate, PageHeader } from "../ui";
import { schemeFor, type Snapshot } from "../DashboardData";

const order: DocumentItem["category"][] = ["Agreement", "Scheme document", "Receipt", "Auction statement", "Correspondence"];

function Documents({ d }: { d: Snapshot }) {
  const tr = useTr();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const items = d.documents.filter((x) => `${x.name} ${x.note} ${x.category} ${tr(x.name)} ${tr(x.note)} ${tr(x.category)}`.toLowerCase().includes(term));
  return (
    <>
      <PageHeader title={tr("Documents")} intro={tr("Agreements, receipts and statements related to your memberships. Documents appear here only when a verified file exists.")} />
      <div className="relative mb-6 max-w-md">
        <TextField label={tr("Search documents")} type="search" placeholder={tr("Search by name or category")} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted" aria-hidden />
      </div>
      {items.length === 0 ? <EmptyState title={tr("No documents found")} text={term ? tr("No document matches your search.") : tr("You have no documents yet.")} action={term ? <Button variant="secondary" onClick={() => setQ("")}>{tr("Clear search")}</Button> : undefined} /> : (
        <div className="space-y-8">
          {order.map((cat) => {
            const list = items.filter((x) => x.category === cat);
            if (list.length === 0) return null;
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`}>
                <h2 id={`cat-${cat}`} className="mb-3 text-base font-bold text-emerald">{tr(cat === "Receipt" ? "Receipts" : cat === "Agreement" ? "Agreements" : cat === "Scheme document" ? "Scheme documents" : cat === "Auction statement" ? "Auction statements" : cat)}</h2>
                <Stagger gap={0.05} className="divide-y divide-line overflow-hidden rounded-2xl border border-line/80 bg-white shadow-[var(--shadow-1)]">
                  {list.map((x) => {
                    const mem = x.membershipId ? d.memberships.find((m) => m.id === x.membershipId) : undefined;
                    const sc = mem ? schemeFor(d, mem.schemeId) : undefined;
                    return (
                      <StaggerItem key={x.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-emerald-50/60">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold-antique"><FileText className="h-5 w-5" aria-hidden /></span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">{tr(x.name)}</p>
                            <p className="text-xs text-muted">{x.fileUrl ? tr(x.note) : `${tr("No file available yet.")} ${tr(x.note)}`}</p>
                            {sc && <p className="mt-1 text-xs text-muted">{tr(sc.name)}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!x.fileUrl && <Badge tone="warning">{tr("Not available")}</Badge>}
                          {x.fileUrl
                            ? <a href={x.fileUrl} download className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald px-4 text-sm font-semibold text-ivory hover:bg-emerald-700"><Download className="h-4 w-4" aria-hidden />{tr("Download")}<span className="sr-only"> {tr(x.name)}</span></a>
                            : <Button variant="secondary" disabled aria-disabled="true"><Download className="h-4 w-4" aria-hidden />{tr("Download")}<span className="sr-only"> {tr("{name} (not available)", { name: tr(x.name) })}</span></Button>}
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function DocumentsView() { return <DataGate>{(d) => <Documents d={d} />}</DataGate>; }
