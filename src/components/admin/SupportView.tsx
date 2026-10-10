"use client";
import { useState } from "react";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { DEMO_NOW, supportAgents, type AdminTicket } from "@/data/adminDemo";
import type { SupportTicket } from "@/data/types";
import { Dialog } from "@/components/ui/Dialog";
import { SelectField } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs } from "./ActingAs";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, PageHeader, ReasonField, SimulatedTag, SmallButton, StatusPill, allOption, fmtDateTime, useLoad } from "./common";

async function load() {
  const [tickets, customers] = await Promise.all([adminExtraService.tickets(), adminService.customers()]);
  return { tickets, customers };
}
interface Local { status?: SupportTicket["status"]; assignee?: string | null; replies: { at: string; by: string; text: string }[] }

function sla(t: AdminTicket, status: SupportTicket["status"]) {
  const due = new Date(new Date(t.openedAt).getTime() + t.slaHours * 3_600_000);
  if (status === "Resolved") return { text: `${t.slaHours}h SLA · resolved`, tone: "text-muted", due };
  const hrs = Math.round((due.getTime() - new Date(DEMO_NOW).getTime()) / 3_600_000);
  return hrs < 0 ? { text: `Breached by ${-hrs}h`, tone: "font-semibold text-danger", due } : { text: `${hrs}h left`, tone: hrs <= 12 ? "font-semibold text-warning" : "", due };
}

export function SupportView() {
  const { state, retry } = useLoad(load);
  const { role } = useActingAs();
  const { addAudit } = useAdminState();
  const toast = useToast();
  const [ov, setOv] = useState<Record<string, Local>>({});
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [open, setOpen] = useState<AdminTicket | null>(null);
  const [text, setText] = useState("");
  const [newStatus, setNewStatus] = useState<SupportTicket["status"]>("In progress");
  const [err, setErr] = useState<string>();

  const loc = (id: string): Local => ov[id] ?? { replies: [] };

  return (
    <>
      <PageHeader title="Support" description="Customer complaint queue with assignment, responses and SLA. Replies are stored locally and never sent to customers in this demo." actions={<SimulatedTag />} />
      <AsyncView state={state} retry={retry}>
        {({ tickets, customers }) => {
          const st = (t: AdminTicket) => loc(t.id).status ?? t.status;
          const as = (t: AdminTicket) => (loc(t.id).assignee !== undefined ? loc(t.id).assignee : t.assignee);
          const cname = (id: string) => customers.find((c) => c.id === id)?.name ?? id;
          const rows = tickets.filter((t) => (status === "all" || st(t) === status) && (assigned === "all" || (assigned === "none" ? !as(t) : as(t) === assigned)) && `${t.id} ${t.subject} ${cname(t.customerId)}`.toLowerCase().includes(q.trim().toLowerCase()));
          const thread = open ? [...open.history.map((h) => ({ ...h, by: h.by as string })), ...loc(open.id).replies] : [];
          return (
            <>
              <FilterBar count={rows.length} total={tickets.length}>
                <FilterSearch label="Search tickets" value={q} onChange={setQ} placeholder="ID, subject, customer…" />
                <FilterSelect label="Status" value={status} onChange={setStatus} options={[allOption("All statuses"), ...(["Open", "In progress", "Awaiting customer", "Resolved"] as const).map((s) => ({ value: s, label: s }))]} />
                <FilterSelect label="Assignee" value={assigned} onChange={setAssigned} options={[allOption("Anyone"), { value: "none", label: "Unassigned" }, ...supportAgents.map((a) => ({ value: a, label: a }))]} />
              </FilterBar>
              <AdminTable caption="Complaint queue" rows={rows} rowKey={(t) => t.id} empty={<EmptyState title="No tickets match" text="Adjust the filters." />}
                columns={[
                  { key: "id", header: "Ticket", render: (t) => <span><strong>{t.id}</strong><span className="block text-xs text-muted">{t.subject}</span></span> },
                  { key: "c", header: "Customer", render: (t) => <span>{cname(t.customerId)}<span className="block text-xs text-muted">{t.category}</span></span> },
                  { key: "s", header: "Status", render: (t) => <StatusPill status={st(t)} /> },
                  { key: "as", header: "Assignee", render: (t) => (
                    <span className="inline-block">
                      <select aria-label={`Assignee for ${t.id}`} value={as(t) ?? ""} onChange={(e) => {
                        const v = e.target.value || null;
                        setOv((m) => ({ ...m, [t.id]: { ...loc(t.id), assignee: v } }));
                        addAudit({ action: "Assigned support ticket (local)", entity: t.id, previous: as(t) ?? "Unassigned", next: v ?? "Unassigned", reason: `Assigned by ${role}` });
                        toast(`${t.id} assigned to ${v ?? "nobody"}.`);
                      }} className="min-h-8 rounded-md border border-line bg-white px-2 text-xs">
                        <option value="">Unassigned</option>
                        {supportAgents.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </span>) },
                  { key: "sla", header: "SLA", render: (t) => { const s = sla(t, st(t)); return <span className={s.tone}>{s.text}<span className="block text-xs font-normal text-muted">due {fmtDateTime(s.due.toISOString())}</span></span>; } },
                  { key: "a", header: "Actions", render: (t) => <SmallButton onClick={() => { setText(""); setErr(undefined); setNewStatus(st(t) === "Open" ? "In progress" : st(t)); setOpen(t); }}>Respond</SmallButton> },
                ]} />
              <Dialog variant="drawer" open={!!open} onOpenChange={(o) => { if (!o) setOpen(null); }} title={open ? `${open.id}: ${open.subject}` : "Ticket"} description="Replies are saved locally only."
                footer={<><SmallButton onClick={() => setOpen(null)}>Close</SmallButton><SmallButton variant="solid" onClick={() => {
                  if (text.trim().length < 3) { setErr("Enter a reply of at least 3 characters."); return; }
                  if (!open) return;
                  setOv((m) => ({ ...m, [open.id]: { ...loc(open.id), status: newStatus, replies: [...loc(open.id).replies, { at: new Date().toISOString(), by: "Support", text: text.trim() }] } }));
                  addAudit({ action: "Replied to support ticket (local)", entity: open.id, previous: st(open), next: newStatus, reason: text.trim().slice(0, 80) });
                  toast("Reply saved locally (not sent to the customer).");
                  setText("");
                }}>Add reply</SmallButton></>}>
                {open && (
                  <div className="space-y-4">
                    <ol className="space-y-2" aria-label="Conversation">
                      {thread.map((m, i) => <li key={i} className={m.by === "Support" ? "ml-6 rounded-md bg-navy/5 px-3 py-2" : "mr-6 rounded-md bg-ivory px-3 py-2"}><p>{m.text}</p><p className="mt-1 text-xs text-muted">{m.by} · {fmtDateTime(m.at)}</p></li>)}
                    </ol>
                    <ReasonField label="Your reply" value={text} onChange={setText} error={err} />
                    <SelectField label="Set status after reply" value={newStatus} onChange={(e) => setNewStatus(e.target.value as SupportTicket["status"])}>
                      {(["Open", "In progress", "Awaiting customer", "Resolved"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
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
