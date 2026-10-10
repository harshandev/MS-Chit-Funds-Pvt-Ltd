"use client";
import { useCallback, useState } from "react";
import { Check, FileUp, Lock } from "lucide-react";
import { adminExtraService } from "@/services/adminExtra";
import { formatBps, formatINR, formatINRPrecise } from "@/lib/money";
import { cn } from "@/lib/cn";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import type { Scheme } from "@/data/types";
import { useAdminState, schemeStatuses } from "./AdminState";
import { AdminTable, AsyncView, KeyValue, Panel, PageHeader, SimulatedTag, SmallButton, StatusPill, fmtDateTime, useLoad, TableSkeleton } from "./common";
import { DraftForm, buildDraft } from "./ChitsView";
import { EvidenceChecklist, RequestChangeDialog, RequestsTable } from "./SchemeWorkflow";

function ConfigTab({ scheme }: { scheme: Scheme }) {
  const { patchScheme, addAudit } = useAdminState();
  const toast = useToast();
  const r = scheme.rules;
  return (
    <div className="space-y-4">
      <Panel title="Rules (read-only review)">
        <KeyValue items={[
          { k: "Gross chit", v: formatINR(r.grossChit) }, { k: "Tickets", v: r.tickets }, { k: "Instalments", v: r.instalments },
          { k: "Instalment per ticket", v: formatINRPrecise(r.instalment) }, { k: "Foreman commission", v: formatBps(r.commissionBps) }, { k: "Max auction discount", v: formatBps(r.maxDiscountBps) },
          { k: "Dividend basis", v: r.dividendBasis === "all_tickets" ? "All tickets" : "Non-prized tickets" }, { k: "Prized ticket receives dividend", v: r.prizedReceivesDividend ? "Yes" : "No" },
          { k: "Commencement", v: scheme.commencementNote }, { k: "Auctions", v: scheme.auctionNote },
        ]} />
        <p className="mt-3 text-xs text-muted">Rules shown are illustrative. Real values must match the approved scheme agreement; calculations must be performed by an authoritative server-side service.</p>
      </Panel>
      {scheme.status === "Draft" ? (
        <Panel title="Edit draft" actions={<SimulatedTag label="Local only" />}>
          <DraftForm key={`${scheme.id}-${r.grossChit}-${r.tickets}-${scheme.name}`} id="edit-draft-form" initial={{ name: scheme.name, gross: r.grossChit / 100, tickets: r.tickets, instalments: r.instalments, commissionPct: r.commissionBps / 100, maxDiscountPct: r.maxDiscountBps / 100 }}
            onSubmit={(v) => {
              const d = buildDraft(v, scheme.id);
              patchScheme(scheme.id, { name: d.name, rules: d.rules });
              addAudit({ action: "Edited draft scheme rules (local)", entity: scheme.id, previous: `${formatINR(r.grossChit)} / ${r.tickets} tickets`, next: `${formatINR(d.rules.grossChit)} / ${d.rules.tickets} tickets`, reason: "Draft edited in admin console" });
              toast("Draft updated in local state.");
            }} />
          <div className="mt-4"><button type="submit" form="edit-draft-form" className="inline-flex min-h-9 items-center rounded-md bg-navy px-4 text-sm font-semibold text-ivory">Save draft changes</button></div>
        </Panel>
      ) : (
        <p className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs text-muted"><Lock className="h-4 w-4" aria-hidden />Rules are locked once a scheme leaves Draft. Changing them would require a new approved agreement and a maker-checker amendment (not available in this demo).</p>
      )}
    </div>
  );
}

function DocumentsTab({ schemeId }: { schemeId: string }) {
  const load = useCallback(() => adminExtraService.documents(), []);
  const { state, retry } = useLoad(load);
  const [names, setNames] = useState<{ name: string; size: number }[]>([]);
  return (
    <div className="space-y-4">
      <Panel title="Secure upload (placeholder)">
        <p className="text-sm">Integration-ready design: files would go straight from the browser to private, encrypted object storage using a short-lived signed URL, be malware-scanned, linked to this scheme with a checksum, and every view or download would be permission-checked and written to the audit log.</p>
        <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs font-semibold text-warning">Not uploaded anywhere. This control only lists the names of files you pick, locally, and never reads or transmits their contents.</p>
        <div className="mt-3">
          <label htmlFor="scheme-file" className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><FileUp className="h-4 w-4" aria-hidden />Choose files to list (names only)</label>
          <input id="scheme-file" type="file" multiple onChange={(e) => setNames(Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size })))} className="block w-full text-sm file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-navy file:px-3 file:text-xs file:font-semibold file:text-ivory" />
        </div>
        {names.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm" aria-label="Locally listed files">
            {names.map((f) => <li key={f.name} className="flex items-center justify-between rounded-md border border-line px-3 py-1.5"><span className="truncate">{f.name}</span><span className="ml-3 shrink-0 text-xs text-muted">{Math.ceil(f.size / 1024)} KB · <StatusPill status="Not uploaded" /></span></li>)}
          </ul>
        )}
      </Panel>
      <Panel title="Document register for this scheme">
        <AsyncView state={state} retry={retry} skeleton={<TableSkeleton rows={3} />}>
          {(docs) => (
            <AdminTable caption="Scheme documents" rows={docs.filter((d) => d.scope === "Scheme" && d.ref === schemeId)} rowKey={(d) => d.id}
              empty={<EmptyState title="No documents registered" text="Nothing has been supplied for this scheme yet." />}
              columns={[
                { key: "type", header: "Document", render: (d) => d.type }, { key: "status", header: "Status", render: (d) => <StatusPill status={d.status} /> }, { key: "note", header: "Note", render: (d) => <span className="text-xs text-muted">{d.note}</span> },
              ]} />
          )}
        </AsyncView>
      </Panel>
    </div>
  );
}

function EnrolmentTab({ scheme }: { scheme: Scheme }) {
  const load = useCallback(() => adminExtraService.subscribers(scheme.id), [scheme.id]);
  const { state, retry } = useLoad(load);
  return (
    <AsyncView state={state} retry={retry}>
      {(subs) => (
        <div className="space-y-3">
          <p className="text-sm">{subs.length} of {scheme.rules.tickets} tickets enrolled (demo). Names are masked; full details need permission and are audited in the Customers page.</p>
          <AdminTable caption="Enrolled subscribers (masked)" rows={subs} rowKey={(s) => s.id}
            empty={<EmptyState title="No subscribers" text="No one is enrolled in this scheme in the demo data." />}
            columns={[
              { key: "t", header: "Ticket", render: (s) => `#${s.ticketNo}` }, { key: "n", header: "Subscriber (masked)", render: (s) => s.maskedName },
              { key: "c", header: "Customer ID", render: (s) => s.customerId }, { key: "s", header: "Status", render: (s) => <StatusPill status={s.status} /> }, { key: "p", header: "Instalments paid", render: (s) => s.instalmentsPaid },
            ]} />
        </div>
      )}
    </AsyncView>
  );
}

function ApprovalTab({ scheme, all }: { scheme: Scheme; all: Scheme[] }) {
  const { requests } = useAdminState();
  const [open, setOpen] = useState(false);
  const idx = schemeStatuses.indexOf(scheme.status);
  const mine = requests.filter((r) => r.schemeId === scheme.id);
  return (
    <div className="space-y-4">
      <Panel title="State timeline">
        <ol className="flex flex-wrap gap-2" aria-label="Scheme lifecycle">
          {schemeStatuses.map((s, i) => {
            const current = i === idx;
            const past = i < idx && s !== "Suspended";
            return (
              <li key={s} aria-current={current ? "step" : undefined} className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold", current ? "border-gold bg-gold/20 text-navy" : past ? "border-success/40 bg-success/5 text-success" : "border-line text-muted")}>
                {past && <Check className="h-3.5 w-3.5" aria-hidden />}{s}{current && <span className="sr-only"> (current)</span>}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-muted">Current status: <StatusPill status={scheme.status} />. Moves between states happen only through approved requests.</p>
      </Panel>
      <Panel title="Commencement evidence checklist">
        <EvidenceChecklist />
        <p role="note" className="mt-3 rounded-md bg-danger/5 px-3 py-2 text-xs font-medium text-danger">Evidence missing: transition to Active is blocked for every scheme in this demo, even after checker approval. {scheme.status === "Active" ? "This scheme appears Active only because the demo data says so; no real evidence exists." : ""}</p>
      </Panel>
      <Panel title="Requests for this scheme" actions={<SmallButton variant="solid" onClick={() => setOpen(true)}>Request status change</SmallButton>}>
        <RequestsTable requests={mine} schemes={all} showScheme={false} />
      </Panel>
      {open && <RequestChangeDialog scheme={scheme} open onOpenChange={setOpen} />}
    </div>
  );
}

function HistoryTab({ scheme }: { scheme: Scheme }) {
  const load = useCallback(() => adminExtraService.schemeHistory(scheme.id), [scheme.id]);
  const { state, retry } = useLoad(load);
  const { audit } = useAdminState();
  return (
    <AsyncView state={state} retry={retry}>
      {(seed) => {
        const rows = [
          ...audit.filter((a) => a.entity === scheme.id).map((a) => ({ id: a.id, at: a.at, actor: a.actor, text: `${a.action}${a.previous || a.next ? ` (${a.previous ?? "—"} → ${a.next ?? "—"})` : ""}: ${a.reason}`, session: true })),
          ...seed.map((h) => ({ id: h.id, at: h.at, actor: h.actor, text: h.text, session: false })),
        ].sort((a, b) => b.at.localeCompare(a.at));
        return (
          <AdminTable caption="Scheme history" rows={rows} rowKey={(r) => r.id}
            empty={<EmptyState title="No history" />}
            columns={[
              { key: "at", header: "When", render: (r) => fmtDateTime(r.at) }, { key: "actor", header: "Actor", render: (r) => r.actor },
              { key: "text", header: "Entry", render: (r) => <span className="inline-flex flex-wrap items-center gap-1.5">{r.text}{r.session && <SimulatedTag label="This session" />}</span> },
            ]} />
        );
      }}
    </AsyncView>
  );
}

export function ChitDetailView({ id }: { id: string }) {
  const { state, retry } = useLoad(adminExtraService.schemes);
  const { applyLocal } = useAdminState();
  const [open, setOpen] = useState(false);
  return (
    <AsyncView state={state} retry={retry}>
      {(base) => {
        const all = applyLocal(base);
        const scheme = all.find((s) => s.id === id);
        if (!scheme) return (
          <>
            <Breadcrumbs items={[{ label: "Chit schemes", href: "/admin/chits" }, { label: "Not found" }]} />
            <PageHeader title="Scheme not found" />
            <EmptyState title="No scheme with this ID" text="Drafts created in a previous browser session are not kept: demo state resets on reload." />
          </>
        );
        return (
          <>
            <Breadcrumbs items={[{ label: "Chit schemes", href: "/admin/chits" }, { label: scheme.name }]} />
            <PageHeader title={scheme.name} description={scheme.summary} actions={<><StatusPill status={scheme.status} /><SmallButton variant="solid" onClick={() => setOpen(true)}>Request status change</SmallButton></>} />
            <Tabs tabs={[
              { value: "config", label: "Configuration", content: <ConfigTab scheme={scheme} /> },
              { value: "docs", label: "Documents", content: <DocumentsTab schemeId={scheme.id} /> },
              { value: "enrol", label: "Enrolment", content: <EnrolmentTab scheme={scheme} /> },
              { value: "approval", label: "Approval & commencement", content: <ApprovalTab scheme={scheme} all={all} /> },
              { value: "history", label: "History", content: <HistoryTab scheme={scheme} /> },
            ]} />
            {open && <RequestChangeDialog scheme={scheme} open onOpenChange={setOpen} />}
          </>
        );
      }}
    </AsyncView>
  );
}
