"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { adminExtraService } from "@/services/adminExtra";
import { formatBps, formatINR, formatLakh, pctToBps, rupees } from "@/lib/money";
import { validateRules } from "@/lib/chit";
import type { Scheme } from "@/data/types";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useActingAs } from "./ActingAs";
import { useAdminState, schemeStatuses } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, MakerCheckerNote, PageHeader, Panel, SimulatedTag, SmallButton, StatusPill, allOption, useLoad } from "./common";
import { RequestChangeDialog, RequestsTable } from "./SchemeWorkflow";

export const draftSchema = z.object({
  name: z.string().trim().min(3, "Enter a scheme name of at least 3 characters."),
  gross: z.number({ error: "Enter the gross chit amount in rupees." }).min(10000, "Gross chit must be at least ₹10,000."),
  tickets: z.number({ error: "Enter the number of tickets." }).int("Tickets must be a whole number.").min(2, "At least 2 tickets.").max(500, "At most 500 tickets."),
  instalments: z.number({ error: "Enter the number of instalments." }).int("Whole number required.").min(1, "At least 1 instalment.").max(120, "At most 120 instalments."),
  commissionPct: z.number({ error: "Enter commission %." }).min(0, "Cannot be negative.").max(10, "Commission above 10% needs legal review: enter 10 or less."),
  maxDiscountPct: z.number({ error: "Enter max discount %." }).min(0, "Cannot be negative.").max(50, "Enter 50 or less."),
}).refine((v) => v.maxDiscountPct >= v.commissionPct, { path: ["maxDiscountPct"], message: "Max discount must be at least the commission %." });
export type DraftValues = z.infer<typeof draftSchema>;

export function buildDraft(v: DraftValues, id: string): Scheme {
  return {
    id, name: v.name, status: "Draft", demo: true,
    summary: "Draft created in the admin console (local demo state only).",
    commencementNote: "Commencement date to be announced after scheme approval.",
    auctionNote: "Auction schedule is defined in the approved scheme agreement.",
    rules: { grossChit: rupees(v.gross), tickets: v.tickets, instalments: v.instalments, instalment: Math.round(rupees(v.gross) / v.tickets), commissionBps: pctToBps(v.commissionPct), maxDiscountBps: pctToBps(v.maxDiscountPct), dividendBasis: "all_tickets", prizedReceivesDividend: false },
  };
}

/** Shared draft form (used for create and for editing a Draft). */
export function DraftForm({ id, initial, onSubmit }: { id: string; initial?: Partial<DraftValues>; onSubmit: (v: DraftValues) => void }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<DraftValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: { name: "", gross: 100000, tickets: 20, instalments: 20, commissionPct: 5, maxDiscountPct: 30, ...initial },
  });
  const v = useWatch({ control });
  const nums = [v.gross, v.tickets, v.instalments, v.commissionPct, v.maxDiscountPct];
  const valid = nums.every((n) => typeof n === "number" && Number.isFinite(n)) && (v.tickets ?? 0) > 0;
  const derived = valid ? Math.round(rupees(v.gross ?? 0) / (v.tickets ?? 1)) : null;
  const notes = valid
    ? validateRules({ grossChit: rupees(v.gross ?? 0), tickets: v.tickets ?? 0, instalments: v.instalments ?? 0, instalment: derived ?? 0, commissionBps: pctToBps(v.commissionPct ?? 0), maxDiscountBps: pctToBps(v.maxDiscountPct ?? 0), dividendBasis: "all_tickets", prizedReceivesDividend: false }, 0)
        .filter((i) => i.field === "instalment" || i.field === "tickets")
    : [];
  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><TextField label="Scheme name" {...register("name")} error={errors.name?.message} /></div>
      <TextField label="Gross chit (₹)" type="number" inputMode="numeric" {...register("gross", { valueAsNumber: true })} error={errors.gross?.message} />
      <TextField label="Tickets" type="number" inputMode="numeric" {...register("tickets", { valueAsNumber: true })} error={errors.tickets?.message} />
      <TextField label="Instalments (months)" type="number" inputMode="numeric" {...register("instalments", { valueAsNumber: true })} error={errors.instalments?.message} />
      <TextField label="Commission (%)" type="number" step="0.01" inputMode="decimal" {...register("commissionPct", { valueAsNumber: true })} error={errors.commissionPct?.message} hint="Per approved agreement." />
      <TextField label="Max discount (%)" type="number" step="0.01" inputMode="decimal" {...register("maxDiscountPct", { valueAsNumber: true })} error={errors.maxDiscountPct?.message} />
      <div className="rounded-md bg-navy/5 px-3 py-2 text-sm sm:col-span-2" aria-live="polite">
        Derived instalment per ticket: <strong>{derived !== null ? formatINR(derived) : "—"}</strong> <span className="text-xs text-muted">(gross chit ÷ tickets; illustrative)</span>
        {notes.map((n) => <p key={n.message} className="mt-1 text-xs text-warning">{n.message}</p>)}
      </div>
    </form>
  );
}

export function ChitsView() {
  const { state, retry } = useLoad(adminExtraService.schemes);
  const { applyLocal, addDraftScheme, addAudit, requests } = useAdminState();
  const { role } = useActingAs();
  const toast = useToast();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<Scheme | null>(null);

  return (
    <>
      <PageHeader title="Chit schemes" description="Scheme register and lifecycle. Status changes are requests that need maker-checker approval; a scheme can never be activated from this console without evidence."
        actions={<SmallButton variant="solid" onClick={() => setCreating(true)}><Plus className="h-4 w-4" aria-hidden />Create draft scheme</SmallButton>} />
      <MakerCheckerNote makerCan="raise status-change requests and create drafts." checkerCan="approve or reject requests raised by a different role." />
      <AsyncView state={state} retry={retry}>
        {(base) => {
          const all = applyLocal(base);
          const rows = all.filter((s) => (status === "all" || s.status === status) && s.name.toLowerCase().includes(q.trim().toLowerCase()));
          const pendingFor = (id: string) => requests.some((r) => r.schemeId === id && r.state === "Pending approval");
          return (
            <div className="space-y-5">
              <FilterBar count={rows.length} total={all.length}>
                <FilterSearch label="Search schemes" value={q} onChange={setQ} placeholder="Name…" />
                <FilterSelect label="Status" value={status} onChange={setStatus} options={[allOption("All statuses"), ...schemeStatuses.map((s) => ({ value: s, label: s }))]} />
              </FilterBar>
              <AdminTable caption="Chit schemes" rows={rows} rowKey={(s) => s.id}
                empty={<EmptyState title="No schemes match" text="Clear the search or status filter." />}
                columns={[
                  { key: "name", header: "Scheme", render: (s) => <Link href={`/admin/chits/${s.id}`} className="font-semibold text-navy underline-offset-2 hover:underline">{s.name}</Link> },
                  { key: "status", header: "Status", render: (s) => <span className="inline-flex flex-wrap items-center justify-end gap-1.5"><StatusPill status={s.status} />{pendingFor(s.id) && <StatusPill status="Pending approval" />}</span> },
                  { key: "gross", header: "Gross chit", render: (s) => formatLakh(s.rules.grossChit) },
                  { key: "tickets", header: "Tickets", render: (s) => s.rules.tickets },
                  { key: "inst", header: "Instalment", render: (s) => `${formatINR(s.rules.instalment)} × ${s.rules.instalments}` },
                  { key: "comm", header: "Commission", render: (s) => formatBps(s.rules.commissionBps) },
                  { key: "disc", header: "Max discount", render: (s) => formatBps(s.rules.maxDiscountBps) },
                  { key: "act", header: "Actions", render: (s) => <span className="inline-flex gap-1.5"><SmallButton onClick={() => setTarget(s)}>Request change</SmallButton></span> },
                ]} />
              <Panel title="Status change requests (maker-checker)" actions={<SimulatedTag />}>
                <RequestsTable requests={requests} schemes={all} />
              </Panel>
            </div>
          );
        }}
      </AsyncView>

      <Dialog open={creating} onOpenChange={setCreating} title="Create draft scheme" description="Adds a Draft scheme to this browser session only. It is not sent anywhere and does not make any scheme operational."
        footer={<><SmallButton onClick={() => setCreating(false)}>Cancel</SmallButton><button type="submit" form="create-draft-form" className="inline-flex min-h-8 items-center rounded-md bg-navy px-3 text-xs font-semibold text-ivory">Create draft</button></>}>
        {creating && <DraftForm id="create-draft-form" onSubmit={(v) => {
          const s = buildDraft(v, `draft-${Date.now().toString(36)}`);
          addDraftScheme(s);
          addAudit({ action: "Created draft scheme (local)", entity: s.id, next: "Draft", reason: `Draft "${s.name}" created as ${role}` });
          toast(`Draft "${s.name}" added to local state.`);
          setCreating(false);
        }} />}
      </Dialog>
      {target && <RequestChangeDialog key={target.id} scheme={target} open onOpenChange={(o) => { if (!o) setTarget(null); }} />}
    </>
  );
}

