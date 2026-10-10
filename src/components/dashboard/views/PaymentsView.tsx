"use client";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, FileText, Search, Plus, Receipt } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/fields";
import { SuccessNote } from "@/components/ui/fx";
import { EmptyState, Pagination, DemoNote } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { formatINRPrecise } from "@/lib/money";
import { useTr } from "@/i18n/LanguageProvider";
import type { DocumentItem, Payment, PaymentStatus } from "@/data/types";
import { DataGate, DefList, FilterChips, PageHeader, StatusChip, Surface } from "../ui";
import { schemeFor, useDashboard, type Snapshot } from "../DashboardData";
import { useDates, todayIso } from "../format";
import { isLiable, nextInstalmentNo } from "../summary";

const PAGE_SIZE = 6;
const statuses: PaymentStatus[] = ["Successful", "Pending", "Under reconciliation", "Failed", "Refunded"];
const methods: Payment["method"][] = ["UPI", "Net banking", "Card", "NACH mandate"];

function findReceipt(docs: DocumentItem[], p: Payment): DocumentItem | undefined {
  return docs.find((x) => x.category === "Receipt" && x.membershipId === p.membershipId && x.name.includes(`Instalment ${p.instalmentNo}`));
}

function PayDialog({ d, open, onOpenChange }: { d: Snapshot; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addPayment } = useDashboard();
  const toast = useToast();
  const tr = useTr();
  const { formatDate } = useDates();
  const options = d.memberships.filter(isLiable);
  const [memId, setMemId] = useState(options[0]?.id ?? "");
  const [method, setMethod] = useState<Payment["method"]>("UPI");
  const [done, setDone] = useState<string | null>(null);
  const m = options.find((x) => x.id === memId);
  const s = m ? schemeFor(d, m.schemeId) : undefined;
  const instNo = m ? nextInstalmentNo(m) : 0;
  const duplicate = !!m && d.payments.some((p) => p.membershipId === m.id && p.instalmentNo === instNo && p.status === "Pending");
  const disabled = !m || !s || duplicate;

  function confirm() {
    if (!m || !s) return;
    const n = d.payments.filter((p) => p.id.startsWith("local-")).length + 1;
    addPayment({
      id: `local-${n}`, membershipId: m.id, instalmentNo: instNo, amount: s.rules.instalment, date: todayIso(), method,
      reference: `DEMO-LOCAL-${String(n).padStart(4, "0")}`, gatewayRef: null, status: "Pending",
    });
    toast(tr("Simulated payment request added with status Pending. No money was moved."));
    setDone(`DEMO-LOCAL-${String(n).padStart(4, "0")}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={tr("Pay instalment (simulated)")} description={tr("This is a demonstration. No real payment is made.")}
      footer={done ? <Button onClick={() => onOpenChange(false)}>{tr("Close")}</Button> : <><Button variant="ghost" onClick={() => onOpenChange(false)}>{tr("Cancel")}</Button><Button onClick={confirm} disabled={disabled}>{tr("Confirm simulated payment")}</Button></>}>
      {done ? (
        <SuccessNote><p className="font-semibold">{tr("Simulated request recorded")}</p><p className="mt-0.5 text-muted">{tr("Reference {ref} was added to your list with status Pending. No money was moved and it is not marked Successful.", { ref: done })}</p></SuccessNote>
      ) : (
      <div className="space-y-4">
        <DemoNote>{tr("Payments are simulated. Confirming only adds a local entry with status Pending in this browser session. It is never marked Successful from the screen; in production only the payment gateway and bank reconciliation can do that.")}</DemoNote>
        {options.length === 0 ? <p className="text-muted">{tr("You have no active membership with an instalment payable.")}</p> : (
          <>
            <SelectField label={tr("Membership")} value={memId} onChange={(e) => setMemId(e.target.value)}>
              {options.map((o) => <option key={o.id} value={o.id}>{tr(schemeFor(d, o.schemeId)?.name ?? "")} · {tr("ticket {n}", { n: o.ticketNo })}</option>)}
            </SelectField>
            <SelectField label={tr("Payment method")} value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])}>
              {methods.map((x) => <option key={x} value={x}>{tr(x)}</option>)}
            </SelectField>
            {m && s && <p className="rounded-md bg-ivory p-3 text-sm">{tr("Instalment {n} of {m}: {amt}, due {date}.", { n: instNo, m: s.rules.instalments, amt: formatINRPrecise(s.rules.instalment), date: formatDate(m.nextDue) })}</p>}
            {duplicate && <p role="alert" className="text-sm font-medium text-danger">{tr("A Pending simulated payment already exists for this instalment.")}</p>}
          </>
        )}
      </div>
      )}
    </Dialog>
  );
}

function PaymentRow({ p, d, onReceipt }: { p: Payment; d: Snapshot; onReceipt: (p: Payment) => void }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const tr = useTr();
  const { formatDate } = useDates();
  const panel = useId();
  const doc = findReceipt(d.documents, p);
  return (
    <motion.li layout={!reduce} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}>
      <Surface hover className="overflow-hidden">
        <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)} className="flex min-h-16 w-full items-center gap-3 p-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald"><Receipt className="h-5 w-5" aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold tabular-nums text-ink">{formatINRPrecise(p.amount)} <span className="font-normal text-muted">· {tr("Instalment {n}", { n: p.instalmentNo })}</span></span>
            <span className="block text-xs text-muted">{formatDate(p.date)} · {tr(p.method)}</span>
          </span>
          <StatusChip status={p.status} />
          <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div id={panel} key="p" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="border-t border-line/70 bg-ivory/50 px-4 pb-4 pt-2">
                <DefList reveal rows={[
                  { label: tr("Reference"), value: <span className="break-all font-mono text-xs">{p.reference}</span> },
                  { label: tr("Method"), value: tr(p.method) },
                  { label: tr("Date"), value: formatDate(p.date) },
                  { label: tr("Instalment"), value: `#${p.instalmentNo}` },
                  { label: tr("Status"), value: tr(p.status) },
                ]} />
                <div className="mt-2">
                  {doc?.fileUrl
                    ? <a href={doc.fileUrl} className="inline-flex min-h-11 items-center gap-1 font-semibold text-emerald hover:underline"><FileText className="h-4 w-4" aria-hidden />{tr("Download")}<span className="sr-only"> {tr("receipt for {ref}", { ref: p.reference })}</span></a>
                    : <button type="button" onClick={() => onReceipt(p)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-emerald hover:underline"><FileText className="h-4 w-4" aria-hidden />{tr("Receipt")}<span className="sr-only"> {tr("for {title}", { title: p.reference })}</span></button>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Surface>
    </motion.li>
  );
}

function Payments({ d }: { d: Snapshot }) {
  const tr = useTr();
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { payIntent, setPayIntent } = useDashboard();
  const [manualPay, setManualPay] = useState(false);
  const pay = manualPay || payIntent;
  const setPay = (o: boolean) => { setManualPay(o); if (!o) setPayIntent(false); };
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const rows = useMemo(() => d.payments
    .filter((p) => (status === "all" || p.status === status) && p.reference.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.reference.localeCompare(a.reference)), [d.payments, status, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const visible = rows.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const receiptDoc = receipt ? findReceipt(d.documents, receipt) : undefined;

  return (
    <>
      <PageHeader title={tr("Payments")} intro={tr("Every payment on your account with its true status. Only payments with status Successful count towards your recorded contributions.")}
        actions={<Button onClick={() => setPay(true)}><Plus className="h-4 w-4" aria-hidden />{tr("Pay instalment")}</Button>} />
      <div className="mb-4 space-y-4">
        <FilterChips label={tr("Filter by status")} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[{ value: "all" as const, label: tr("All"), count: d.payments.length }, ...statuses.map((x) => ({ value: x, label: tr(x), count: d.payments.filter((p) => p.status === x).length }))]} />
        <div className="relative max-w-md">
          <TextField label={tr("Search by reference")} type="search" placeholder={tr("e.g. DEMO-PAY-0005")} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
          <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted" aria-hidden />
        </div>
      </div>
      <p className="mb-3 text-sm text-muted" aria-live="polite">{tr(rows.length === 1 ? "{n} payment shown" : "{n} payments shown", { n: rows.length })}</p>
      {rows.length === 0 ? <EmptyState title={tr("No payments match")} text={tr("Try a different status or reference.")} action={<Button variant="secondary" onClick={() => { setStatus("all"); setQ(""); }}>{tr("Clear filters")}</Button>} />
        : <><ul className="space-y-3" aria-label={tr("Payments")}><AnimatePresence initial={false} mode="popLayout">{visible.map((p) => <PaymentRow key={p.id} p={p} d={d} onReceipt={setReceipt} />)}</AnimatePresence></ul><Pagination page={cur} pages={pages} onChange={setPage} /></>}

      {pay && <PayDialog d={d} open onOpenChange={setPay} />}
      <Dialog open={!!receipt} onOpenChange={(o) => { if (!o) setReceipt(null); }} title={tr("Receipt not available")} description={receipt ? tr("Payment {ref}", { ref: receipt.reference }) : undefined}
        footer={<Button onClick={() => setReceipt(null)}>{tr("Close")}</Button>}>
        <p>{tr("Receipt not available — demo; real receipts come from the backend.")}</p>
        {receipt && receipt.status !== "Successful" && <p className="mt-2 text-muted">{tr("This payment is {status}, so a receipt would not normally be issued yet.", { status: tr(receipt.status).toLowerCase() })}</p>}
        {receiptDoc && <p className="mt-2 text-muted">{tr("A placeholder document “{name}” exists, but it has no file attached.", { name: tr(receiptDoc.name) })}</p>}
      </Dialog>
    </>
  );
}

export function PaymentsView() { return <DataGate>{(d) => <Payments d={d} />}</DataGate>; }
