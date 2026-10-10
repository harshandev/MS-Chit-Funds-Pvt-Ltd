"use client";
import { useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import type { Scheme, SchemeStatus } from "@/data/types";
import { adminExtraService } from "@/services/adminExtra";
import { Dialog } from "@/components/ui/Dialog";
import { SelectField } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/ui/Badge";
import { useActingAs } from "./ActingAs";
import { useAdminState, schemeTransitions, type SchemeRequest } from "./AdminState";
import { AdminTable, ReasonField, SimulatedTag, SmallButton, StatusPill, fmtDateTime, minReason, reasonError, useLoad, AsyncView } from "./common";

/** Evidence required before any scheme may become Active. */
export function EvidenceChecklist() {
  const { state, retry } = useLoad(adminExtraService.evidence);
  return (
    <AsyncView state={state} retry={retry}>
      {(items) => (
        <ul className="space-y-2" aria-label="Commencement evidence checklist">
          {items.map((e) => (
            <li key={e.id} className="flex items-start gap-3 rounded-md border border-line p-3">
              {e.status === "Evidence attached" ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" aria-hidden /> : <CircleAlert className="mt-0.5 h-4 w-4 text-danger" aria-hidden />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{e.label}</p>
                <p className="text-xs text-muted">{e.note}</p>
              </div>
              <StatusPill status={e.status} />
            </li>
          ))}
        </ul>
      )}
    </AsyncView>
  );
}

export function RequestChangeDialog({ scheme, open, onOpenChange }: { scheme: Scheme; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { raiseRequest, requests } = useAdminState();
  const { role } = useActingAs();
  const toast = useToast();
  const options = schemeTransitions[scheme.status];
  const [target, setTarget] = useState<SchemeStatus | "">("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<{ target?: string; reason?: string }>({});
  const pending = requests.find((r) => r.schemeId === scheme.id && r.state === "Pending approval");

  const submit = () => {
    const e: typeof err = {};
    if (!target) e.target = "Choose the requested status.";
    if (reason.trim().length < minReason) e.reason = reasonError;
    setErr(e);
    if (e.target || e.reason || !target) return;
    raiseRequest(scheme.id, scheme.status, target, reason.trim());
    toast(`Request raised as ${role}: ${scheme.status} → ${target}. Status unchanged until a checker decides.`);
    setTarget(""); setReason(""); onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Request status change" description={`${scheme.name} is currently "${scheme.status}". A request does not change the scheme: it goes to a checker.`}
      footer={<><SmallButton onClick={() => onOpenChange(false)}>Cancel</SmallButton><SmallButton variant="solid" onClick={submit} disabled={!!pending || options.length === 0}>Raise request as {role}</SmallButton></>}>
      <div className="space-y-4">
        {pending && <p role="alert" className="rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-warning">A request ({pending.from} → {pending.to}) is already pending approval for this scheme.</p>}
        {options.length === 0 && <p className="text-xs text-muted">No further transitions are available from {scheme.status}.</p>}
        <SelectField label="Requested status" value={target} onChange={(e) => setTarget(e.target.value as SchemeStatus | "")} error={err.target} disabled={options.length === 0}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </SelectField>
        {target === "Active" && <p className="rounded-md bg-danger/5 px-3 py-2 text-xs text-danger">Activation needs the approved scheme agreement and commencement approval. Neither is attached in this demo, so approval of this request will be blocked.</p>}
        <ReasonField label="Reason for change" value={reason} onChange={setReason} error={err.reason} hint="Recorded in the local audit trail." />
        <p className="text-xs text-muted"><SimulatedTag /> Raising a request here only creates a local record in your browser session.</p>
      </div>
    </Dialog>
  );
}

function DecideDialog({ request, scheme, onClose }: { request: SchemeRequest | null; scheme: Scheme | undefined; onClose: () => void }) {
  const { decideRequest } = useAdminState();
  const { role } = useActingAs();
  const toast = useToast();
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string>();
  if (!request) return null;
  const sameRole = role === request.raisedBy;
  const run = (decision: "approve" | "reject") => {
    if (note.trim().length < minReason) { setErr(reasonError); return; }
    const res = decideRequest(request.id, decision, note.trim());
    toast(res.message, res.ok ? "ok" : "error");
    setNote(""); setErr(undefined); onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) { setNote(""); setErr(undefined); onClose(); } }} title="Checker decision"
      description={`${scheme?.name ?? request.schemeId}: ${request.from} → ${request.to}, raised by ${request.raisedBy}.`}
      footer={<><SmallButton variant="danger" disabled={sameRole || role !== "Checker"} onClick={() => run("reject")}>Reject</SmallButton><SmallButton variant="solid" disabled={sameRole || role !== "Checker"} onClick={() => run("approve")}>Approve (simulated)</SmallButton></>}>
      <div className="space-y-4">
        <p className="text-xs text-muted">Reason given by maker: {request.reason}</p>
        {(sameRole || role !== "Checker") && <p role="alert" className="rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-warning">Only a Checker who did not raise this request can decide it. Switch the acting role in the top bar.</p>}
        {request.to === "Active" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-danger">Activation evidence: Evidence missing. Approval will be recorded but the Active transition will be blocked.</p>
            <EvidenceChecklist />
          </div>
        )}
        <ReasonField label="Decision note" value={note} onChange={setNote} error={err} />
        <p className="text-xs text-muted"><SimulatedTag /> Other transitions are simulated in local state only; no real scheme is changed.</p>
      </div>
    </Dialog>
  );
}

/** Table of requests; Checker can open the decision dialog. */
export function RequestsTable({ requests, schemes, showScheme = true }: { requests: SchemeRequest[]; schemes: Scheme[]; showScheme?: boolean }) {
  const [deciding, setDeciding] = useState<SchemeRequest | null>(null);
  const { role } = useActingAs();
  const name = (id: string) => schemes.find((s) => s.id === id)?.name ?? id;
  return (
    <>
      <AdminTable
        caption="Scheme status change requests"
        rows={requests}
        rowKey={(r) => r.id}
        empty={<p className="rounded-md border border-dashed border-line bg-white p-4 text-center text-xs text-muted">No status change requests yet.</p>}
        columns={[
          ...(showScheme ? [{ key: "scheme", header: "Scheme", render: (r: SchemeRequest) => name(r.schemeId) }] : []),
          { key: "change", header: "Change", render: (r) => <span className="inline-flex items-center gap-1.5"><StatusBadge status={r.from} />→<StatusBadge status={r.to} /></span> },
          { key: "by", header: "Raised by", render: (r) => `${r.raisedBy} · ${fmtDateTime(r.raisedAt)}` },
          { key: "state", header: "State", render: (r) => <span className="inline-flex flex-wrap items-center gap-1.5"><StatusPill status={r.state} />{r.state === "Approved (simulated)" && <SimulatedTag />}</span> },
          { key: "act", header: "Action", render: (r) => r.state === "Pending approval"
            ? <SmallButton onClick={() => setDeciding(r)} disabled={role !== "Checker"} title={role !== "Checker" ? "Switch to Checker to decide" : undefined}>Review &amp; decide</SmallButton>
            : <span className="text-xs text-muted">{r.decidedBy ? `${r.decidedBy} · ${fmtDateTime(r.decidedAt)}` : "—"}</span> },
        ]}
      />
      <DecideDialog request={deciding} scheme={schemes.find((s) => s.id === deciding?.schemeId)} onClose={() => setDeciding(null)} />
    </>
  );
}
