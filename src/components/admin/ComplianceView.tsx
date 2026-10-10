"use client";
import { useState } from "react";
import { AlertTriangle, Paperclip } from "lucide-react";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { company } from "@/config/company";
import { DEMO_NOW } from "@/data/adminDemo";
import type { ComplianceTask } from "@/data/types";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, PageHeader, Panel, ReasonField, SimulatedTag, SmallButton, StatusPill, fmtDate, fmtDateTime, minReason, reasonError, useLoad } from "./common";

const areas: ComplianceTask["area"][] = ["Scheme documentation", "KYC review", "AML alert", "Security document", "Registrar record", "Regulatory reporting"];
const areaTitle: Record<ComplianceTask["area"], string> = {
  "Scheme documentation": "Scheme documentation", "KYC review": "KYC reviews", "AML alert": "AML alerts", "Security document": "Security documents", "Registrar record": "Registrar-related records", "Regulatory reporting": "Regulatory reporting",
};

async function load() {
  const [tasks, docs, history] = await Promise.all([adminService.compliance(), adminExtraService.documents(), adminExtraService.complianceHistory()]);
  return { tasks, docs, history };
}

const contactLabels: Record<string, string> = { phone: "Contact phone", email: "Contact email", whatsapp: "WhatsApp number", registeredOffice: "Registered office (contact)", hours: "Business hours" };
const missingCompany = [
  ...company.verifiedFacts.filter((f) => f.value === null).map((f) => ({ group: "Verified fact", label: f.label })),
  ...Object.entries(company.contact).filter(([, v]) => v === null).map(([k]) => ({ group: "Contact", label: contactLabels[k] ?? k })),
];

const daysTo = (iso: string) => Math.ceil((new Date(iso).getTime() - new Date(DEMO_NOW).getTime()) / 86_400_000);

export function ComplianceView() {
  const { state, retry } = useLoad(load);
  const { audit, addAudit } = useAdminState();
  const toast = useToast();
  const [status, setStatus] = useState<Record<string, ComplianceTask["status"]>>({});
  const [notes, setNotes] = useState<Record<string, { at: string; ref: string; note: string }[]>>({});
  const [target, setTarget] = useState<ComplianceTask | null>(null);
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  const [errs, setErrs] = useState<{ ref?: string; note?: string }>({});

  return (
    <>
      <PageHeader title="Compliance" description="Obligations by area. A task is never complete without evidence; in this demo evidence cannot be stored, so nothing can reach 'Evidence attached'." />
      <AsyncView state={state} retry={retry}>
        {({ tasks, docs, history }) => {
          const cur = (t: ComplianceTask) => status[t.id] ?? t.status;
          const reminders = [
            ...tasks.filter((t) => t.due).map((t) => ({ id: t.id, label: t.title, due: t.due as string, kind: "Task" })),
            ...docs.filter((d) => d.expiry).map((d) => ({ id: d.id, label: `${d.type} (${d.scope} ${d.ref})`, due: d.expiry as string, kind: "Document expiry" })),
          ].sort((a, b) => a.due.localeCompare(b.due));
          const hist = [
            ...audit.filter((e) => e.action.startsWith("Attached evidence note")).map((e) => ({ id: e.id, at: e.at, actor: e.actor, text: `${e.entity}: ${e.reason}`, session: true })),
            ...history.map((h) => ({ id: h.id, at: h.at, actor: h.actor, text: `${h.taskId}: ${h.text}`, session: false })),
          ].sort((a, b) => b.at.localeCompare(a.at));

          return (
            <div className="space-y-5">
              <Panel title={`Missing company information (${missingCompany.length})`} id="missing-info">
                <p className="mb-3 text-sm">These fields in the company configuration are still empty. Public pages hide them; supply and verify each one before launch.</p>
                <ul className="grid gap-2 sm:grid-cols-2" aria-label="Missing company fields">
                  {missingCompany.map((m) => (
                    <li key={`${m.group}-${m.label}`} className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                      <span className="min-w-0 flex-1">{m.label}<span className="block text-xs text-muted">{m.group}</span></span>
                      <StatusPill status="Evidence missing" />
                    </li>
                  ))}
                  {missingCompany.length === 0 && <li>All fields supplied.</li>}
                </ul>
              </Panel>

              {areas.map((area) => {
                const rows = tasks.filter((t) => t.area === area);
                return (
                  <Panel key={area} title={areaTitle[area]}>
                    <AdminTable caption={`${areaTitle[area]} tasks`} rows={rows} rowKey={(t) => t.id}
                      empty={<EmptyState title="No tasks in this area" />}
                      columns={[
                        { key: "t", header: "Task", render: (t) => <span><strong>{t.title}</strong><span className="block text-xs text-muted">{t.note}</span>
                          {(notes[t.id] ?? []).map((n, i) => <span key={i} className="mt-1 block rounded bg-ivory px-2 py-1 text-xs">Evidence note ({n.ref}) — {n.note} <em>· local note, no file stored</em></span>)}</span> },
                        { key: "d", header: "Due", render: (t) => fmtDate(t.due) },
                        { key: "s", header: "Status", render: (t) => <StatusPill status={cur(t)} /> },
                        { key: "a", header: "Action", render: (t) => <SmallButton onClick={() => { setRef(""); setNote(""); setErrs({}); setTarget(t); }}><Paperclip className="h-3.5 w-3.5" aria-hidden />Attach evidence</SmallButton> },
                      ]} />
                  </Panel>
                );
              })}

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Expiry and due-date reminders">
                  <AdminTable caption="Reminders" rows={reminders} rowKey={(r) => `${r.kind}-${r.id}`}
                    columns={[
                      { key: "l", header: "Item", render: (r) => <span>{r.label}<span className="block text-xs text-muted">{r.kind}</span></span> },
                      { key: "d", header: "Due", render: (r) => fmtDate(r.due) },
                      { key: "r", header: "Remaining", render: (r) => { const n = daysTo(r.due); return <span className={n < 0 ? "font-semibold text-danger" : n <= 21 ? "font-semibold text-warning" : ""}>{n < 0 ? `${-n} days overdue` : `${n} days`}</span>; } },
                    ]} />
                  <p className="mt-2 text-xs text-muted">Counted from the fixed demo date, {fmtDate(DEMO_NOW)}.</p>
                </Panel>
                <Panel title="Review history">
                  <AdminTable caption="Review history" rows={hist} rowKey={(h) => h.id}
                    columns={[
                      { key: "at", header: "When", render: (h) => fmtDateTime(h.at) }, { key: "ac", header: "Actor", render: (h) => h.actor },
                      { key: "tx", header: "Entry", render: (h) => <span className="inline-flex flex-wrap items-center gap-1.5">{h.text}{h.session && <SimulatedTag label="This session" />}</span> },
                    ]} />
                </Panel>
              </div>

              <Dialog open={!!target} onOpenChange={(o) => { if (!o) setTarget(null); }} title="Attach evidence (placeholder)" description={target?.title}
                footer={<><SmallButton onClick={() => setTarget(null)}>Cancel</SmallButton><SmallButton variant="solid" onClick={() => {
                  const e: typeof errs = {};
                  if (ref.trim().length < 3) e.ref = "Enter a document reference or file name.";
                  if (note.trim().length < minReason) e.note = reasonError;
                  setErrs(e);
                  if (e.ref || e.note || !target) return;
                  setStatus((m) => ({ ...m, [target.id]: "In review" }));
                  setNotes((m) => ({ ...m, [target.id]: [{ at: new Date().toISOString(), ref: ref.trim(), note: note.trim() }, ...(m[target.id] ?? [])] }));
                  addAudit({ action: "Attached evidence note (local, no file)", entity: target.id, previous: cur(target), next: "In review", reason: `${ref.trim()}: ${note.trim()}` });
                  toast("Evidence note recorded locally. Status is In review, not Evidence attached.");
                  setTarget(null);
                }}>Record note</SmallButton></>}>
                <div className="space-y-4">
                  <p className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-warning">No file is uploaded or stored. This records a local note and sets the task to <strong>In review</strong>. A task can reach <strong>Evidence attached</strong> only after a real, verified document exists in a secure store, which needs a backend integration.</p>
                  <TextField label="Document reference / file name" value={ref} onChange={(e) => setRef(e.target.value)} error={errs.ref} />
                  <ReasonField label="Note" value={note} onChange={setNote} error={errs.note} />
                </div>
              </Dialog>
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
