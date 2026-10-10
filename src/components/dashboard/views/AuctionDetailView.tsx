"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { DataTable } from "@/components/ui/DataTable";
import { Breadcrumbs, ErrorState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { computeBreakdown, validateRules } from "@/lib/chit";
import { formatBps, formatINR, formatINRPrecise, pctToBps } from "@/lib/money";
import type { Auction, Scheme } from "@/data/types";
import { DataGate, DefList, PageHeader, PanelTitle } from "../ui";
import { schemeFor, type Snapshot } from "../DashboardData";
import { formatDateTime } from "../format";
import { BreakdownTable } from "../BreakdownTable";

const stamp = "ILLUSTRATIVE — not a signed or regulator-issued document";

function BidForm({ a, s, ticketNo }: { a: Auction; s: Scheme; ticketNo: number }) {
  const toast = useToast();
  const max = s.rules.maxDiscountBps / 100;
  const schema = z.object({
    discount: z.string().trim().min(1, "Enter your discount percentage.")
      .refine((v) => !Number.isNaN(Number(v)), "Enter a valid number.")
      .refine((v) => Number(v) >= 0 && Number(v) <= max, `Discount must be between 0% and ${max}% for this scheme.`)
      .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use at most two decimal places."),
  });
  type Form = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { discount: "" } });
  const [pending, setPending] = useState<number | null>(null);
  const [recorded, setRecorded] = useState<number | null>(null);
  const bd = pending != null ? computeBreakdown(s.rules, pending, a.instalmentNo) : null;
  const issues = pending != null ? validateRules(s.rules, pending).filter((i) => i.field === "discount") : [];

  return (
    <Card>
      <CardBody>
        <PanelTitle>Place a bid (demo)</PanelTitle>
        <form noValidate onSubmit={handleSubmit((v) => setPending(pctToBps(Number(v.discount))))} className="space-y-4">
          <TextField label="Your discount (% of gross chit)" inputMode="decimal" placeholder={`0 to ${max}`} hint={`Ticket ${ticketNo}. Allowed range 0 to ${max}% (maximum ${formatBps(s.rules.maxDiscountBps)} of ${formatINR(s.rules.grossChit)}).`} error={errors.discount?.message} {...register("discount")} />
          <Button type="submit">Review bid</Button>
        </form>
        {recorded != null && <p role="status" className="mt-4 rounded-md bg-success/10 p-3 text-sm text-success">Your demo bid of {formatBps(recorded)} is recorded locally in demo mode. It is not authoritative.</p>}
        <p className="mt-4 text-xs text-muted">Production auctions use server-side time and validation. Any client-side clock or countdown is NOT authoritative, so none is shown here; only the scheduled time is displayed.</p>
      </CardBody>
      <Dialog open={pending != null} onOpenChange={(o) => { if (!o) setPending(null); }} title="Confirm your bid" description="Simulated bid, for demonstration only."
        footer={<><Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button><Button onClick={() => { if (pending != null) { setRecorded(pending); toast("Bid recorded in demo mode — not authoritative"); setPending(null); } }}>Confirm bid</Button></>}>
        {pending != null && bd && (
          <div className="space-y-3">
            <p>You are bidding a discount of <strong>{formatBps(pending)}</strong> ({formatINRPrecise(bd.discount)}) on ticket {ticketNo}.</p>
            <p className="text-muted">If this bid won, the illustrative net chit amount would be {formatINRPrecise(bd.netChit)}.</p>
            {issues.map((i) => <p key={i.message} className="rounded-md bg-warning/10 p-2 text-warning">{i.message}</p>)}
          </div>
        )}
      </Dialog>
    </Card>
  );
}

function Statement({ a, s }: { a: Auction; s: Scheme }) {
  if (a.discountBps == null || a.winningTicket == null) return null;
  const b = computeBreakdown(s.rules, a.discountBps, a.instalmentNo);
  return (
    <Card className="border-2 border-gold/60">
      <CardBody>
        <p className="mb-3 inline-block rounded bg-navy px-2 py-1 text-xs font-bold tracking-wide text-ivory">{stamp}</p>
        <h2 className="font-heading text-lg font-bold text-emerald">Illustrative auction result statement</h2>
        <DefList className="mt-3" rows={[
          { label: "Scheme reference", value: `${s.name} (${s.id})` },
          { label: "Instalment reference", value: `Instalment ${a.instalmentNo} of ${s.rules.instalments}` },
          { label: "Auction date and time", value: formatDateTime(a.scheduledAt) },
          { label: "Participants and rules", value: `Eligible tickets: ${a.eligibility} Maximum discount ${formatBps(s.rules.maxDiscountBps)}. Participant list is not available in demo data.` },
          { label: "Tie-break rule", value: a.tieBreakRule },
          { label: "Winning ticket", value: a.winningTicket },
          { label: "Winning discount", value: `${formatBps(a.discountBps)} (${formatINRPrecise(b.discount)})` },
          { label: "Net chit amount", value: <strong>{formatINRPrecise(b.netChit)}</strong> },
          { label: "Verification status", value: <StatusBadge status="Result published" /> },
          { label: "Audit reference", value: a.auditRef ?? "—" },
        ]} />
        <h3 className="mb-1 mt-5 text-sm font-bold text-ink">Calculation breakdown</h3>
        <BreakdownTable b={b} rules={s.rules} discountBps={a.discountBps} />
        <p className="mt-4 text-xs font-semibold text-muted">{stamp}</p>
      </CardBody>
    </Card>
  );
}

function Detail({ d, id }: { d: Snapshot; id: string }) {
  const a = d.auctions.find((x) => x.id === id);
  const s = a ? schemeFor(d, a.schemeId) : undefined;
  if (!a || !s) return <ErrorState title="Auction not found" text="This auction does not exist." action={<Button href="/dashboard/auctions">Back to auctions</Button>} />;
  const mem = d.memberships.find((m) => m.schemeId === a.schemeId && m.status === "Active");
  const history = d.auctions.filter((x) => x.schemeId === a.schemeId).sort((x, y) => y.instalmentNo - x.instalmentNo);

  const stateBlock = (() => {
    switch (a.state) {
      case "Scheduled": return <Card><CardBody><PanelTitle>Scheduled</PanelTitle><p className="text-sm">Bidding opens at the scheduled time: <strong>{formatDateTime(a.scheduledAt)}</strong>. No bid form is available until the auction is open.</p></CardBody></Card>;
      case "Open": return mem
        ? <BidForm a={a} s={s} ticketNo={mem.ticketNo} />
        : <Card><CardBody><PanelTitle>Open</PanelTitle><p className="text-sm text-muted">You do not have an active ticket in this scheme, so you cannot bid.</p></CardBody></Card>;
      case "Closed": return <Card><CardBody><PanelTitle>Closed</PanelTitle><p className="text-sm text-muted">Bidding has closed. The result will be verified before it is published.</p></CardBody></Card>;
      case "Result pending verification": return (
        <Card className="border-warning/40"><CardBody>
          <PanelTitle>Provisional result — UNVERIFIED</PanelTitle>
          <p className="text-sm">Provisional winning ticket <strong>{a.winningTicket}</strong> at <strong>{formatBps(a.discountBps ?? 0)}</strong> discount. This result has not been verified and may change. Financial figures are shown only after verification and publication.</p>
        </CardBody></Card>);
      case "Result published": return <Statement a={a} s={s} />;
      case "Cancelled": return <Card><CardBody><PanelTitle>Cancelled</PanelTitle><p className="text-sm text-muted">This auction was cancelled. No result exists for it.</p></CardBody></Card>;
      case "Rescheduled": return <Card><CardBody><PanelTitle>Rescheduled</PanelTitle><p className="text-sm text-muted">This auction was rescheduled; the original time shown was {formatDateTime(a.scheduledAt)}. A new schedule will be notified. No result exists for this instance.</p></CardBody></Card>;
    }
  })();

  return (
    <>
      <Breadcrumbs items={[{ label: "Auctions", href: "/dashboard/auctions" }, { label: `${s.name} · instalment ${a.instalmentNo}` }]} />
      <PageHeader title={`Auction · instalment ${a.instalmentNo}`} intro={s.name} actions={<StatusBadge status={a.state} />} />
      <div role="note" className="mb-6 flex gap-3 rounded-lg border-2 border-navy bg-navy/5 p-4 text-sm text-navy">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p><strong>SIMULATED AUCTION.</strong> Nothing here is a real auction, bid or result. Scheduled time: {formatDateTime(a.scheduledAt)}.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">{stateBlock}</div>
        <Card className="lg:col-span-2"><CardBody>
          <PanelTitle>Auction details</PanelTitle>
          <DefList rows={[
            { label: "Scheme", value: <>{s.name}<br /><span className="text-xs text-muted">{s.id}</span></> },
            { label: "Instalment number", value: `${a.instalmentNo} of ${s.rules.instalments}` },
            { label: "Gross chit", value: formatINR(s.rules.grossChit) },
            { label: "Maximum discount", value: `${formatBps(s.rules.maxDiscountBps)} (${formatINR(Math.round((s.rules.grossChit * s.rules.maxDiscountBps) / 10000))})` },
            { label: "Scheduled", value: formatDateTime(a.scheduledAt) },
            { label: "Current state", value: <StatusBadge status={a.state} /> },
            { label: "Eligibility", value: a.eligibility },
            { label: "Tie-break rule", value: a.tieBreakRule },
          ]} />
        </CardBody></Card>
      </div>
      <section className="mt-8" aria-labelledby="hist">
        <PanelTitle id="hist">Auction history for this scheme</PanelTitle>
        <DataTable caption="Auction history" rows={history} rowKey={(x) => x.id} columns={[
          { key: "i", header: "Instalment", render: (x) => `#${x.instalmentNo}` },
          { key: "d", header: "Scheduled", render: (x) => formatDateTime(x.scheduledAt) },
          { key: "s", header: "State", render: (x) => <StatusBadge status={x.state} /> },
          { key: "r", header: "Result", render: (x) => x.state === "Result published" ? `Ticket ${x.winningTicket} · ${formatBps(x.discountBps ?? 0)}` : "—" },
          { key: "l", header: "Details", render: (x) => x.id === a.id ? <span className="text-muted">Viewing</span> : <Link href={`/dashboard/auctions/${x.id}`} className="font-semibold text-emerald hover:underline">View</Link> },
        ]} />
      </section>
    </>
  );
}

export function AuctionDetailView({ id }: { id: string }) { return <DataGate>{(d) => <Detail d={d} id={id} />}</DataGate>; }
