"use client";
import { useState } from "react";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { formatINR } from "@/lib/money";
import type { PaymentStatus } from "@/data/types";
import type { AdminPayment } from "@/data/adminDemo";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs } from "./ActingAs";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, MakerCheckerNote, PageHeader, Panel, SimulatedTag, SmallButton, StatusPill, allOption, fmtDate, useLoad } from "./common";

async function load() {
  const [payments, customers, schemes] = await Promise.all([adminExtraService.payments(), adminService.customers(), adminExtraService.schemes()]);
  return { payments, customers, schemes };
}
interface Override { status: PaymentStatus; recon: string }
type PayView = Omit<AdminPayment, "recon"> & { recon: string };

export function PaymentsView() {
  const { state, retry } = useLoad(load);
  const { role } = useActingAs();
  const { addAudit } = useAdminState();
  const toast = useToast();
  const [ov, setOv] = useState<Record<string, Override>>({});
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [recon, setRecon] = useState("all");
  const [matching, setMatching] = useState<PayView | null>(null);

  return (
    <>
      <PageHeader title="Payments" description="Instalment payments across customers with gateway and bank reconciliation state. Actions here are simulated and never instruct a real gateway or bank." actions={<SimulatedTag />} />
      <MakerCheckerNote makerCan="mark Pending, Failed or unmatched payments for reconciliation." checkerCan="record a (simulated) bank match, the only way a payment can become Successful after Failed or Pending." />
      <AsyncView state={state} retry={retry}>
        {({ payments, customers, schemes }) => {
          const view = (p: AdminPayment): PayView => ({ ...p, ...(ov[p.id] ?? {}) });
          const list = payments.map(view);
          const cname = (id: string) => customers.find((c) => c.id === id)?.name ?? id;
          const sname = (id: string) => schemes.find((s) => s.id === id)?.name ?? id;
          const isException = (p: { status: PaymentStatus; recon: string }) => ["Failed", "Pending", "Under reconciliation"].includes(p.status) || p.recon === "Not matched";
          const rows = list.filter((p) =>
            (status === "all" || p.status === status) && (recon === "all" || p.recon === recon) &&
            `${p.reference} ${p.gatewayRef ?? ""} ${cname(p.customerId)}`.toLowerCase().includes(q.trim().toLowerCase()));
          const exceptions = list.filter(isException);
          const reconOpts = [...new Set(list.map((p) => p.recon))];

          const actions = (p: PayView) => {
            const queued = p.recon.startsWith("Queued");
            const canMark = (p.status === "Failed" || p.status === "Pending" || p.recon === "Not matched") && !queued;
            const canMatch = p.status === "Under reconciliation" || queued;
            return (
              <span className="inline-flex flex-wrap gap-1.5">
                {canMark && <SmallButton onClick={() => {
                  setOv((m) => ({ ...m, [p.id]: { status: "Under reconciliation", recon: "Queued for reconciliation (simulated)" } }));
                  addAudit({ action: "Marked payment for reconciliation (simulated)", entity: p.reference, previous: p.status, next: "Under reconciliation", reason: `Queued by ${role}` });
                  toast(`${p.reference} queued for reconciliation (simulated). Status is not Successful.`);
                }}>Mark for reconciliation</SmallButton>}
                {canMatch && <SmallButton variant="solid" disabled={role !== "Checker"} title={role !== "Checker" ? "Switch to Checker" : undefined} onClick={() => setMatching(p)}>Record bank match</SmallButton>}
                {!canMark && !canMatch && <span className="text-xs text-muted">No action</span>}
              </span>
            );
          };

          const cols = [
            { key: "ref", header: "Payment ref", render: (p: PayView) => <span className="font-mono text-xs">{p.reference}</span> },
            { key: "gw", header: "Gateway ref", render: (p: PayView) => <span className="font-mono text-xs">{p.gatewayRef ?? "—"}</span> },
            { key: "c", header: "Customer", render: (p: PayView) => <span>{cname(p.customerId)}<span className="block text-xs text-muted">{sname(p.schemeId)}</span></span> },
            { key: "i", header: "Instalment", render: (p: PayView) => `#${p.instalmentNo}` },
            { key: "d", header: "Date", render: (p: PayView) => fmtDate(p.date) },
            { key: "a", header: "Amount", render: (p: PayView) => formatINR(p.amount), className: "text-right" },
            { key: "s", header: "Status", render: (p: PayView) => <StatusPill status={p.status} /> },
            { key: "r", header: "Bank reconciliation", render: (p: PayView) => <StatusPill status={p.recon} /> },
            { key: "x", header: "Actions", render: actions },
          ];
          return (
            <div className="space-y-5">
              <Panel title={`Exception queue (${exceptions.length})`} actions={<SimulatedTag />}>
                <AdminTable caption="Payment exception queue" rows={exceptions} rowKey={(p) => p.id} columns={cols}
                  empty={<EmptyState title="No payment exceptions" text="Every payment is matched." />} />
              </Panel>
              <section aria-label="All payments">
                <FilterBar count={rows.length} total={list.length}>
                  <FilterSearch label="Search payments" value={q} onChange={setQ} placeholder="Payment ref, gateway ref, customer…" />
                  <FilterSelect label="Payment status" value={status} onChange={setStatus} options={[allOption("All statuses"), ...(["Pending", "Successful", "Failed", "Refunded", "Under reconciliation"] as const).map((s) => ({ value: s, label: s }))]} />
                  <FilterSelect label="Reconciliation" value={recon} onChange={setRecon} options={[allOption("All"), ...reconOpts.map((s) => ({ value: s, label: s }))]} />
                </FilterBar>
                <AdminTable caption="All payments" rows={rows} rowKey={(p) => p.id} columns={cols} empty={<EmptyState title="No payments match" text="Adjust the filters." />} />
              </section>
              <ConfirmDialog open={!!matching} onOpenChange={(o) => { if (!o) setMatching(null); }} title="Record bank match (simulated)?"
                description={`Treat ${matching?.reference ?? ""} as matched to a bank credit and set it to Successful. This is a simulation: no real bank record is read and no instruction is sent.`} confirmLabel="Record match (simulated)"
                onConfirm={() => {
                  if (!matching) return;
                  setOv((m) => ({ ...m, [matching.id]: { status: "Successful", recon: "Matched (simulated)" } }));
                  addAudit({ action: "Recorded reconciliation match (simulated)", entity: matching.reference, previous: ov[matching.id]?.status ?? matching.status, next: "Successful", reason: "Checker recorded bank match", approvalRef: `DEMO-APR-${matching.id.toUpperCase()}` });
                  toast(`${matching.reference} marked Successful via reconciliation match (simulated).`);
                }} />
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
