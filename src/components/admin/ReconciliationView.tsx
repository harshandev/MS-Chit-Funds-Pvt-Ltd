"use client";
import { useState } from "react";
import { adminService } from "@/services";
import { formatINR, formatINRPrecise } from "@/lib/money";
import type { ReconRow } from "@/data/types";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs } from "./ActingAs";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, KeyValue, MakerCheckerNote, PageHeader, ReasonField, SimulatedTag, SmallButton, StatusPill, allOption, fmtDate, minReason, reasonError, useLoad } from "./common";

const suggested: Record<ReconRow["status"], string> = {
  Matched: "No action needed. Gateway, bank and ledger agree.",
  "Missing in bank": "Wait for the next bank settlement file. If it does not arrive within the agreed settlement window, escalate to the bank with the gateway reference.",
  "Amount mismatch": "Compare the gateway fee schedule with the difference. If a documented fee deduction explains it, post a fee adjustment through the ledger with checker approval.",
  "Missing in ledger": "Verify that gateway and bank agree, then post the missing ledger entry through the normal posting process.",
  "Missing in gateway": "Identify the remitter from the bank narration. Do not credit any subscriber ledger until the payer is positively identified.",
};
const diff = (r: ReconRow) => {
  const v = [r.gateway ?? 0, r.bank ?? 0, r.ledger ?? 0];
  return Math.max(...v) - Math.min(...v);
};
const amt = (p: number | null) => (p === null ? <span className="text-danger">missing</span> : formatINR(p));

export function ReconciliationView() {
  const { state, retry } = useLoad(adminService.recon);
  const { role } = useActingAs();
  const { addAudit } = useAdminState();
  const toast = useToast();
  const [status, setStatus] = useState("exceptions");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ReconRow | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string>();

  return (
    <>
      <PageHeader title="Reconciliation" description="Gateway, bank and ledger side by side. Differences are computed as the spread between the highest and lowest of the three (a missing source counts as ₹0)." actions={<SimulatedTag />} />
      <MakerCheckerNote makerCan="review exceptions and prepare the reason." checkerCan="resolve an exception (simulated) with a recorded reason." />
      <AsyncView state={state} retry={retry}>
        {(rows) => {
          const shown = rows.filter((r) => (status === "all" || (status === "exceptions" ? r.status !== "Matched" : r.status === status)) && `${r.id} ${r.note} ${r.status}`.toLowerCase().includes(q.trim().toLowerCase()));
          return (
            <>
              <FilterBar count={shown.length} total={rows.length}>
                <FilterSearch label="Search rows" value={q} onChange={setQ} placeholder="Row ID or note…" />
                <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: "exceptions", label: "Exceptions only" }, allOption("All rows"), ...(["Matched", "Amount mismatch", "Missing in bank", "Missing in ledger", "Missing in gateway"] as const).map((s) => ({ value: s, label: s }))]} />
              </FilterBar>
              <AdminTable caption="Reconciliation rows" rows={shown} rowKey={(r) => r.id} empty={<EmptyState title="No rows match" text="Adjust the filters." />}
                columns={[
                  { key: "id", header: "Row", render: (r) => <span><strong>{r.id}</strong><span className="block text-xs text-muted">{fmtDate(r.date)}</span></span> },
                  { key: "g", header: "Gateway", render: (r) => amt(r.gateway), className: "text-right" },
                  { key: "b", header: "Bank", render: (r) => amt(r.bank), className: "text-right" },
                  { key: "l", header: "Ledger", render: (r) => amt(r.ledger), className: "text-right" },
                  { key: "d", header: "Difference", render: (r) => <strong className={diff(r) > 0 ? "text-danger" : "text-success"}>{formatINRPrecise(diff(r))}</strong>, className: "text-right" },
                  { key: "s", header: "Status", render: (r) => <span className="inline-flex flex-wrap items-center gap-1.5">{resolved[r.id] ? <StatusPill status="Resolved (simulated)" /> : <StatusPill status={r.status} />}</span> },
                  { key: "a", header: "Details", render: (r) => <SmallButton onClick={() => { setReason(""); setErr(undefined); setOpen(r); }} aria-label={`Open details for ${r.id}`}>Details</SmallButton> },
                ]} />
              <Dialog variant="drawer" open={!!open} onOpenChange={(o) => { if (!o) setOpen(null); }} title={open ? `Exception ${open.id}` : "Exception"} description="Review the evidence and the suggested action. Resolution is simulated.">
                {open && (
                  <div className="space-y-4">
                    <KeyValue items={[{ k: "Date", v: fmtDate(open.date) }, { k: "Status", v: <StatusPill status={resolved[open.id] ? "Resolved (simulated)" : open.status} /> }, { k: "Gateway", v: amt(open.gateway) }, { k: "Bank", v: amt(open.bank) }, { k: "Ledger", v: amt(open.ledger) }, { k: "Difference", v: formatINRPrecise(diff(open)) }]} />
                    <p className="text-muted">System note: {open.note || "None."}</p>
                    <div className="rounded-md bg-navy/5 p-3"><p className="text-xs font-bold uppercase tracking-wide text-navy">Suggested action</p><p className="mt-1">{suggested[open.status]}</p></div>
                    {resolved[open.id] ? (
                      <p className="rounded-md bg-success/10 px-3 py-2 text-success">Resolved (simulated): {resolved[open.id]}</p>
                    ) : open.status === "Matched" ? <p className="text-muted">Nothing to resolve.</p> : (
                      <div className="space-y-2">
                        <ReasonField label="Resolution reason (required)" value={reason} onChange={setReason} error={err} />
                        {role !== "Checker" && <p role="alert" className="text-xs font-medium text-warning">Only a Checker can resolve. Switch the acting role in the top bar.</p>}
                        <SmallButton variant="solid" disabled={role !== "Checker"} onClick={() => {
                          if (reason.trim().length < minReason) { setErr(reasonError); return; }
                          setResolved((m) => ({ ...m, [open.id]: reason.trim() }));
                          addAudit({ action: "Resolved reconciliation exception (simulated)", entity: open.id, previous: open.status, next: "Resolved (simulated)", reason: reason.trim(), approvalRef: `DEMO-APR-${open.id.toUpperCase()}` });
                          toast(`${open.id} resolved (simulated). No ledger or bank entry was changed.`);
                          setOpen(null);
                        }}>Resolve (simulated)</SmallButton>
                      </div>
                    )}
                  </div>
                )}
              </Dialog>
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
