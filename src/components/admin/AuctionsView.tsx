"use client";
import { useState } from "react";
import { auctionService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { applyBps, formatBps, formatINR } from "@/lib/money";
import type { Auction } from "@/data/types";
import { DEMO_NOW } from "@/data/adminDemo";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { SelectField, TextField } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs, type ActingRole } from "./ActingAs";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, KeyValue, MakerCheckerNote, PageHeader, Panel, ReasonField, SimulatedTag, SmallButton, StatusPill, fmtDateTime, minReason, reasonError, useLoad } from "./common";

async function load() {
  const [auctions, schemes] = await Promise.all([auctionService.list(), adminExtraService.schemes()]);
  return { auctions, schemes };
}

type Stage = "Draft result" | "Submitted for verification" | "Published (simulated)";
interface Exc { kind: "Cancelled (simulated)" | "Rescheduled (simulated)"; reason: string; newDate?: string }

export function AuctionsView() {
  const { state, retry } = useLoad(load);
  const { role } = useActingAs();
  const { audit, addAudit } = useAdminState();
  const toast = useToast();
  const [selected, setSelected] = useState("auc-7");
  const [stage, setStage] = useState<Record<string, Stage>>({});
  const [submittedBy, setSubmittedBy] = useState<Record<string, ActingRole>>({});
  const [exc, setExc] = useState<Record<string, Exc>>({});
  const [publishing, setPublishing] = useState<Auction | null>(null);
  const [excFor, setExcFor] = useState<Auction | null>(null);
  const [kind, setKind] = useState<"cancel" | "reschedule">("cancel");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [errs, setErrs] = useState<{ reason?: string; date?: string }>({});

  const resetExc = () => { setReason(""); setDate(""); setErrs({}); setKind("cancel"); };

  return (
    <>
      <PageHeader title="Auctions" description="Schedule, configuration and result verification. No real auction takes place in this demo; all results are simulated placeholders." actions={<SimulatedTag />} />
      <MakerCheckerNote makerCan="submit a drafted result for verification." checkerCan="verify and publish a result submitted by a different role." />
      <AsyncView state={state} retry={retry}>
        {({ auctions, schemes }) => {
          const schemeOf = (a: Auction) => schemes.find((s) => s.id === a.schemeId);
          const stateOf = (a: Auction): string => exc[a.id]?.kind ?? (stage[a.id] === "Published (simulated)" ? "Published (simulated)" : a.state);
          const sel = auctions.find((a) => a.id === selected) ?? auctions[0];
          const selScheme = sel ? schemeOf(sel) : undefined;
          const queue = auctions.filter((a) => a.state === "Result pending verification" && !exc[a.id]);
          const stageOf = (a: Auction): Stage => stage[a.id] ?? "Draft result";
          const history = [
            ...audit.filter((e) => e.entity.startsWith("auc-")).map((e) => ({ id: e.id, at: e.at, actor: e.actor, text: `${e.action}${e.next ? ` → ${e.next}` : ""}: ${e.reason}`, session: true })),
            ...auctions.filter((a) => a.auditRef).map((a) => ({ id: a.auditRef ?? a.id, at: a.scheduledAt, actor: "system (demo)", text: `${a.id}: audit reference ${a.auditRef} (${a.state})`, session: false })),
          ].sort((x, y) => y.at.localeCompare(x.at));

          return (
            <div className="space-y-5">
              <Panel title="Schedule">
                <AdminTable caption="Auction schedule" rows={auctions} rowKey={(a) => a.id}
                  columns={[
                    { key: "id", header: "Auction", render: (a) => a.id },
                    { key: "s", header: "Scheme", render: (a) => schemeOf(a)?.name ?? a.schemeId },
                    { key: "n", header: "Instalment", render: (a) => `#${a.instalmentNo}` },
                    { key: "t", header: "Scheduled (simulated)", render: (a) => exc[a.id]?.newDate ? `${fmtDateTime(exc[a.id].newDate)} (new)` : fmtDateTime(a.scheduledAt) },
                    { key: "st", header: "State", render: (a) => <StatusPill status={stateOf(a)} /> },
                    { key: "ac", header: "Actions", render: (a) => (
                      <span className="inline-flex flex-wrap gap-1.5">
                        <SmallButton onClick={() => setSelected(a.id)} aria-pressed={sel?.id === a.id}>View config</SmallButton>
                        {["Scheduled", "Open", "Rescheduled"].includes(stateOf(a)) && <SmallButton variant="danger" onClick={() => { resetExc(); setExcFor(a); }}>Cancel / reschedule</SmallButton>}
                      </span>) },
                  ]} />
              </Panel>

              {sel && (
                <Panel title={`Configuration: ${sel.id}`} actions={<span className="text-xs text-muted">Select another auction above</span>}>
                  <KeyValue items={[
                    { k: "Scheme", v: selScheme?.name ?? sel.schemeId }, { k: "Instalment", v: `#${sel.instalmentNo}` },
                    { k: "Eligibility", v: sel.eligibility },
                    { k: "Maximum discount", v: selScheme ? `${formatBps(selScheme.rules.maxDiscountBps)} (${formatINR(applyBps(selScheme.rules.grossChit, selScheme.rules.maxDiscountBps))} on gross)` : "—" },
                    { k: "Foreman commission", v: selScheme ? formatBps(selScheme.rules.commissionBps) : "—" },
                    { k: "Tie-break rule", v: "Configurable per approved agreement (not configured in demo)" },
                  ]} />
                  <p className="mt-3 text-xs text-muted">Limits are read from the scheme rules and cannot be altered here. Illustrative only.</p>
                </Panel>
              )}

              <Panel title="Results awaiting verification" actions={<SimulatedTag />}>
                <p role="note" className="mb-3 rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-warning">These are demonstration values. No auction was actually conducted; publishing here is a simulation and notifies nobody.</p>
                <AdminTable caption="Results awaiting verification" rows={queue} rowKey={(a) => a.id}
                  empty={<EmptyState title="Nothing awaiting verification" text="Results appear here when an auction closes." />}
                  columns={[
                    { key: "a", header: "Auction", render: (a) => `${a.id} · instalment #${a.instalmentNo}` },
                    { key: "w", header: "Winning ticket (demo)", render: (a) => (a.winningTicket ? `#${a.winningTicket}` : "—") },
                    { key: "d", header: "Discount (demo)", render: (a) => (a.discountBps != null ? formatBps(a.discountBps) : "—") },
                    { key: "st", header: "Stage", render: (a) => <StatusPill status={stageOf(a)} /> },
                    { key: "ac", header: "Actions", render: (a) => {
                      const st = stageOf(a);
                      if (st === "Published (simulated)") return <span className="text-xs text-muted">Published (simulated)</span>;
                      if (st === "Draft result") return <SmallButton variant="solid" disabled={role !== "Maker"} title={role !== "Maker" ? "Switch to Maker to submit" : undefined} onClick={() => {
                        setStage((m) => ({ ...m, [a.id]: "Submitted for verification" })); setSubmittedBy((m) => ({ ...m, [a.id]: role }));
                        addAudit({ action: "Submitted auction result for verification (simulated)", entity: a.id, previous: "Draft result", next: "Submitted for verification", reason: "Maker submitted result for checker review" });
                        toast("Result submitted for verification (simulated).");
                      }}>Submit for verification</SmallButton>;
                      const same = submittedBy[a.id] === role;
                      return <SmallButton variant="solid" disabled={role !== "Checker" || same} title={role !== "Checker" ? "Switch to Checker to verify" : same ? "Same actor cannot verify own submission" : undefined} onClick={() => setPublishing(a)}>Verify &amp; publish</SmallButton>;
                    } },
                  ]} />
              </Panel>

              <Panel title="Audit history (auctions)">
                <AdminTable caption="Auction audit history" rows={history} rowKey={(h) => h.id}
                  columns={[
                    { key: "at", header: "When", render: (h) => fmtDateTime(h.at) }, { key: "ac", header: "Actor", render: (h) => h.actor },
                    { key: "tx", header: "Entry", render: (h) => <span className="inline-flex flex-wrap items-center gap-1.5">{h.text}{h.session && <SimulatedTag label="This session" />}</span> },
                  ]} />
              </Panel>

              <ConfirmDialog open={!!publishing} onOpenChange={(o) => { if (!o) setPublishing(null); }} title="Verify and publish result (simulated)?"
                description={`Publishes the DEMO result for ${publishing?.id ?? ""} in local state only. No customer is notified and no payout is created.`} confirmLabel="Verify & publish (simulated)"
                onConfirm={() => {
                  if (!publishing) return;
                  setStage((m) => ({ ...m, [publishing.id]: "Published (simulated)" }));
                  addAudit({ action: "Verified and published auction result (simulated)", entity: publishing.id, previous: "Submitted for verification", next: "Published (simulated)", reason: "Checker verified demo result", approvalRef: `DEMO-APR-${publishing.id.toUpperCase()}` });
                  toast("Result published (simulated).");
                }} />

              <Dialog open={!!excFor} onOpenChange={(o) => { if (!o) setExcFor(null); }} title="Auction exception" description={`Cancel or reschedule ${excFor?.id ?? ""}. Simulated, local state only.`}
                footer={<><SmallButton onClick={() => setExcFor(null)}>Cancel</SmallButton><SmallButton variant="solid" onClick={() => {
                  const e: typeof errs = {};
                  if (reason.trim().length < minReason) e.reason = reasonError;
                  if (kind === "reschedule" && (!date || new Date(date) <= new Date(DEMO_NOW))) e.date = "Choose a future date (after 10 Oct 2026, the demo date).";
                  setErrs(e);
                  if (e.reason || e.date || !excFor) return;
                  const k = kind === "cancel" ? "Cancelled (simulated)" : "Rescheduled (simulated)";
                  setExc((m) => ({ ...m, [excFor.id]: { kind: k, reason: reason.trim(), newDate: kind === "reschedule" ? date : undefined } }));
                  addAudit({ action: `${kind === "cancel" ? "Cancelled" : "Rescheduled"} auction (simulated)`, entity: excFor.id, previous: excFor.state, next: k, reason: reason.trim() });
                  toast(`${excFor.id} ${kind === "cancel" ? "cancelled" : "rescheduled"} (simulated).`);
                  setExcFor(null);
                }}>Record exception</SmallButton></>}>
                <div className="space-y-4">
                  <SelectField label="Action" value={kind} onChange={(e) => setKind(e.target.value as "cancel" | "reschedule")}>
                    <option value="cancel">Cancel auction</option><option value="reschedule">Reschedule auction</option>
                  </SelectField>
                  {kind === "reschedule" && <TextField label="New date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errs.date} />}
                  <ReasonField label="Reason (required)" value={reason} onChange={setReason} error={errs.reason} />
                </div>
              </Dialog>
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
