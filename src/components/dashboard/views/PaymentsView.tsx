"use client";
import { useMemo, useState } from "react";
import { FileText, Search, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/fields";
import { EmptyState, Pagination, DemoNote } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { formatINRPrecise } from "@/lib/money";
import type { DocumentItem, Payment, PaymentStatus } from "@/data/types";
import { DataGate, PageHeader } from "../ui";
import { schemeFor, useDashboard, type Snapshot } from "../DashboardData";
import { formatDate, todayIso } from "../format";
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
  const options = d.memberships.filter(isLiable);
  const [memId, setMemId] = useState(options[0]?.id ?? "");
  const [method, setMethod] = useState<Payment["method"]>("UPI");
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
    toast("Simulated payment request added with status Pending. No money was moved.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Pay instalment (simulated)" description="This is a demonstration. No real payment is made."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={confirm} disabled={disabled}>Confirm simulated payment</Button></>}>
      <div className="space-y-4">
        <DemoNote>Payments are simulated. Confirming only adds a local entry with status Pending in this browser session. It is never marked Successful from the screen; in production only the payment gateway and bank reconciliation can do that.</DemoNote>
        {options.length === 0 ? <p className="text-muted">You have no active membership with an instalment payable.</p> : (
          <>
            <SelectField label="Membership" value={memId} onChange={(e) => setMemId(e.target.value)}>
              {options.map((o) => <option key={o.id} value={o.id}>{schemeFor(d, o.schemeId)?.name} · ticket {o.ticketNo}</option>)}
            </SelectField>
            <SelectField label="Payment method" value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])}>
              {methods.map((x) => <option key={x}>{x}</option>)}
            </SelectField>
            {m && s && <p className="rounded-md bg-ivory p-3 text-sm">Instalment <strong>{instNo}</strong> of {s.rules.instalments}: <strong>{formatINRPrecise(s.rules.instalment)}</strong>, due {formatDate(m.nextDue)}.</p>}
            {duplicate && <p role="alert" className="text-sm font-medium text-danger">A Pending simulated payment already exists for this instalment.</p>}
          </>
        )}
      </div>
    </Dialog>
  );
}

function Payments({ d }: { d: Snapshot }) {
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pay, setPay] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const rows = useMemo(() => d.payments
    .filter((p) => (status === "all" || p.status === status) && p.reference.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.reference.localeCompare(a.reference)), [d.payments, status, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const visible = rows.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const receiptDoc = receipt ? findReceipt(d.documents, receipt) : undefined;

  const columns = [
    { key: "amt", header: "Amount", render: (p: Payment) => <span className="font-semibold">{formatINRPrecise(p.amount)}</span> },
    { key: "date", header: "Date", render: (p: Payment) => formatDate(p.date) },
    { key: "method", header: "Method", render: (p: Payment) => p.method },
    { key: "ref", header: "Reference", render: (p: Payment) => <span className="break-all font-mono text-xs">{p.reference}</span> },
    { key: "inst", header: "Instalment", render: (p: Payment) => `#${p.instalmentNo}` },
    { key: "status", header: "Status", render: (p: Payment) => <StatusBadge status={p.status} /> },
    { key: "rec", header: "Receipt", render: (p: Payment) => {
      const doc = findReceipt(d.documents, p);
      return doc?.fileUrl
        ? <a href={doc.fileUrl} className="inline-flex min-h-11 items-center gap-1 font-semibold text-emerald hover:underline"><FileText className="h-4 w-4" aria-hidden />Download<span className="sr-only"> receipt for {p.reference}</span></a>
        : <button type="button" onClick={() => setReceipt(p)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-emerald hover:underline"><FileText className="h-4 w-4" aria-hidden />Receipt<span className="sr-only"> for {p.reference}</span></button>;
    } },
  ];

  return (
    <>
      <PageHeader title="Payments" intro="Every payment on your account with its true status. Only payments with status Successful count towards your recorded contributions."
        actions={<Button onClick={() => setPay(true)}><Plus className="h-4 w-4" aria-hidden />Pay instalment</Button>} />
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <SelectField label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value as "all" | PaymentStatus); setPage(1); }}>
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </SelectField>
        <div className="relative">
          <TextField label="Search by reference" type="search" placeholder="e.g. DEMO-PAY-0005" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
          <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted" aria-hidden />
        </div>
      </div>
      <p className="mb-3 text-sm text-muted" aria-live="polite">{rows.length} payment{rows.length === 1 ? "" : "s"} shown</p>
      {rows.length === 0 ? <EmptyState title="No payments match" text="Try a different status or reference." action={<Button variant="secondary" onClick={() => { setStatus("all"); setQ(""); }}>Clear filters</Button>} />
        : <><DataTable caption="Payments" columns={columns} rows={visible} rowKey={(p) => p.id} /><Pagination page={cur} pages={pages} onChange={setPage} /></>}

      {pay && <PayDialog d={d} open={pay} onOpenChange={setPay} />}
      <Dialog open={!!receipt} onOpenChange={(o) => { if (!o) setReceipt(null); }} title="Receipt not available" description={receipt ? `Payment ${receipt.reference}` : undefined}
        footer={<Button onClick={() => setReceipt(null)}>Close</Button>}>
        <p>Receipt not available — demo; real receipts come from the backend.</p>
        {receipt && receipt.status !== "Successful" && <p className="mt-2 text-muted">This payment is {receipt.status.toLowerCase()}, so a receipt would not normally be issued yet.</p>}
        {receiptDoc && <p className="mt-2 text-muted">A placeholder document “{receiptDoc.name}” exists, but it has no file attached.</p>}
      </Dialog>
    </>
  );
}

export function PaymentsView() { return <DataGate>{(d) => <Payments d={d} />}</DataGate>; }
