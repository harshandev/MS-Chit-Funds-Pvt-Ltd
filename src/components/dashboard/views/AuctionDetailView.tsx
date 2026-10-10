"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { StepTracker } from "@/components/ui/StepTracker";
import { SuccessNote } from "@/components/ui/fx";
import { CountUp } from "@/components/motion/CountUp";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { DataTable } from "@/components/ui/DataTable";
import { Breadcrumbs, ErrorState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { computeBreakdown, validateRules } from "@/lib/chit";
import { formatBps, formatINR, formatINRPrecise, pctToBps } from "@/lib/money";
import { useTr } from "@/i18n/LanguageProvider";
import type { Auction, Scheme } from "@/data/types";
import { DataGate, DefList, PageHeader, PanelTitle, StatusChip, Surface } from "../ui";
import { auctionSteps } from "../auctionSteps";
import { schemeFor, type Snapshot } from "../DashboardData";
import { useDates } from "../format";
import { BreakdownTable } from "../BreakdownTable";

const stamp = "ILLUSTRATIVE — not a signed or regulator-issued document"; // translated at render

function BidForm({ a, s, ticketNo }: { a: Auction; s: Scheme; ticketNo: number }) {
  const toast = useToast();
  const tr = useTr();
  const max = s.rules.maxDiscountBps / 100;
  const schema = z.object({
    discount: z.string().trim().min(1, tr("Enter your discount percentage."))
      .refine((v) => !Number.isNaN(Number(v)), tr("Enter a valid number."))
      .refine((v) => Number(v) >= 0 && Number(v) <= max, tr("Discount must be between 0% and {max}% for this scheme.", { max }))
      .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), tr("Use at most two decimal places.")),
  });
  type Form = z.infer<typeof schema>;
  const { register, handleSubmit, control, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { discount: "" } });
  const [pending, setPending] = useState<number | null>(null);
  const [recorded, setRecorded] = useState<number | null>(null);
  const bd = pending != null ? computeBreakdown(s.rules, pending, a.instalmentNo) : null;
  const reduce = useReducedMotion();
  const raw = (useWatch({ control, name: "discount" }) ?? "").trim();
  const live = (() => {
    if (!raw) return null;
    const n = Number(raw);
    if (Number.isNaN(n) || !/^\d+(\.\d{1,2})?$/.test(raw)) return { ok: false as const, text: tr("Enter a number with at most two decimal places.") };
    if (n < 0 || n > max) return { ok: false as const, text: tr("Outside the allowed range of 0% to {max}% for this scheme.", { max }) };
    const bps = pctToBps(n);
    return { ok: true as const, n, bd: computeBreakdown(s.rules, bps, a.instalmentNo), bps };
  })();
  const issues = pending != null ? validateRules(s.rules, pending).filter((i) => i.field === "discount") : [];

  return (
    <Surface>
      <CardBody>
        <PanelTitle>{tr("Place a bid (demo)")}</PanelTitle>
        <form noValidate onSubmit={handleSubmit((v) => setPending(pctToBps(Number(v.discount))))} className="space-y-4">
          <TextField label={tr("Your discount (% of gross chit)")} inputMode="decimal" placeholder={tr("0 to {max}", { max })} hint={tr("Ticket {n}. Allowed range 0 to {max}% (maximum {pct} of {amt}).", { n: ticketNo, max, pct: formatBps(s.rules.maxDiscountBps), amt: formatINR(s.rules.grossChit) })} error={errors.discount?.message} {...register("discount")} />
          <div aria-live="polite" className="min-h-[4.25rem]">
            {live && (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                  <motion.div className={`h-full origin-left rounded-full ${live.ok ? "bg-emerald" : "bg-danger"}`} initial={false} animate={{ scaleX: live.ok ? Math.max(0.02, live.n / max) : 1 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }} />
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={live.ok ? "ok" : live.text} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className={`mt-2 text-sm ${live.ok ? "text-ink" : "font-medium text-danger"}`}>
                    {live.ok ? <span className="tabular-nums">{tr("Discount {d} · if this bid won, the illustrative net chit would be {n}.", { d: formatINRPrecise(live.bd.discount), n: formatINRPrecise(live.bd.netChit) })}</span> : live.text}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}
          </div>
          <Button type="submit">{tr("Review bid")}</Button>
        </form>
        {recorded != null && <SuccessNote className="mt-4"><p>{tr("Your demo bid of {pct} is recorded locally in demo mode. It is not authoritative.", { pct: formatBps(recorded) })}</p></SuccessNote>}
        <p className="mt-4 text-xs text-muted">{tr("Production auctions use server-side time and validation. Any client-side clock or countdown is NOT authoritative, so none is shown here; only the scheduled time is displayed.")}</p>
      </CardBody>
      <Dialog open={pending != null} onOpenChange={(o) => { if (!o) setPending(null); }} title={tr("Confirm your bid")} description={tr("Simulated bid, for demonstration only.")}
        footer={<><Button variant="ghost" onClick={() => setPending(null)}>{tr("Cancel")}</Button><Button onClick={() => { if (pending != null) { setRecorded(pending); toast(tr("Bid recorded in demo mode — not authoritative")); setPending(null); } }}>{tr("Confirm bid")}</Button></>}>
        {pending != null && bd && (
          <div className="space-y-3">
            <p>{tr("You are bidding a discount of {pct} ({amt}) on ticket {n}.", { pct: formatBps(pending), amt: formatINRPrecise(bd.discount), n: ticketNo })}</p>
            <p className="text-muted">{tr("If this bid won, the illustrative net chit amount would be {amt}.", { amt: formatINRPrecise(bd.netChit) })}</p>
            {issues.map((i) => <p key={i.message} className="rounded-md bg-warning/10 p-2 text-warning">{tr(i.message)}</p>)}
          </div>
        )}
      </Dialog>
    </Surface>
  );
}

function Statement({ a, s }: { a: Auction; s: Scheme }) {
  const tr = useTr();
  const { formatDateTime } = useDates();
  if (a.discountBps == null || a.winningTicket == null) return null;
  const b = computeBreakdown(s.rules, a.discountBps, a.instalmentNo);
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
    <Surface className="border-2 border-gold/60">
      <CardBody>
        <motion.p initial={{ opacity: 0, rotate: -4, scale: 1.2 }} whileInView={{ opacity: 1, rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }} className="mb-3 inline-block rounded bg-navy px-2 py-1 text-xs font-bold tracking-wide text-ivory">{tr(stamp)}</motion.p>
        <h2 className="font-heading text-lg font-bold text-emerald">{tr("Illustrative auction result statement")}</h2>
        <DefList reveal className="mt-3" rows={[
          { label: tr("Scheme reference"), value: `${tr(s.name)} (${s.id})` },
          { label: tr("Instalment reference"), value: tr("Instalment {n} of {m}", { n: a.instalmentNo, m: s.rules.instalments }) },
          { label: tr("Auction date and time"), value: formatDateTime(a.scheduledAt) },
          { label: tr("Participants and rules"), value: tr("Eligible tickets: {elig} Maximum discount {pct}. Participant list is not available in demo data.", { elig: tr(a.eligibility), pct: formatBps(s.rules.maxDiscountBps) }) },
          { label: tr("Tie-break rule"), value: tr(a.tieBreakRule) },
          { label: tr("Winning ticket"), value: a.winningTicket },
          { label: tr("Winning discount"), value: `${formatBps(a.discountBps)} (${formatINRPrecise(b.discount)})` },
          { label: tr("Net chit amount"), value: <strong className="tabular-nums"><CountUp value={b.netChit} format={(n) => formatINRPrecise(Math.round(n))} duration={1.2} /></strong> },
          { label: tr("Verification status"), value: <StatusBadge status="Result published" /> },
          { label: tr("Audit reference"), value: a.auditRef ?? "—" },
        ]} />
        <h3 className="mb-1 mt-5 text-sm font-bold text-ink">{tr("Calculation breakdown")}</h3>
        <BreakdownTable b={b} rules={s.rules} discountBps={a.discountBps} />
        <p className="mt-4 text-xs font-semibold text-muted">{tr(stamp)}</p>
      </CardBody>
    </Surface>
    </motion.div>
  );
}

function Detail({ d, id }: { d: Snapshot; id: string }) {
  const tr = useTr();
  const { formatDateTime } = useDates();
  const a = d.auctions.find((x) => x.id === id);
  const s = a ? schemeFor(d, a.schemeId) : undefined;
  if (!a || !s) return <ErrorState title={tr("Auction not found")} text={tr("This auction does not exist.")} action={<Button href="/dashboard/auctions">{tr("Back to auctions")}</Button>} />;
  const mem = d.memberships.find((m) => m.schemeId === a.schemeId && m.status === "Active");
  const steps = auctionSteps(a.state, tr);
  const history = d.auctions.filter((x) => x.schemeId === a.schemeId).sort((x, y) => y.instalmentNo - x.instalmentNo);

  const stateBlock = (() => {
    switch (a.state) {
      case "Scheduled": return <Surface><CardBody><PanelTitle>{tr("Scheduled")}</PanelTitle><p className="text-sm">{tr("Bidding opens at the scheduled time: {date}. No bid form is available until the auction is open.", { date: formatDateTime(a.scheduledAt) })}</p></CardBody></Surface>;
      case "Open": return mem
        ? <BidForm a={a} s={s} ticketNo={mem.ticketNo} />
        : <Surface><CardBody><PanelTitle>{tr("Open")}</PanelTitle><p className="text-sm text-muted">{tr("You do not have an active ticket in this scheme, so you cannot bid.")}</p></CardBody></Surface>;
      case "Closed": return <Surface><CardBody><PanelTitle>{tr("Closed")}</PanelTitle><p className="text-sm text-muted">{tr("Bidding has closed. The result will be verified before it is published.")}</p></CardBody></Surface>;
      case "Result pending verification": return (
        <Surface className="border-warning/40"><CardBody>
          <PanelTitle>{tr("Provisional result — UNVERIFIED")}</PanelTitle>
          <p className="text-sm">{tr("Provisional winning ticket {n} at {pct} discount. This result has not been verified and may change. Financial figures are shown only after verification and publication.", { n: a.winningTicket ?? "", pct: formatBps(a.discountBps ?? 0) })}</p>
        </CardBody></Surface>);
      case "Result published": return <Statement a={a} s={s} />;
      case "Cancelled": return <Surface><CardBody><PanelTitle>{tr("Cancelled")}</PanelTitle><p className="text-sm text-muted">{tr("This auction was cancelled. No result exists for it.")}</p></CardBody></Surface>;
      case "Rescheduled": return <Surface><CardBody><PanelTitle>{tr("Rescheduled")}</PanelTitle><p className="text-sm text-muted">{tr("This auction was rescheduled; the original time shown was {date}. A new schedule will be notified. No result exists for this instance.", { date: formatDateTime(a.scheduledAt) })}</p></CardBody></Surface>;
    }
  })();

  return (
    <>
      <Breadcrumbs items={[{ label: tr("Auctions"), href: "/dashboard/auctions" }, { label: tr("{name} · instalment {n}", { name: tr(s.name), n: a.instalmentNo }) }]} />
      <PageHeader title={tr("Auction · instalment {n}", { n: a.instalmentNo })} intro={tr(s.name)} actions={<StatusChip status={a.state} />} />
      <div role="note" className="mb-6 flex gap-3 rounded-lg border-2 border-navy bg-navy/5 p-4 text-sm text-navy">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p><strong>{tr("SIMULATED AUCTION.")}</strong> {tr("Nothing here is a real auction, bid or result. Scheduled time: {date}.", { date: formatDateTime(a.scheduledAt) })}</p>
      </div>
      <Surface className="mb-6 p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{tr("Auction lifecycle")}</p>
        {steps ? <StepTracker steps={steps} label={tr("Auction lifecycle")} /> : <p className="rounded-xl bg-line/50 px-3 py-2 text-sm text-muted">{tr("This auction is {state} and is off the normal Scheduled → Open → Closed → Pending verification → Published path.", { state: tr(a.state).toLowerCase() })}</p>}
      </Surface>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">{stateBlock}</div>
        <Surface className="lg:col-span-2"><CardBody>
          <PanelTitle>{tr("Auction details")}</PanelTitle>
          <DefList rows={[
            { label: tr("Scheme"), value: <>{tr(s.name)}<br /><span className="text-xs text-muted">{s.id}</span></> },
            { label: tr("Instalment number"), value: tr("{n} of {m}", { n: a.instalmentNo, m: s.rules.instalments }) },
            { label: tr("Gross chit"), value: formatINR(s.rules.grossChit) },
            { label: tr("Maximum discount"), value: `${formatBps(s.rules.maxDiscountBps)} (${formatINR(Math.round((s.rules.grossChit * s.rules.maxDiscountBps) / 10000))})` },
            { label: tr("Scheduled"), value: formatDateTime(a.scheduledAt) },
            { label: tr("Current state"), value: <StatusBadge status={a.state} /> },
            { label: tr("Eligibility"), value: tr(a.eligibility) },
            { label: tr("Tie-break rule"), value: tr(a.tieBreakRule) },
          ]} />
        </CardBody></Surface>
      </div>
      <section className="mt-8" aria-labelledby="hist">
        <PanelTitle id="hist">{tr("Auction history for this scheme")}</PanelTitle>
        <DataTable caption={tr("Auction history")} rows={history} rowKey={(x) => x.id} columns={[
          { key: "i", header: tr("Instalment"), render: (x) => `#${x.instalmentNo}` },
          { key: "d", header: tr("Scheduled"), render: (x) => formatDateTime(x.scheduledAt) },
          { key: "s", header: tr("State"), render: (x) => <StatusBadge status={x.state} /> },
          { key: "r", header: tr("Result"), render: (x) => x.state === "Result published" ? tr("Ticket {n} · {pct}", { n: x.winningTicket ?? "", pct: formatBps(x.discountBps ?? 0) }) : "—" },
          { key: "l", header: tr("Details"), render: (x) => x.id === a.id ? <span className="text-muted">{tr("Viewing")}</span> : <Link href={`/dashboard/auctions/${x.id}`} className="font-semibold text-emerald hover:underline">{tr("View")}</Link> },
        ]} />
      </section>
    </>
  );
}

export function AuctionDetailView({ id }: { id: string }) { return <DataGate>{(d) => <Detail d={d} id={id} />}</DataGate>; }
