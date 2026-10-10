"use client";
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BookOpen, Check, FileSearch, Gavel, Layers, Scale } from "lucide-react";
import { computeBreakdown } from "@/lib/chit";
import { formatBps, formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/CountUp";
import { buttonClass } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/misc";
import { Container, LegalPlaceholder } from "../shared";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "../constants";
import { ChitCycle } from "./ChitCycle";
import { InstalmentLadder } from "./InstalmentLadder";
import { RangeSlider } from "./RangeSlider";
import { Legend, SplitBar } from "./SplitBar";
import { SectionNav } from "./SectionNav";
import { useScrollSpy } from "./useScrollSpy";
import { useTr } from "@/i18n/LanguageProvider";
import { RichT } from "./RichT";

const chapters = [
  { id: "how-chit-funds-work", n: "01", title: "How chit funds work", icon: BookOpen },
  { id: "auction-discounts", n: "02", title: "Understanding auction discounts", icon: Gavel },
  { id: "after-winning", n: "03", title: "What happens after winning", icon: Scale },
  { id: "future-instalments", n: "04", title: "Understanding future instalments", icon: Layers },
  { id: "reading-agreement", n: "05", title: "Reading a chit agreement", icon: FileSearch },
] as const;
const ids = chapters.map((c) => c.id);

function Chapter({ id, n, title, accent, lead, children, tone = "ivory" }: { id: string; n: string; title: string; accent: string; lead?: ReactNode; children: ReactNode; tone?: "ivory" | "white" }) {
  const tr = useTr();
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cn("scroll-mt-28 rounded-3xl p-5 sm:p-8", tone === "white" ? "bg-white shadow-[var(--shadow-1)] ring-1 ring-line/70" : "bg-transparent")}>
      <Reveal>
        <div className="flex items-start gap-4">
          <span aria-hidden className="font-serif text-5xl italic leading-none text-gold-antique/70 sm:text-6xl">{n}</span>
          <div>
            <h2 id={`${id}-h`} className="text-2xl font-extrabold text-emerald sm:text-3xl">{tr(title)}</h2>
            <p className="mt-1 font-serif text-lg italic text-gold-antique">{tr(accent)}</p>
          </div>
        </div>
        {lead && <div className="mt-5 max-w-2xl text-base leading-relaxed text-ink/90">{typeof lead === "string" ? tr(lead) : lead}</div>}
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Figure({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  const tr = useTr();
  return (
    <div className={cn("rounded-2xl p-4", strong ? "bg-emerald text-ivory" : "bg-ivory ring-1 ring-line")}>
      <dt className={cn("text-xs font-semibold uppercase tracking-wider", strong ? "text-gold-soft" : "text-muted")}>{tr(label)}</dt>
      <dd className={cn("mt-1 text-xl font-extrabold tabular-nums sm:text-2xl", strong ? "text-ivory" : "text-emerald")}><AnimatedNumber value={value / 100} format={(n) => formatINR(Math.round(n) * 100)} /></dd>
    </div>
  );
}

function DiscountExplorer() {
  const tr = useTr();
  const r = showcaseScheme.rules;
  const [bps, setBps] = useState(ILLUSTRATIVE_DISCOUNT_BPS);
  const b = useMemo(() => computeBreakdown(r, bps), [r, bps]);
  const lowDiscount = bps < r.commissionBps;
  const segs = [
    { label: tr("Net chit to winner"), value: b.netChit, color: "var(--emerald)" },
    { label: tr("Foreman commission"), value: Math.min(b.commission, b.discount), color: "var(--gold)" },
    { label: tr("Dividend pool"), value: b.distributable, color: "var(--navy)" },
  ];
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-2)] ring-1 ring-line/70 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">{tr("Try it · sample scheme")}</p>
      <RangeSlider label="Sample auction discount" value={bps} min={0} max={r.maxDiscountBps} step={50} onChange={setBps} display={formatBps(bps)} hint={tr("Sample cap in this demo: {pct} of the gross chit. Not a real auction result.", { pct: formatBps(r.maxDiscountBps) })} className="mt-3" />
      <div className="mt-5"><SplitBar segs={segs} className="h-5" /></div>
      <Legend segs={segs} fmt={formatINR} />
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <Figure label="Discount" value={b.discount} />
        <Figure label="Dividend pool" value={b.distributable} />
        <Figure label="Dividend per ticket" value={b.dividendPerTicket} strong />
      </dl>
      <AnimatePresence>
        {lowDiscount && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-xl bg-warning/10 px-4 py-2.5 text-sm text-ink">{tr("At this discount ({pct}) the commission ({comm} in this sample) is higher than the discount, so nothing is left to distribute.", { pct: formatBps(bps), comm: formatBps(r.commissionBps) })}</motion.p>}
      </AnimatePresence>
    </div>
  );
}

function ObligationExplorer() {
  const tr = useTr();
  const r = showcaseScheme.rules;
  const [win, setWin] = useState(6);
  const w = useMemo(() => computeBreakdown(r, ILLUSTRATIVE_DISCOUNT_BPS, win), [r, win]);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-2)] ring-1 ring-line/70 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">{tr("Try it · sample scheme")}</p>
      <RangeSlider label="If a ticket wins in instalment" value={win} min={1} max={r.instalments} onChange={setWin} display={tr("{a} of {b}", { a: win, b: r.instalments })} tone="gold" className="mt-3" />
      <InstalmentLadder n={r.instalments} winMonth={win} className="mt-5" />
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-ivory p-4 ring-1 ring-line"><dt className="text-xs font-semibold uppercase tracking-wider text-muted">{tr("Instalments still to pay")}</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-emerald"><AnimatedNumber value={w.remainingAfterWin} /></dd></div>
        <Figure label="Each instalment (sample)" value={w.payableWinner} />
        <Figure label="Continuing obligation" value={w.futureObligationWinner} strong />
      </dl>
    </div>
  );
}

const agreementPoints = [
  "Gross chit, number of tickets, instalment amount and duration.",
  "Foreman commission and how it is calculated.",
  "Maximum auction discount, eligibility to bid and tie-breaking rules.",
  "How dividends are calculated and who receives them.",
  "Security or guarantor requirements before payout.",
  "Late-payment, default, transfer, nomination and withdrawal provisions.",
  "What happens in the event of a member's death.",
  "Registration and sanction details of the scheme.",
];

function AgreementChecklist() {
  const tr = useTr();
  const [done, setDone] = useState<Record<number, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;
  const pct = (count / agreementPoints.length) * 100;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-2)] ring-1 ring-line/70 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">{tr("Your reading checklist")}</p>
        <p className="text-sm font-semibold tabular-nums text-emerald" aria-live="polite">{tr("{a} of {b} checked", { a: count, b: agreementPoints.length })}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" aria-hidden><motion.div className="h-full origin-left rounded-full bg-gold" initial={false} animate={{ scaleX: pct / 100 }} transition={{ type: "spring", stiffness: 120, damping: 20 }} /></div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {agreementPoints.map((p, i) => (
          <li key={p}>
            <label className={cn("flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors focus-within:ring-4 focus-within:ring-gold/30", done[i] ? "border-emerald/40 bg-emerald-50 text-ink" : "border-line bg-white text-ink hover:border-gold-antique")}>
              <input type="checkbox" className="peer sr-only" checked={!!done[i]} onChange={(e) => setDone((d) => ({ ...d, [i]: e.target.checked }))} />
              <span aria-hidden className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors", done[i] ? "border-emerald bg-emerald" : "border-line")}>
                <motion.span initial={false} animate={{ scale: done[i] ? 1 : 0, opacity: done[i] ? 1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}><Check className="h-3.5 w-3.5 text-ivory" strokeWidth={3.5} /></motion.span>
              </span>
              <span>{tr(p)}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{tr("This checklist is only for your own reference. Nothing is saved or sent. Until terms are approved, each scheme page shows these headings as clearly marked placeholders.")}</p>
    </div>
  );
}

const winSteps = [
  { t: "Win the auction", d: "A ticket has received, or become entitled to, the net chit amount, subject to the scheme's payout conditions." },
  { t: "Complete verification", d: "Identity, bank and any security requirements must be completed first. Payout is not instant." },
  { t: "Receive the net chit", d: "Paid under the approved agreement's conditions — which this page does not state." },
  { t: "Keep contributing", d: "The winning ticket does not leave the scheme: it keeps paying the remaining instalments in full." },
];

export function HowItWorksClient() {
  const tr = useTr();
  const r = showcaseScheme.rules;
  const b = computeBreakdown(r, ILLUSTRATIVE_DISCOUNT_BPS);
  const active = useScrollSpy(ids);
  return (
    <Container className="grid gap-10 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 [&>*]:min-w-0">
      <div className="sticky top-[4.25rem] z-20 -mx-4 bg-ivory/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <SectionNav items={chapters.map((c) => ({ id: c.id, label: c.title, n: c.n }))} active={active} uid="hiw" title="Chapters" />
      </div>

      <div className="space-y-14">
        <DemoNote>{tr("Illustrative demo scheme — all figures below use a sample {amt} scheme with {n} tickets and a sample discount. They are not offers or real results.", { amt: formatINR(r.grossChit), n: r.tickets })}</DemoNote>

        <Chapter id="how-chit-funds-work" n="01" title="How chit funds work" accent="One pot, one turn each, every month." lead={<RichT text="A fixed number of members (tickets) agree to contribute a fixed instalment each month for a fixed number of months. The total of one month's instalments is the <b>gross chit</b>. In our sample, {n} tickets each contribute {inst}, so the gross chit is {gross}." vars={{ n: r.tickets, inst: formatINR(r.instalment), gross: formatINR(r.grossChit) }} />}>
          <ChitCycle />
          <Stagger className="mt-6 grid gap-3 sm:grid-cols-2" gap={0.07}>
            {["Every month, all members contribute their instalment.", "An auction is held among eligible members who wish to receive the chit amount that month.", "The member who accepts the largest discount wins; the winning ticket receives the net chit amount.", "The discount, less the foreman's commission, is shared back among members as a dividend, reducing what they pay."].map((t, i) => (
              <StaggerItem key={t}><div className="flex h-full gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed shadow-[var(--shadow-1)] ring-1 ring-line/70"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald font-bold text-ivory">{i + 1}</span>{tr(t)}</div></StaggerItem>
            ))}
          </Stagger>
          <p className="mt-4 text-sm text-muted">{tr("This repeats until every ticket has had its turn and the scheme closes. Who is eligible to bid, how ties are resolved, and when auctions happen are set out in the approved scheme agreement, not on this page.")}</p>
        </Chapter>

        <Chapter id="auction-discounts" n="02" title="Understanding auction discounts" accent="Why the winner accepts less." tone="white" lead={<RichT text="The winning bidder accepts less than the gross chit in exchange for receiving money earlier than their turn would otherwise come. That difference is the <b>auction discount</b>. With a sample {pct} discount on {gross}, the discount is {disc} and the net chit is {net}." vars={{ pct: formatBps(ILLUSTRATIVE_DISCOUNT_BPS), gross: formatINR(b.gross), disc: formatINR(b.discount), net: formatINR(b.netChit) }} />}>
          <DiscountExplorer />
          <ul className="mt-6 grid gap-3 text-sm leading-relaxed sm:grid-cols-3">
            <li className="rounded-2xl bg-ivory p-4"><RichT text="<b>Foreman commission</b> ({pct} in this sample, {amt}) is taken from the discount and is configured per scheme." vars={{ pct: formatBps(r.commissionBps), amt: formatINR(b.commission) }} /></li>
            <li className="rounded-2xl bg-ivory p-4"><RichT text="<b>Distributable amount</b> is the discount minus the commission: {amt} at the sample discount." vars={{ amt: formatINR(b.distributable) }} /></li>
            <li className="rounded-2xl bg-ivory p-4"><RichT text="<b>Dividend per ticket</b> is that amount shared across the tickets set by the agreement: {amt}." vars={{ amt: formatINR(b.dividendPerTicket) }} /></li>
          </ul>
          <p className="mt-4 text-sm text-muted">{tr("A larger discount means a smaller net chit for the winner and a larger dividend for everyone. Schemes usually cap the maximum discount; the cap for a real scheme is stated in its agreement.")}</p>
        </Chapter>

        <Chapter id="after-winning" n="03" title="What happens after winning" accent="A beginning, not an exit." lead="Winning an auction means a ticket has received (or become entitled to) the net chit amount, subject to the scheme's payout conditions. Typically this involves verification steps and documents before any payout; these steps come from the approved agreement and applicable requirements.">
          <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {winSteps.map((s, i) => (
              <motion.li key={s.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }} className="relative list-none rounded-2xl bg-white p-5 shadow-[var(--shadow-1)] ring-1 ring-line/70">
                <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.2 + i * 0.1, stiffness: 400, damping: 18 }} className="grid h-9 w-9 place-items-center rounded-full bg-gold font-bold text-navy">{i + 1}</motion.span>
                <h3 className="mt-3 font-bold text-emerald">{tr(s.t)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{tr(s.d)}</p>
              </motion.li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">{tr("How dividends apply to a prized ticket depends on the agreement. In our sample, a prized ticket does not receive dividends on later instalments.")}</p>
          <div className="mt-4"><LegalPlaceholder>Payout conditions, security requirements and timelines will be stated here from the approved scheme agreement.</LegalPlaceholder></div>
        </Chapter>

        <Chapter id="future-instalments" n="04" title="Understanding future instalments" accent="Receiving the chit does not end the commitment." tone="white" lead="A winning ticket continues to pay the remaining instalments in full. Drag the slider to see how the month of the win changes what is still to pay in our sample scheme.">
          <ObligationExplorer />
          <p className="mt-5 text-sm leading-relaxed text-muted">{tr("Non-winning tickets pay the instalment minus the month's dividend ({amt} in the sample for a month using the sample discount). Because dividends depend on each month's auction, the amount actually payable varies. Late payments, defaults and the consequences of missing instalments are defined in the agreement. Please read those provisions before enrolling.", { amt: formatINR(b.payableNonWinner) })}</p>
        </Chapter>

        <Chapter id="reading-agreement" n="05" title="Reading a chit agreement" accent="Read it fully. Ask about anything unclear." lead="Before signing any chit agreement, read it fully and ask for clarification on anything unclear. Points worth checking:">
          <AgreementChecklist />
        </Chapter>

        <Reveal className="flex flex-wrap gap-3 border-t border-line pt-8">
          <Link href="/calculator" className={buttonClass("primary", "lg")}>{tr("Try the calculator")} <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/chit-plans" className={buttonClass("secondary", "lg")}>{tr("Explore chit plans")}</Link>
          <Link href="/faq" className={buttonClass("ghost", "lg")}>{tr("Read the FAQ")}</Link>
        </Reveal>
      </div>
    </Container>
  );
}
