"use client";
import { useState } from "react";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { formatINR } from "@/lib/money";
import type { Payout } from "@/data/types";
import type { PayoutMeta } from "@/data/adminDemo";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs, type ActingRole } from "./ActingAs";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, MakerCheckerNote, PageHeader, ReasonField, SimulatedTag, SmallButton, StatusPill, allOption, minReason, reasonError, useLoad } from "./common";

async function load() {
  const base = await adminService.payouts();
  const [payouts, meta] = await Promise.all([adminExtraService.payouts(base), adminExtraService.payoutMeta()]);
  return { payouts, meta };
}
interface Local { status: Payout["status"]; raisedBy: ActingRole | null; reason?: string }

export function PayoutsView() {
  const { state, retry } = useLoad(load);
  const { role } = useActingAs();
  const { addAudit } = useAdminState();
  const toast = useToast();
  const [ov, setOv] = useState<Record<string, Local>>({});
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [deciding, setDeciding] = useState<Payout | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string>();

  return (
    <>
      <PageHeader title="Payouts" description="Prize, refund and security-release requests. No money moves from this console: approval is a simulated state change." actions={<SimulatedTag />} />
      <MakerCheckerNote makerCan="submit a request with complete documents to a checker." checkerCan="approve or reject a request raised by a different role (the same actor cannot approve their own request)." />
      <AsyncView state={state} retry={retry}>
        {({ payouts, meta }) => {
          const metaOf = (id: string): PayoutMeta | undefined => meta[id];
          const cur = (p: Payout): Local => ov[p.id] ?? { status: p.status, raisedBy: metaOf(p.id)?.raisedBy?.includes("maker") ? "Maker" : null, reason: p.reason };
          const rows = payouts.filter((p) => (status === "all" || cur(p).status === status) && `${p.id} ${p.auctionId} ${metaOf(p.id)?.kind ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
          const set = (p: Payout, patch: Partial<Local>) => setOv((m) => ({ ...m, [p.id]: { ...cur(p), ...patch } }));
          const docsOk = (p: Payout) => (metaOf(p.id)?.docs ?? []).every((d) => d.state === "Received (demo)");

          const actions = (p: Payout) => {
            const c = cur(p);
            if (c.status === "Awaiting maker") {
              const ok = docsOk(p);
              return (
                <span className="flex flex-col gap-1">
                  <SmallButton variant="solid" disabled={role !== "Maker" || !ok} title={role !== "Maker" ? "Switch to Maker" : !ok ? "Required documents incomplete" : undefined} onClick={() => {
                    set(p, { status: "Awaiting checker", raisedBy: role });
                    addAudit({ action: "Submitted payout request to checker (simulated)", entity: p.id, previous: "Awaiting maker", next: "Awaiting checker", reason: "Documents complete; maker submitted" });
                    toast(`${p.id} sent to checker (simulated).`);
                  }}>Submit to checker</SmallButton>
                  {!ok && <span className="text-xs text-danger">Blocked: required documents incomplete.</span>}
                </span>
              );
            }
            if (c.status === "Awaiting checker") {
              const own = c.raisedBy === role;
              return (
                <span className="flex flex-col gap-1">
                  <SmallButton variant="solid" disabled={role !== "Checker" || own} title={own ? "Same actor cannot approve own request" : role !== "Checker" ? "Switch to Checker" : undefined} onClick={() => { setNote(""); setErr(undefined); setDeciding(p); }}>Review &amp; decide</SmallButton>
                  {own && <span className="text-xs text-warning">Raised by you; a different actor must decide.</span>}
                </span>
              );
            }
            if (c.status === "Failed") return <SmallButton disabled={role !== "Maker"} title={role !== "Maker" ? "Switch to Maker" : undefined} onClick={() => {
              set(p, { status: "Awaiting maker", raisedBy: null, reason: undefined });
              addAudit({ action: "Re-opened failed payout request (simulated)", entity: p.id, previous: "Failed", next: "Awaiting maker", reason: "Re-opened for correction" });
              toast(`${p.id} re-opened (simulated). Required documents must still be complete.`);
            }}>Re-open request</SmallButton>;
            return <span className="text-xs text-muted">No action</span>;
          };

          return (
            <>
              <FilterBar count={rows.length} total={payouts.length}>
                <FilterSearch label="Search payouts" value={q} onChange={setQ} placeholder="ID, auction, type…" />
                <FilterSelect label="Approval status" value={status} onChange={setStatus} options={[allOption("All statuses"), ...(["Awaiting maker", "Awaiting checker", "Approved (simulated)", "Rejected", "Failed"] as const).map((s) => ({ value: s, label: s }))]} />
              </FilterBar>
              <AdminTable caption="Payout requests" rows={rows} rowKey={(p) => p.id} empty={<EmptyState title="No payout requests match" text="Adjust the filters." />}
                columns={[
                  { key: "id", header: "Request", render: (p) => <span><strong>{p.id}</strong><span className="block text-xs text-muted">{metaOf(p.id)?.kind ?? "Payout"} · {p.auctionId} · ticket #{p.ticket}</span></span> },
                  { key: "amt", header: "Amount", render: (p) => formatINR(p.amount), className: "text-right" },
                  { key: "docs", header: "Required documents", render: (p) => (
                    <ul className="space-y-0.5 text-left text-xs">{(metaOf(p.id)?.docs ?? p.docsRequired.map((n) => ({ name: n, state: "Not received" as const }))).map((d) => <li key={d.name} className="flex items-center justify-between gap-2"><span>{d.name}</span><StatusPill status={d.state} /></li>)}</ul>) },
                  { key: "st", header: "Approval status", render: (p) => <span className="inline-flex flex-wrap items-center gap-1.5"><StatusPill status={cur(p).status} />{cur(p).status === "Approved (simulated)" && <SimulatedTag />}</span> },
                  { key: "rs", header: "Reason / failure", render: (p) => <span className="text-xs text-muted">{cur(p).reason ?? "—"}</span> },
                  { key: "ac", header: "Actions", render: actions },
                ]} />
              <Dialog open={!!deciding} onOpenChange={(o) => { if (!o) setDeciding(null); }} title="Checker decision" description={`${deciding?.id ?? ""}: ${deciding ? formatINR(deciding.amount) : ""}. Approval is simulated and moves no money.`}
                footer={<>
                  <SmallButton variant="danger" onClick={() => {
                    if (note.trim().length < minReason) { setErr(reasonError); return; }
                    if (!deciding) return;
                    set(deciding, { status: "Rejected", reason: note.trim() });
                    addAudit({ action: "Rejected payout request (simulated)", entity: deciding.id, previous: "Awaiting checker", next: "Rejected", reason: note.trim() });
                    toast(`${deciding.id} rejected (simulated).`); setDeciding(null);
                  }}>Reject</SmallButton>
                  <SmallButton variant="solid" onClick={() => {
                    if (note.trim().length < minReason) { setErr(reasonError); return; }
                    if (!deciding) return;
                    set(deciding, { status: "Approved (simulated)", reason: note.trim() });
                    addAudit({ action: "Approved payout request (simulated)", entity: deciding.id, previous: "Awaiting checker", next: "Approved (simulated)", reason: note.trim(), approvalRef: `DEMO-APR-${deciding.id.toUpperCase()}` });
                    toast(`${deciding.id} approved (simulated). No payment instruction was sent.`); setDeciding(null);
                  }}>Approve (simulated)</SmallButton></>}>
                <div className="space-y-3">
                  {deciding && <ul className="space-y-1 text-xs">{(metaOf(deciding.id)?.docs ?? []).map((d) => <li key={d.name} className="flex justify-between"><span>{d.name}</span><StatusPill status={d.state} /></li>)}</ul>}
                  <ReasonField label="Decision note (required)" value={note} onChange={setNote} error={err} />
                </div>
              </Dialog>
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
