import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getScheme, schemes } from "@/data/demo";
import { formatBps, formatINR, formatLakh } from "@/lib/money";
import { StatusBadge } from "@/components/ui/Badge";
import { Breadcrumbs, DemoNote } from "@/components/ui/misc";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { BreakdownPanel } from "@/components/marketing/BreakdownPanel";
import { SchemeStickyCta } from "@/components/marketing/EnquiryDialog";
import { schemeFaqs } from "@/components/marketing/faqs";
import { ILLUSTRATIVE_DISCOUNT_BPS } from "@/components/marketing/constants";
import { Container, LegalPlaceholder } from "@/components/marketing/shared";
import { computeBreakdown } from "@/lib/chit";

export function generateStaticParams() {
  return schemes.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/chit-plans/[id]">): Promise<Metadata> {
  const { id } = await params;
  const s = getScheme(id);
  if (!s) return { title: "Scheme not found" };
  return { title: s.name, description: `${s.summary} Illustrative demo scheme: key figures, status and terms headings.` };
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 id={`${id}-h`} className="text-2xl font-bold text-emerald">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

function Fig({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-bold tabular-nums text-emerald">{value}</dd>
    </div>
  );
}

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

export default async function SchemePage({ params }: PageProps<"/chit-plans/[id]">) {
  const { id } = await params;
  const scheme = getScheme(id);
  if (!scheme) notFound();
  const r = scheme.rules;
  const b = computeBreakdown(r, ILLUSTRATIVE_DISCOUNT_BPS);
  const active = scheme.status === "Active";

  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Chit plans", href: "/chit-plans" }, { label: scheme.name }]} />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={scheme.status} />
            <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-ink">Illustrative demo scheme</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-emerald sm:text-4xl">{scheme.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">{scheme.summary}</p>
        </Container>
      </div>
      <Container className="pb-32 pt-8">
        <nav aria-label="Scheme sections" className="-mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-2">
          {[["overview", "Overview"], ["figures", "Key figures"], ["commencement", "Commencement"], ["terms", "Terms"], ["example", "Prize calculation"], ["faqs", "FAQs"], ["agreement", "Agreement"]].map(([h, l]) => (
            <a key={h} href={`#${h}`} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-emerald hover:border-gold-antique">{l}</a>
          ))}
        </nav>
        <div className="max-w-4xl">
          <Block id="overview" title="Overview">
            <DemoNote>Illustrative demo scheme — not an actual scheme, quote or offer.</DemoNote>
            <p>{scheme.summary} This is a chit of {formatLakh(r.grossChit)} with {r.tickets} tickets, running for {r.instalments} monthly instalments. A chit is a participation arrangement, not a deposit, and no return is guaranteed.</p>
          </Block>

          <Block id="figures" title="Key figures">
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Fig label="Chit value" value={formatINR(r.grossChit)} />
              <Fig label="Monthly instalment" value={formatINR(r.instalment)} />
              <Fig label="Duration" value={`${r.instalments} months`} />
              <Fig label="Tickets" value={String(r.tickets)} />
              <Fig label="Foreman commission (configured)" value={formatBps(r.commissionBps)} />
              <Fig label="Maximum discount (configured)" value={formatBps(r.maxDiscountBps)} />
            </dl>
            <p className="text-muted">Commission and maximum discount are demo configuration values and must be confirmed in the approved agreement.</p>
          </Block>

          <Block id="commencement" title="Commencement status">
            <p className="flex items-center gap-2"><span className="font-semibold">Status:</span> <StatusBadge status={scheme.status} /></p>
            <p>{scheme.commencementNote}</p>
            {active ? (
              <p>This scheme is shown as active in the demo, so the onboarding walkthrough is available. Onboarding here is a demo and does not enrol you in anything.</p>
            ) : (
              <p className="rounded-md border border-line bg-ivory p-4">This scheme is <strong>{scheme.status}</strong>. Onboarding is not open: you can send an enquiry and we will respond once there is something to share. A scheme can only be joined after it is approved and has commenced.</p>
            )}
          </Block>

          <section id="terms" className="scroll-mt-28 border-t border-line py-8" aria-labelledby="terms-h">
            <h2 id="terms-h" className="text-2xl font-bold text-emerald">Scheme terms</h2>
            <p className="mt-3 text-sm text-muted">The sections below are placeholders. Every term must come from the approved scheme agreement and be reviewed legally before publication. Nothing here states a legal term.</p>
            <div className="mt-6 space-y-8">
              {termSections.map((t) => (
                <div key={t.id} id={t.id} className="scroll-mt-28">
                  <h3 className="text-lg font-bold text-emerald">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted">{t.note}</p>
                  <div className="mt-3">
                    <LegalPlaceholder>
                      {t.id === "auction-rules" ? scheme.auctionNote : undefined}
                    </LegalPlaceholder>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Block id="example" title="Prize amount calculation">
            <p>This worked example uses a sample {formatBps(ILLUSTRATIVE_DISCOUNT_BPS)} discount to show how the prize amount and instalments relate. The real calculation follows the approved agreement.</p>
            <BreakdownPanel rules={r} discountBps={ILLUSTRATIVE_DISCOUNT_BPS} title="Illustrative prize amount calculation" />
            <p className="text-muted">Future obligation example: a ticket winning in instalment 1 has {b.remainingAfterWin} instalments remaining; at {formatINR(b.payableWinner)} each that is {formatINR(b.futureObligationWinner)}.</p>
          </Block>

          <Block id="faqs" title="Frequently asked questions">
            <Accordion items={schemeFaqs.map((f) => ({ q: f.q, a: f.a }))} />
          </Block>

          <Block id="agreement" title="Scheme agreement">
            <p>The scheme agreement is not available yet. It will be provided here once it has been approved.</p>
            <Button disabled aria-disabled="true" variant="secondary"><Download className="h-4 w-4" />Download agreement (not yet available)</Button>
          </Block>
        </div>
      </Container>
      <SchemeStickyCta scheme={scheme} />
    </>
  );
}
