import type { Metadata } from "next";
import Link from "next/link";
import { computeBreakdown } from "@/lib/chit";
import { formatBps, formatINR } from "@/lib/money";
import { learnTopics } from "@/components/marketing/HomeSections";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "@/components/marketing/constants";
import { Container, LegalPlaceholder, PageHero, Prose } from "@/components/marketing/shared";
import { DemoNote } from "@/components/ui/misc";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How Chit Funds Work",
  description: "Plain-language guides to chit funds: monthly instalments, auction discounts, what happens after winning, future instalments and reading a chit agreement.",
};

export default function HowItWorksPage() {
  const r = showcaseScheme.rules;
  const b = computeBreakdown(r, ILLUSTRATIVE_DISCOUNT_BPS);
  const w = computeBreakdown(r, ILLUSTRATIVE_DISCOUNT_BPS, 6);
  return (
    <>
      <PageHero eyebrow="How it works" title="Chit funds, explained step by step." intro="A chit is a group arrangement where members contribute every month and, each month, one member receives the pooled amount. These guides explain the ideas in plain language. Specific rules always come from the approved scheme agreement." />
      <Container className="grid gap-10 py-12 lg:grid-cols-[16rem_1fr] [&>*]:min-w-0">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">On this page</p>
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {learnTopics.map((t) => (
              <li key={t.id} className="shrink-0"><a href={`#${t.id}`} className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold text-emerald hover:border-gold-antique lg:border-0 lg:bg-transparent lg:px-0">{t.title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">
          <DemoNote>Illustrative demo scheme — all figures below use a sample {formatINR(r.grossChit)} scheme with {r.tickets} tickets and a sample discount. They are not offers or real results.</DemoNote>

          <section id="how-chit-funds-work" className="scroll-mt-24">
            <Prose>
              <h2>How chit funds work</h2>
              <p>A fixed number of members (tickets) agree to contribute a fixed instalment each month for a fixed number of months. The total of one month&apos;s instalments is the <strong>gross chit</strong>. In our sample, {r.tickets} tickets each contribute {formatINR(r.instalment)}, so the gross chit is {formatINR(r.grossChit)}.</p>
              <ol>
                <li>Every month, all members contribute their instalment.</li>
                <li>An auction is held among eligible members who wish to receive the chit amount that month.</li>
                <li>The member who accepts the largest discount wins; the winning ticket receives the net chit amount.</li>
                <li>The discount, less the foreman&apos;s commission, is shared back among members as a dividend, reducing what they pay.</li>
                <li>This repeats until every ticket has had its turn and the scheme closes.</li>
              </ol>
              <p>Who is eligible to bid, how ties are resolved, and when auctions happen are set out in the approved scheme agreement, not on this page.</p>
            </Prose>
          </section>

          <section id="auction-discounts" className="scroll-mt-24">
            <Prose>
              <h2>Understanding auction discounts</h2>
              <p>The winning bidder accepts less than the gross chit in exchange for receiving money earlier than their turn would otherwise come. That difference is the <strong>auction discount</strong>.</p>
              <p>Example with a sample {formatBps(ILLUSTRATIVE_DISCOUNT_BPS)} discount on {formatINR(b.gross)}: the discount is {formatINR(b.discount)} and the net chit amount is {formatINR(b.netChit)}.</p>
              <ul>
                <li><strong>Foreman commission</strong> ({formatBps(r.commissionBps)} in this sample, {formatINR(b.commission)}) is taken from the discount and is configured per scheme.</li>
                <li><strong>Distributable amount</strong> is the discount minus the commission: {formatINR(b.distributable)}.</li>
                <li><strong>Dividend per ticket</strong> is that amount shared across the tickets set by the agreement: {formatINR(b.dividendPerTicket)}.</li>
              </ul>
              <p>A larger discount means a smaller net chit for the winner and a larger dividend for everyone. Schemes usually cap the maximum discount; the cap for a real scheme is stated in its agreement.</p>
            </Prose>
          </section>

          <section id="after-winning" className="scroll-mt-24">
            <Prose>
              <h2>What happens after winning</h2>
              <p>Winning an auction means a ticket has received (or become entitled to) the net chit amount, subject to the scheme&apos;s payout conditions. Typically this involves verification steps and documents before any payout; these steps come from the approved agreement and applicable requirements.</p>
              <ul>
                <li>The winning ticket does not leave the scheme: it keeps contributing for the remaining months.</li>
                <li>How dividends apply to a prized ticket depends on the agreement. In our sample, a prized ticket does not receive dividends on later instalments.</li>
                <li>Payout is not instant: identity, bank and any security requirements must be completed first.</li>
              </ul>
              <LegalPlaceholder>Payout conditions, security requirements and timelines will be stated here from the approved scheme agreement.</LegalPlaceholder>
            </Prose>
          </section>

          <section id="future-instalments" className="scroll-mt-24">
            <Prose>
              <h2>Understanding future instalments</h2>
              <p>Receiving the chit amount does not end your obligation. A winning ticket continues to pay the remaining instalments in full.</p>
              <p>In our sample, a ticket that wins in month 6 of {r.instalments} has {w.remainingAfterWin} instalments still to pay. At {formatINR(w.payableWinner)} each, that is a continuing obligation of {formatINR(w.futureObligationWinner)}.</p>
              <p>Non-winning tickets pay the instalment minus the month&apos;s dividend ({formatINR(b.payableNonWinner)} in the sample for a month using the sample discount). Because dividends depend on each month&apos;s auction, the amount actually payable varies.</p>
              <p>Late payments, defaults and the consequences of missing instalments are defined in the agreement. Please read those provisions before enrolling.</p>
            </Prose>
          </section>

          <section id="reading-agreement" className="scroll-mt-24">
            <Prose>
              <h2>Reading a chit agreement</h2>
              <p>Before signing any chit agreement, read it fully and ask for clarification on anything unclear. Points worth checking:</p>
              <ul>
                <li>Gross chit, number of tickets, instalment amount and duration.</li>
                <li>Foreman commission and how it is calculated.</li>
                <li>Maximum auction discount, eligibility to bid and tie-breaking rules.</li>
                <li>How dividends are calculated and who receives them.</li>
                <li>Security or guarantor requirements before payout.</li>
                <li>Late-payment, default, transfer, nomination and withdrawal provisions.</li>
                <li>What happens in the event of a member&apos;s death.</li>
                <li>Registration and sanction details of the scheme.</li>
              </ul>
              <p>You can see the headings we will cover for each scheme on its detail page. Until terms are approved those sections are clearly marked as placeholders.</p>
            </Prose>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-line pt-8">
            <Link href="/calculator" className={buttonClass("primary")}>Try the calculator</Link>
            <Link href="/chit-plans" className={buttonClass("secondary")}>Explore chit plans</Link>
            <Link href="/faq" className={buttonClass("ghost")}>Read the FAQ</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
