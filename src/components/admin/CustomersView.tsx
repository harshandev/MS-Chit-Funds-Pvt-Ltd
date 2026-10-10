"use client";
import { useState } from "react";
import { Eye, EyeOff, UserRound } from "lucide-react";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { formatINR } from "@/lib/money";
import type { Customer } from "@/data/types";
import type { AdminPayment, AdminTicket, CustomerProfile } from "@/data/adminDemo";
import type { Scheme } from "@/data/types";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs } from "./ActingAs";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, KeyValue, PageHeader, ReasonField, SmallButton, StatusPill, allOption, fmtDate, fmtDateTime, minReason, useLoad } from "./common";

async function load() {
  const [customers, profiles, schemes, payments, tickets] = await Promise.all([
    adminService.customers(), adminExtraService.customerProfiles(), adminExtraService.schemes(), adminExtraService.payments(), adminExtraService.tickets(),
  ]);
  return { customers, profiles, schemes, payments, tickets };
}
type Data = Awaited<ReturnType<typeof load>>;

interface LocalNote { id: string; at: string; by: string; text: string }

function ProfileBody({ customer, profile, data, notes, onAddNote }: { customer: Customer; profile: CustomerProfile | undefined; data: Data; notes: LocalNote[]; onAddNote: (text: string) => void }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState<string>();
  const { role } = useActingAs();
  const schemeName = (id: string) => data.schemes.find((s: Scheme) => s.id === id)?.name ?? id;
  const pays: AdminPayment[] = data.payments.filter((p) => p.customerId === customer.id);
  const tix: AdminTicket[] = data.tickets.filter((t) => profile?.supportTicketIds.includes(t.id));
  const allNotes = [...notes, ...(profile?.notes ?? [])];
  const h = "mb-1.5 mt-5 text-sm font-bold text-navy";
  return (
    <div>
      <KeyValue items={[{ k: "Customer ID", v: customer.id }, { k: "KYC", v: <StatusPill status={customer.kyc} /> }, { k: "Bank verification", v: <StatusPill status={customer.bank} /> }, { k: "Outstanding", v: formatINR(customer.outstanding) }]} />
      <h3 className={h}>Memberships</h3>
      {profile && profile.memberships.length > 0 ? (
        <ul className="space-y-1">{profile.memberships.map((m) => <li key={`${m.schemeId}-${m.ticketNo}`} className="flex justify-between gap-2 rounded-md border border-line px-3 py-1.5"><span>{schemeName(m.schemeId)} · ticket #{m.ticketNo}</span><StatusPill status={m.status} /></li>)}</ul>
      ) : <p className="text-muted">No memberships.</p>}
      <h3 className={h}>Payment history summary</h3>
      {profile && <p className="mb-2 text-muted">{profile.paymentSummary.successful} successful · {profile.paymentSummary.failed} failed · {profile.paymentSummary.underReconciliation} under reconciliation · last payment {fmtDate(profile.paymentSummary.lastPaymentDate)}</p>}
      {pays.length > 0 && <ul className="space-y-1">{pays.slice(0, 5).map((p) => <li key={p.id} className="flex justify-between gap-2 text-xs"><span>{p.reference} · inst. {p.instalmentNo} · {formatINR(p.amount)}</span><StatusPill status={p.status} /></li>)}</ul>}
      <h3 className={h}>Outstanding instalments</h3>
      {profile && profile.outstandingInstalments.length > 0 ? (
        <ul className="space-y-1">{profile.outstandingInstalments.map((o) => <li key={`${o.schemeId}-${o.instalmentNo}`} className="flex justify-between rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5"><span>Instalment {o.instalmentNo} · due {fmtDate(o.due)}</span><strong>{formatINR(o.amount)}</strong></li>)}</ul>
      ) : <p className="text-muted">None outstanding.</p>}
      <h3 className={h}>Nominee</h3>
      <p>{profile?.nominee ? `${profile.nominee.name} (${profile.nominee.relationship})` : <span className="text-muted">No nominee recorded.</span>}</p>
      <h3 className={h}>Support history</h3>
      {tix.length > 0 ? <ul className="space-y-1">{tix.map((t) => <li key={t.id} className="flex justify-between gap-2"><span>{t.id} · {t.subject}</span><StatusPill status={t.status} /></li>)}</ul> : <p className="text-muted">No tickets.</p>}
      <h3 className={h}>Internal notes</h3>
      <ul className="mb-3 space-y-2" aria-label="Internal notes">
        {allNotes.length === 0 && <li className="text-muted">No notes yet.</li>}
        {allNotes.map((n) => <li key={n.id} className="rounded-md bg-ivory px-3 py-2"><p>{n.text}</p><p className="mt-1 text-xs text-muted">{n.by} · {fmtDateTime(n.at)}</p></li>)}
      </ul>
      <ReasonField label={`Add note (as demo ${role.toLowerCase()})`} value={text} onChange={setText} error={err} hint="Local state only. In production, notes need a permission, are append-only and are audit-logged." />
      <div className="mt-2"><SmallButton variant="solid" onClick={() => {
        if (text.trim().length < 3) { setErr("Enter a note of at least 3 characters."); return; }
        onAddNote(text.trim()); setText(""); setErr(undefined);
      }}>Add note</SmallButton></div>
    </div>
  );
}

export function CustomersView() {
  const { state, retry } = useLoad(load);
  const { addAudit } = useAdminState();
  const { role } = useActingAs();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [kyc, setKyc] = useState("all");
  const [bank, setBank] = useState("all");
  const [owing, setOwing] = useState("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [revealFor, setRevealFor] = useState<Customer | null>(null);
  const [profileFor, setProfileFor] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<Record<string, LocalNote[]>>({});
  const [reason, setReason] = useState("");
  const [reasonErr, setReasonErr] = useState<string>();

  return (
    <>
      <PageHeader title="Customers" description="Contact details are masked by default. Revealing them requires an explicit, logged confirmation." />
      <AsyncView state={state} retry={retry}>
        {(d) => {
          const rows = d.customers.filter((c) =>
            (`${c.name} ${c.id}`.toLowerCase().includes(q.trim().toLowerCase())) && (kyc === "all" || c.kyc === kyc) && (bank === "all" || c.bank === bank) &&
            (owing === "all" || (owing === "owing" ? c.outstanding > 0 : c.outstanding === 0)));
          const profile = (id: string) => d.profiles.find((p) => p.customerId === id);
          const kycOpts = [...new Set(d.customers.map((c) => c.kyc))];
          const bankOpts = [...new Set(d.customers.map((c) => c.bank))];
          return (
            <>
              <FilterBar count={rows.length} total={d.customers.length}>
                <FilterSearch label="Search customers" value={q} onChange={setQ} placeholder="Name or ID…" />
                <FilterSelect label="KYC status" value={kyc} onChange={setKyc} options={[allOption("All KYC"), ...kycOpts.map((o) => ({ value: o, label: o }))]} />
                <FilterSelect label="Bank status" value={bank} onChange={setBank} options={[allOption("All bank statuses"), ...bankOpts.map((o) => ({ value: o, label: o }))]} />
                <FilterSelect label="Outstanding" value={owing} onChange={setOwing} options={[allOption("Any"), { value: "owing", label: "Has outstanding" }, { value: "clear", label: "No outstanding" }]} />
              </FilterBar>
              <AdminTable caption="Customers" rows={rows} rowKey={(c) => c.id}
                empty={<EmptyState title="No customers match" text="Adjust the filters." />}
                columns={[
                  { key: "n", header: "Customer", render: (c) => <span><strong>{c.name}</strong><span className="block text-xs text-muted">{c.id}</span></span> },
                  { key: "m", header: "Mobile", render: (c) => (revealed.has(c.id) ? profile(c.id)?.revealed.mobile ?? c.mobile : c.mobile) },
                  { key: "e", header: "Email", render: (c) => (revealed.has(c.id) ? profile(c.id)?.revealed.email ?? c.email : c.email) },
                  { key: "k", header: "KYC", render: (c) => <StatusPill status={c.kyc} /> },
                  { key: "b", header: "Bank", render: (c) => <StatusPill status={c.bank} /> },
                  { key: "ms", header: "Memberships", render: (c) => c.memberships },
                  { key: "o", header: "Outstanding", render: (c) => (c.outstanding > 0 ? <strong className="text-danger">{formatINR(c.outstanding)}</strong> : formatINR(0)) },
                  { key: "a", header: "Actions", render: (c) => (
                    <span className="inline-flex flex-wrap gap-1.5">
                      {revealed.has(c.id)
                        ? <SmallButton onClick={() => setRevealed((s) => { const n = new Set(s); n.delete(c.id); return n; })} aria-label={`Hide contact details for ${c.name}`}><EyeOff className="h-3.5 w-3.5" aria-hidden />Hide</SmallButton>
                        : <SmallButton onClick={() => { setReason(""); setReasonErr(undefined); setRevealFor(c); }} aria-label={`Reveal contact details for ${c.name}`}><Eye className="h-3.5 w-3.5" aria-hidden />Reveal</SmallButton>}
                      <SmallButton onClick={() => setProfileFor(c)} aria-label={`Open profile for ${c.name}`}><UserRound className="h-3.5 w-3.5" aria-hidden />Profile</SmallButton>
                    </span>) },
                ]} />

              <Dialog open={!!revealFor} onOpenChange={(o) => { if (!o) setRevealFor(null); }} title="Reveal contact details?" description={`Showing unmasked mobile and email for ${revealFor?.name ?? ""}.`}
                footer={<><SmallButton onClick={() => setRevealFor(null)}>Cancel</SmallButton><SmallButton variant="solid" onClick={() => {
                  if (reason.trim().length < minReason) { setReasonErr(`Enter a purpose of at least ${minReason} characters.`); return; }
                  if (!revealFor) return;
                  setRevealed((s) => new Set(s).add(revealFor.id));
                  addAudit({ action: "Revealed customer contact details (local)", entity: revealFor.id, reason: reason.trim() });
                  toast(`Contact details revealed for ${revealFor.name}; recorded in the audit trail.`);
                  setRevealFor(null);
                }}>Reveal and log</SmallButton></>}>
                <div className="space-y-3">
                  <p className="text-sm">In a real system, viewing personal data requires a specific permission, a stated purpose, and a tamper-evident log entry (who, what, when, why). Here the entry is stored locally for this session and appears in Audit logs. Acting as: <strong>{role}</strong>.</p>
                  <ReasonField label="Purpose of access" value={reason} onChange={setReason} error={reasonErr} />
                </div>
              </Dialog>

              <Dialog variant="drawer" open={!!profileFor} onOpenChange={(o) => { if (!o) setProfileFor(null); }} title={profileFor ? `${profileFor.name}: profile` : "Profile"} description="Contact details stay masked here. Demo data only.">
                {profileFor && <ProfileBody key={profileFor.id} customer={profileFor} profile={profile(profileFor.id)} data={d} notes={notes[profileFor.id] ?? []}
                  onAddNote={(text) => {
                    const id = profileFor.id;
                    setNotes((m) => ({ ...m, [id]: [{ id: `ln-${Date.now()}`, at: new Date().toISOString(), by: `Demo ${role.toLowerCase()}`, text }, ...(m[id] ?? [])] }));
                    addAudit({ action: "Added internal customer note (local)", entity: id, reason: text.slice(0, 80) });
                    toast("Note added locally.");
                  }} />}
              </Dialog>
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
