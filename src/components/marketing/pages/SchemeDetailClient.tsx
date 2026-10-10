"use client";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Lock } from "lucide-react";
import type { Scheme } from "@/data/types";
import { computeBreakdown, validateRules } from "@/lib/chit";
import { formatBps, formatINR, formatLakh } from "@/lib/money";
import { StatusBadge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/misc";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";
import { Spotlight } from "@/components/motion/Spotlight";
import { BreakdownPanel } from "../BreakdownPanel";
import { schemeFaqs } from "../faqs";
import { Container, LegalPlaceholder } from "../shared";
import { InstalmentLadder } from "./InstalmentLadder";
import { Money } from "./Money";
import { RangeSlider } from "./RangeSlider";
import { SectionNav } from "./SectionNav";
import { Legend, SplitBar } from "./SplitBar";
import { useScrollSpy } from "./useScrollSpy";

const termSections = [
  { id: "approval", title: "Approval and document details", note: "Registration, sanction and approval references, and the approved scheme document, will be listed here." },
  { id: "auction-rules", title: "Auction rules", note: "Auction frequency, eligibility to bid, tie-breaking and result publication rules will be stated here." },
  { id: "methodology", title: "Discount and dividend methodology", note: "The approved method for the maximum discount, dividend calculation and who shares it." },
  { id: "commission", title: "Foreman commission", note: "The approved commission and how it is charged." },
  { id: "obligations", title: "Future instalment obligations", note: "The continuing obligations of a ticket after it receives the chit amount." },
  { id: "default", title: "Default, late payment and transfer", note: "Consequences of late or missed instalments, and whether and how a ticket can be transferred." },
  { id: "nomination", title: "Nomination", note: "How a nominee can be recorded and what they may do." },
  { id: "withdrawal", title: "Withdrawal", note: "Whether and how a member may withdraw, and the consequences." },
  { id: "death", title: "Death of a member", note: "What happens to a ticket on the death of a member." },
] as const;

const nav = [
  { id: "overview", label: "Overview" }, { id: "figures", label: "Key figures" }, { id: "commencement", label: "Commencement" },
  { id: "terms", label: "Terms" }, { id: "example", label: "Prize calculation" }, { id: "instalments", label: "Future instalments" },
  { id: "faqs", label: "FAQs" }, { id: "agreement", label: "Agreement" },
];
const navIds = nav.map((n) => n.id);

function Block({ id, title, accent, children }: { id: string; title: string; accent?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 border-t border-line py-10 first:border-t-0 first:pt-0">
      <Reveal>
        <h2 id={`${id}-h`} className="text-2xl font-extrabold text-emerald sm:text-3xl">{title}{accent && <> <span className="font-serif font-normal italic text-gold-antique">{accent}</span></>}</h2>
      </Reveal>
      <div className="mt-5 space-y-5 text-sm leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

function Fig({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Spotlight className="rounded-2xl">
      <div className="h-full rounded-2xl border border-line/80 bg-white p-4 shadow-[var(--shadow-1)]">
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
        <dd className="mt-1 text-xl font-extrabold tabular-nums text-emerald sm:text-2xl">{children}</dd>
      </div>
    </Spotlight>
  );
}

export function SchemeDetailClient({ scheme }: { scheme: Scheme }) {
  const r = scheme.rules;
  const active = scheme.status === "Active";
  const spy = useScrollSpy(navIds, 170);
  const [bps, setBps] = useState(1500);
  const [win, setWin] = useState(1);
  const b = useMemo(() => computeBreakdown(r, bps, win), [r, bps, win]);
  const issues = useMemo(() => validateRules(r, bps), [r, bps]);
  const segs = [
    { label: "Net chit to winner", value: b.netChit, color: "var(--emerald)" },
    { label: "Foreman commission", value: Math.min(b.commission, b.discount), color: "var(--gold)" },
    { label: "Dividend pool", value: b.distributable, color: "var(--navy)" },
  ];

  return (
    <Container className="pb-36 pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:pt-12">
      <div className="min-w-0">
        <div className="sticky top-[4.25rem] z-20 -mx-4 bg-ivory/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <SectionNav items={nav} active={spy} uid="sd-m" title="Scheme sections" />
        </div>
        <div className="mt-6 lg:mt-0">
          <Block id="overview" title="Overview">
            <DemoNote>Illustrative demo scheme — not an actual scheme, quote or offer.</DemoNote>
            <p className="max-w-2xl text-base">{scheme.summary} This is a chit of {formatLakh(r.grossChit)} with {r.tickets} tickets, running for {r.instalments} monthly instalments. A chit is a participation arrangement, not a deposit, and no return is guaranteed.</p>
          </Block>

          <Block id="figures" title="Key figures">
            <dl className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              <Fig label="Chit value"><CountUp value={r.grossChit / 100} format={(n) => formatINR(Math.round(n) * 100)} /></Fig>
              <Fig label="Monthly instalment"><CountUp value={r.instalment / 100} format={(n) => formatINR(Math.round(n) * 100)} /></Fig>
              <Fig label="Duration"><CountUp value={r.instalments} /> months</Fig>
              <Fig label="Tickets"><CountUp value={r.tickets} /></Fig>
              <Fig label="Foreman commission (configured)">{formatBps(r.commissionBps)}</Fig>
              <Fig label="Maximum discount (configured)">{formatBps(r.maxDiscountBps)}</Fig>
            </dl>
            <p className="text-muted">Commission and maximum discount are demo configuration values and must be confirmed in the approved agreement.</p>
          </Block>

          <Block id="commencement" title="Commencement status">
            <p className="flex items-center gap-2"><span className="font-semibold">Status:</span> <StatusBadge status={scheme.status} /></p>
            <p>{scheme.commencementNote}</p>
            {active ? (
              <p>This scheme is shown as active in the demo, so the onboarding walkthrough is available. Onboarding here is a demo and does not enrol you in anything.</p>
            ) : (
              <p className="rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-1)]">This scheme is <strong>{scheme.status}</strong>. Onboarding is not open: you can send an enquiry and we will respond once there is something to share. A scheme can only be joined after it is approved and has commenced.</p>
            )}
          </Block>

          <section id="terms" className="scroll-mt-28 border-t border-line py-10" aria-labelledby="terms-h">
            <Reveal><h2 id="terms-h" className="text-2xl font-extrabold text-emerald sm:text-3xl">Scheme <span className="font-serif font-normal italic text-gold-antique">terms</span></h2></Reveal>
            <p className="mt-3 max-w-2xl text-sm text-muted">The sections below are placeholders. Every term must come from the approved scheme agreement and be reviewed legally before publication. Nothing here states a legal term.</p>
            <Stagger className="mt-6 grid gap-4 md:grid-cols-2" gap={0.05}>
              {termSections.map((t) => (
                <StaggerItem key={t.id}>
                  <div id={t.id} className="h-full scroll-mt-28 rounded-2xl border border-line/80 bg-white p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
                    <h3 className="flex items-center gap-2 text-base font-bold text-emerald"><Lock className="h-4 w-4 text-gold-antique" aria-hidden />{t.title}</h3>
                    <p className="mt-1 text-sm text-muted">{t.note}</p>
                    <div className="mt-3"><LegalPlaceholder>{t.id === "auction-rules" ? scheme.auctionNote : undefined}</LegalPlaceholder></div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          <Block id="example" title="Prize amount" accent="what-if">
            <p className="max-w-2xl">Drag the sample discount to see how the prize amount, commission and dividend pool change. The real calculation follows the approved agreement.</p>
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-900 p-5 text-ivory shadow-[var(--shadow-3)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">What-if · illustrative only</p>
              </div>
              <div className="mt-4 [&_label]:text-ivory [&_output]:text-gold">
                <RangeSlider label="Sample auction discount" value={bps} min={0} max={r.maxDiscountBps} step={50} onChange={setBps} display={formatBps(bps)} tone="gold" hint={undefined} />
              </div>
              <p className="mt-2 text-xs text-ivory/60">Sample cap for this scheme: {formatBps(r.maxDiscountBps)} (configured demo value). Not a real auction result.</p>
              <div className="mt-6 rounded-2xl bg-ivory/5 p-4 ring-1 ring-ivory/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-ivory/60">Net chit to the winning ticket</p>
                <p className="mt-1 font-serif text-4xl text-gold-soft sm:text-5xl"><Money paise={b.netChit} /></p>
              </div>
              <div className="mt-5 rounded-2xl bg-ivory p-4 text-ink"><SplitBar segs={segs} className="h-5" /><Legend segs={segs} fmt={formatINR} /></div>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-ivory/5 p-4 ring-1 ring-ivory/10"><dt className="text-xs text-ivory/60">Dividend per ticket</dt><dd className="mt-1 text-xl font-bold tabular-nums"><Money paise={b.dividendPerTicket} /></dd></div>
                <div className="rounded-2xl bg-ivory/5 p-4 ring-1 ring-ivory/10"><dt className="text-xs text-ivory/60">Non-winning ticket pays</dt><dd className="mt-1 text-xl font-bold tabular-nums"><Money paise={b.payableNonWinner} /></dd></div>
              </dl>
              <AnimatePresence>
                {issues.filter((i) => !i.message.startsWith("Note:")).map((i) => (
                  <motion.p key={i.message} role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-xl bg-gold/15 px-4 py-2.5 text-sm text-gold-soft">{i.message}</motion.p>
                ))}
              </AnimatePresence>
            </div>
            <BreakdownPanel rules={r} discountBps={bps} title="Illustrative prize amount calculation" />
          </Block>

          <Block id="instalments" title="Future instalment" accent="obligations">
            <p className="max-w-2xl">Receiving the chit amount does not end your obligation. Choose the instalment in which a ticket might win to see what remains. This is a continuing obligation under the same sample figures — not a forecast of any result.</p>
            <div className="rounded-3xl bg-white p-5 shadow-[var(--shadow-2)] ring-1 ring-line/70 sm:p-7">
              <RangeSlider label="Winning instalment (illustrative)" value={win} min={1} max={r.instalments} onChange={setWin} display={`${win} of ${r.instalments}`} tone="gold" />
              <InstalmentLadder n={r.instalments} winMonth={win} className="mt-5" />
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-ivory p-4 ring-1 ring-line"><dt className="text-xs font-semibold uppercase tracking-wider text-muted">Instalments remaining</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-emerald"><CountUp value={b.remainingAfterWin} /></dd></div>
                <div className="rounded-2xl bg-ivory p-4 ring-1 ring-line"><dt className="text-xs font-semibold uppercase tracking-wider text-muted">Each instalment (sample)</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-emerald"><Money paise={b.payableWinner} /></dd></div>
                <div className="rounded-2xl bg-emerald p-4 text-ivory"><dt className="text-xs font-semibold uppercase tracking-wider text-gold-soft">Continuing obligation</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums"><Money paise={b.futureObligationWinner} /></dd></div>
              </dl>
            </div>
          </Block>

          <Block id="faqs" title="Frequently asked" accent="questions">
            <Accordion items={schemeFaqs.map((f) => ({ q: f.q, a: f.a }))} />
          </Block>

          <Block id="agreement" title="Scheme agreement">
            <p>The scheme agreement is not available yet. It will be provided here once it has been approved.</p>
            <Button disabled aria-disabled="true" variant="secondary"><Download className="h-4 w-4" />Download agreement (not yet available)</Button>
          </Block>
        </div>
      </div>

      <aside aria-label="Scheme summary" className="hidden lg:block">
        <div className="sticky top-24 space-y-5">
          <Tilt max={3} className="relative rounded-3xl">
            <div className="grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 text-ivory shadow-[var(--shadow-3)]">
              <div aria-hidden className="aurora pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-ivory"><StatusBadge status={scheme.status} /></span><span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-gold-soft">Illustrative</span></div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-ivory/60">Chit value</p>
                <p className="font-serif text-5xl text-gold-soft"><CountUp value={r.grossChit / 100} format={(n) => formatLakh(Math.round(n) * 100)} /></p>
                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-ivory/10 pt-4">
                  <div><dt className="text-[11px] uppercase tracking-wider text-ivory/60">Instalment</dt><dd className="mt-0.5 text-sm font-bold tabular-nums"><CountUp value={r.instalment / 100} format={(n) => formatINR(Math.round(n) * 100)} /></dd></div>
                  <div><dt className="text-[11px] uppercase tracking-wider text-ivory/60">Months</dt><dd className="mt-0.5 text-sm font-bold tabular-nums"><CountUp value={r.instalments} /></dd></div>
                  <div><dt className="text-[11px] uppercase tracking-wider text-ivory/60">Tickets</dt><dd className="mt-0.5 text-sm font-bold tabular-nums"><CountUp value={r.tickets} /></dd></div>
                </dl>
                <p className="mt-4 text-xs text-ivory/60">{active ? "Onboarding is a demo walkthrough." : `Status: ${scheme.status}. Onboarding is not open.`}</p>
              </div>
            </div>
          </Tilt>
          <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-[var(--shadow-1)]">
            <SectionNav items={nav} active={spy} uid="sd-d" title="Scheme sections" />
          </div>
        </div>
      </aside>
    </Container>
  );
}
