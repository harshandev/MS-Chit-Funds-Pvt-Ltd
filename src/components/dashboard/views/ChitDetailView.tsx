"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CircleDot } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState, ErrorState, Breadcrumbs, DemoNote } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/fields";
import { computeBreakdown } from "@/lib/chit";
import { formatINR, formatINRPrecise, formatBps, pctToBps } from "@/lib/money";
import { useTr } from "@/i18n/LanguageProvider";
import type { Auction, DocumentItem, Membership, Payment, Scheme } from "@/data/types";
import { DataGate, DefList, PageHeader, Surface } from "../ui";
import { schemeFor, type Snapshot } from "../DashboardData";
import { useDates } from "../format";
import { membershipMetrics } from "../MembershipCard";
import { BreakdownTable } from "../BreakdownTable";
import { dividendFor } from "../summary";

type Tr = (en: string, vars?: Record<string, string | number>) => string;
interface Event { at: string | null; kind: "Payment" | "Auction" | "Document"; title: string; detail: string; badge: string; href?: string }

function buildTimeline(payments: Payment[], auctions: Auction[], docs: DocumentItem[], tr: Tr, formatDateTime: (iso: string) => string): { dated: Event[]; undated: Event[] } {
  const dated: Event[] = [
    ...payments.map((p): Event => ({ at: `${p.date}T00:00:00+05:30`, kind: "Payment", title: tr("Instalment {n} payment · {amt}", { n: p.instalmentNo, amt: formatINRPrecise(p.amount) }), detail: tr("{method} · ref {ref}", { method: tr(p.method), ref: p.reference }), badge: p.status, href: "/dashboard/payments" })),
    ...auctions.map((a): Event => ({ at: a.scheduledAt, kind: "Auction", title: tr("Auction for instalment {n}", { n: a.instalmentNo }), detail: tr("Scheduled {date}", { date: formatDateTime(a.scheduledAt) }), badge: a.state, href: `/dashboard/auctions/${a.id}` })),
  ].sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
  const undated = docs.map((x): Event => ({ at: null, kind: "Document", title: tr(x.name), detail: x.fileUrl ? tr(x.note) : `${tr("No file available yet.")} ${tr(x.note)}`, badge: x.category, href: "/dashboard/documents" }));
  return { dated, undated };
}

function Timeline({ events }: { events: Event[] }) {
  const tr = useTr();
  const { formatDate } = useDates();
  return (
    <Stagger gap={0.06}><ol className="relative space-y-5 border-l-2 border-line pl-6">
      {events.map((e, i) => (
        <li key={i} className="relative"><StaggerItem>
          <CircleDot className="absolute -left-[34px] top-0.5 h-4 w-4 rounded-full bg-ivory text-gold-antique" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{tr(e.kind)}{e.at && <> · <time dateTime={e.at}>{formatDate(e.at)}</time></>}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">{e.title}</p>
          <p className="text-sm text-muted">{e.detail}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3"><StatusBadge status={e.badge} />{e.href && <Link href={e.href} className="text-xs font-semibold text-emerald hover:underline">{tr("View")}</Link>}</div>
        </StaggerItem></li>
      ))}
    </ol></Stagger>
  );
}

function BreakdownTab({ m, s, auctions }: { m: Membership; s: Scheme; auctions: Auction[] }) {
  const tr = useTr();
  const published = auctions.filter((a) => a.state === "Result published" && a.discountBps != null);
  const [sel, setSel] = useState<string>(published[0]?.id ?? "custom");
  const [pct, setPct] = useState("15");
  const max = s.rules.maxDiscountBps / 100;
  const pctNum = Number(pct);
  const customError = pct.trim() === "" || Number.isNaN(pctNum) ? tr("Enter a discount percentage.") : pctNum < 0 || pctNum > max ? tr("Enter a value between 0 and {max}.", { max }) : undefined;
  const chosen = published.find((a) => a.id === sel);
  const bps = chosen ? chosen.discountBps ?? 0 : customError ? null : pctToBps(pctNum);
  const instNo = chosen ? chosen.instalmentNo : Math.max(1, m.currentInstalment);
  const b = bps != null ? computeBreakdown(s.rules, bps, instNo) : null;
  return (
    <div className="space-y-4">
      <DemoNote>{tr("Illustrative calculation using demo scheme rules. Actual figures come from the approved scheme agreement and an authoritative server-side calculation.")}</DemoNote>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label={tr("Basis for calculation")} value={sel} onChange={(e) => setSel(e.target.value)}>
          {published.map((a) => <option key={a.id} value={a.id}>{tr("Published auction · instalment {n} ({pct})", { n: a.instalmentNo, pct: formatBps(a.discountBps ?? 0) })}</option>)}
          <option value="custom">{tr("Custom discount (what-if)")}</option>
        </SelectField>
        {sel === "custom" && <TextField label={tr("Discount %")} inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} error={customError} hint={tr("Allowed range 0 to {max}% for this scheme.", { max })} />}
      </div>
      {published.length === 0 && <p className="text-sm text-muted">{tr("No auction results have been published for this scheme yet, so only a what-if discount is available.")}</p>}
      {b && bps != null ? <BreakdownTable b={b} rules={s.rules} discountBps={bps} /> : null}
    </div>
  );
}

function Detail({ d, id }: { d: Snapshot; id: string }) {
  const tr = useTr();
  const { formatDate, formatDateTime } = useDates();
  const m = d.memberships.find((x) => x.id === id);
  const s = m ? schemeFor(d, m.schemeId) : undefined;
  const payments = useMemo(() => d.payments.filter((p) => p.membershipId === id).sort((a, b) => b.date.localeCompare(a.date)), [d.payments, id]);
  if (!m || !s) return <ErrorState title={tr("Membership not found")} text={tr("This membership does not exist in your account.")} action={<Button href="/dashboard/my-chits">{tr("Back to my chits")}</Button>} />;
  const auctions = d.auctions.filter((a) => a.schemeId === m.schemeId).sort((a, b) => b.instalmentNo - a.instalmentNo);
  const docs = d.documents.filter((x) => x.membershipId === m.id);
  const k = membershipMetrics(m, s);
  const pending = m.status === "Enrolment pending";
  const tl = buildTimeline(payments, auctions, docs, tr, formatDateTime);
  const dividend = dividendFor(d, m);

  const enrolBanner = pending && (
    <div role="note" className="mb-5 flex gap-3 rounded-lg border border-gold/50 bg-gold/10 p-4 text-sm text-[#6b5400]">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{tr("Enrolment pending: onboarding is not complete")}</p>
        <p className="mt-1">{tr("No payments have been recorded for this ticket and nothing is payable yet. Complete registration and verification to activate it. Any amounts shown are the scheme's illustrative terms, not dues.")}</p>
        <Button href="/register" size="sm" variant="gold" className="mt-3">{tr("Continue registration")}</Button>
      </div>
    </div>
  );

  const paymentColumns = [
    { key: "i", header: tr("Instalment"), render: (p: Payment) => `#${p.instalmentNo}` },
    { key: "a", header: tr("Amount"), render: (p: Payment) => formatINRPrecise(p.amount) },
    { key: "d", header: tr("Date"), render: (p: Payment) => formatDate(p.date) },
    { key: "r", header: tr("Reference"), render: (p: Payment) => p.reference },
    { key: "s", header: tr("Status"), render: (p: Payment) => <StatusBadge status={p.status} /> },
  ];
  const auctionColumns = [
    { key: "i", header: tr("Instalment"), render: (a: Auction) => `#${a.instalmentNo}` },
    { key: "d", header: tr("Scheduled"), render: (a: Auction) => formatDate(a.scheduledAt) },
    { key: "s", header: tr("State"), render: (a: Auction) => <StatusBadge status={a.state} /> },
    { key: "r", header: tr("Result"), render: (a: Auction) => a.state === "Result published" ? tr("Ticket {n} · {pct}", { n: a.winningTicket ?? "", pct: formatBps(a.discountBps ?? 0) }) : "—" },
    { key: "l", header: tr("Details"), render: (a: Auction) => <Link href={`/dashboard/auctions/${a.id}`} className="font-semibold text-emerald hover:underline">{tr("View")}</Link> },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: tr("My chits"), href: "/dashboard/my-chits" }, { label: tr(s.name) }]} />
      <PageHeader title={tr(s.name)} intro={`${tr("Ticket no. {n}", { n: m.ticketNo })} · ${tr(s.summary)}`} actions={<div className="flex items-center gap-3"><ProgressRing value={k.progress} size={52} stroke={5} label={tr("{p}% of instalments completed", { p: k.progress })}><span className="text-[11px] font-bold tabular-nums text-emerald">{k.progress}%</span></ProgressRing><StatusBadge status={m.status} /></div>} />
      {enrolBanner}
      <Tabs tabs={[
        { value: "overview", label: tr("Overview"), content: (
          <div className="grid gap-4 md:grid-cols-2">
            <Surface><CardBody><h2 className="mb-2 font-bold text-emerald">{tr("Membership")}</h2><DefList rows={[
              { label: tr("Status"), value: <StatusBadge status={m.status} /> },
              { label: tr("Ticket number"), value: m.ticketNo },
              { label: tr("Current instalment"), value: tr("{n} of {m}", { n: m.currentInstalment, m: s.rules.instalments }) },
              { label: tr("Prize status"), value: pending ? tr("Not applicable until enrolment is complete") : tr(m.prizeStatus) },
              { label: tr("Scheme status"), value: <StatusBadge status={s.status} /> },
              { label: tr("Illustrative dividends so far"), value: pending ? "—" : formatINRPrecise(dividend) },
            ]} /></CardBody></Surface>
            <Surface><CardBody><h2 className="mb-2 font-bold text-emerald">{tr("Scheme terms (illustrative)")}</h2><DefList rows={[
              { label: tr("Gross chit"), value: formatINR(s.rules.grossChit) },
              { label: tr("Tickets / instalments"), value: `${s.rules.tickets} / ${s.rules.instalments}` },
              { label: tr("Monthly instalment"), value: formatINR(s.rules.instalment) },
              { label: tr("Maximum auction discount"), value: formatBps(s.rules.maxDiscountBps) },
              { label: pending ? tr("Expected first due date") : tr("Next payment due"), value: pending ? tr("{date} (not yet payable)", { date: formatDate(m.nextDue) }) : formatDate(m.nextDue) },
              { label: tr("Future obligation"), value: pending ? tr("Applies after activation") : tr("{amt} ({n} instalments)", { amt: formatINR(k.future), n: k.remaining }) },
            ]} /><p className="mt-3 text-xs text-muted">{tr(s.commencementNote)}</p></CardBody></Surface>
            <Surface className="md:col-span-2"><CardBody>
              <h2 className="mb-4 font-bold text-emerald">{tr("Activity timeline")}</h2>
              {tl.dated.length + tl.undated.length === 0 ? <p className="text-sm text-muted">{tr("No activity yet.")}</p> : (
                <>
                  {tl.dated.length > 0 && <Timeline events={tl.dated} />}
                  {tl.undated.length > 0 && (<><h3 className="mb-3 mt-6 text-sm font-bold text-ink">{tr("Documents (no date recorded in demo data)")}</h3><Timeline events={tl.undated} /></>)}
                </>
              )}
            </CardBody></Surface>
          </div>
        ) },
        { value: "payments", label: tr("Payments"), content: payments.length === 0
          ? <EmptyState title={tr("No payments yet")} text={pending ? tr("Payments begin once your enrolment is complete.") : tr("No payments have been recorded for this ticket.")} action={pending ? <Button href="/register">{tr("Continue registration")}</Button> : undefined} />
          : <DataTable caption={tr("Payments for this membership")} columns={paymentColumns} rows={payments} rowKey={(p) => p.id} /> },
        { value: "auctions", label: tr("Auctions"), content: auctions.length === 0
          ? <EmptyState title={tr("No auctions yet")} text={tr("Auctions for this scheme will be listed once they are scheduled.")} />
          : <DataTable caption={tr("Auctions for this scheme")} columns={auctionColumns} rows={auctions} rowKey={(a) => a.id} /> },
        { value: "documents", label: tr("Documents"), content: docs.length === 0
          ? <EmptyState title={tr("No documents")} text={tr("Documents for this membership will appear here.")} />
          : <ul className="divide-y divide-line rounded-lg border border-line bg-white">{docs.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 p-4"><div><p className="text-sm font-semibold">{tr(x.name)}</p><p className="text-xs text-muted">{x.fileUrl ? tr(x.note) : `${tr("No file available yet.")} ${tr(x.note)}`}</p></div><StatusBadge status={x.category} /></li>))}</ul> },
        { value: "financial", label: tr("Financial breakdown"), content: <BreakdownTab key={m.id} m={m} s={s} auctions={auctions} /> },
      ]} />
    </>
  );
}

export function ChitDetailView({ id }: { id: string }) { return <DataGate>{(d) => <Detail d={d} id={id} />}</DataGate>; }
