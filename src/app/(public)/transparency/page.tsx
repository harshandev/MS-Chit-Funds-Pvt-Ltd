import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { company } from "@/config/company";
import { BreakdownPanel } from "@/components/marketing/BreakdownPanel";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "@/components/marketing/constants";
import { PageHero, Prose, Section } from "@/components/marketing/shared";
import { TransparencyFlow } from "@/components/marketing/pages/TransparencyFlow";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Transparency",
  description: "How chit figures are calculated, what 'illustrative' means, and the verified company details we publish once confirmed.",
};

export default function TransparencyPage() {
  const facts = company.verifiedFacts.filter((f) => f.value !== null && f.label !== "Grievance officer name & contact");
  const grievance = company.verifiedFacts.find((f) => f.label === "Grievance officer name & contact")?.value ?? null;
  return (
    <>
      <PageHero eyebrow="Transparency" title="Know where every" accent="number comes from." intro={`${company.displayName} is a ${company.state} chit fund company. This page explains how figures are calculated and publishes company details only once they have been verified.`} />

      <Section tone="white" aria-labelledby="flow-h">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">Follow the money</p>
          <h2 id="flow-h" className="mt-2 max-w-2xl text-3xl font-extrabold text-emerald sm:text-4xl">One month of a chit, <span className="font-serif font-normal italic text-gold-antique">traced end to end.</span></h2>
          <p className="mt-3 max-w-2xl text-muted">From the pot to the payout: see how the discount splits into commission and dividend, and how each number is worked out.</p>
        </Reveal>
        <Reveal className="mt-8" delay={0.1}><TransparencyFlow /></Reveal>
      </Section>

      <Section aria-labelledby="facts-h">
        <Reveal>
          <h2 id="facts-h" className="text-2xl font-extrabold text-emerald sm:text-3xl">Verified company <span className="font-serif font-normal italic text-gold-antique">details</span></h2>
        </Reveal>
        {facts.length > 0 ? (
          <Reveal delay={0.1} className="mt-6 overflow-x-auto rounded-2xl border border-line/80 bg-white shadow-[var(--shadow-2)]">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <caption className="sr-only">Verified company details</caption>
              <tbody className="divide-y divide-line">
                {facts.map((f) => (
                  <tr key={f.label} className="transition-colors hover:bg-gold/10"><th scope="row" className="w-1/2 px-5 py-4 font-semibold text-ink">{f.label}</th><td className="px-5 py-4 text-muted">{f.value}</td></tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        ) : (
          <Reveal delay={0.1} className="mt-6 flex max-w-3xl items-start gap-4 rounded-2xl border border-dashed border-gold-antique/50 bg-white p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15"><ShieldCheck className="h-6 w-6 text-gold-antique" aria-hidden /></span>
            <p className="text-sm leading-relaxed text-muted"><span className="font-semibold text-ink">Verified company details will be published here.</span> Registration and sanction details for operating in {company.state} will be shown once they have been verified against official documents. Until then, nothing on this site should be read as confirming registration, approval or compliance.</p>
          </Reveal>
        )}
      </Section>

      <Section tone="white" aria-labelledby="calc-h">
        <div className="grid gap-10 lg:grid-cols-5 [&>*]:min-w-0">
          <Reveal className="lg:col-span-2">
            <h2 id="calc-h" className="text-2xl font-extrabold text-emerald sm:text-3xl">How numbers are <span className="font-serif font-normal italic text-gold-antique">calculated</span></h2>
            <Prose className="mt-4 text-sm">
              <p>Every chit figure follows from a few inputs: the gross chit, the number of tickets, the instalment, the auction discount and the foreman commission.</p>
              <ul>
                <li>Net chit = gross chit minus discount.</li>
                <li>Dividend pool = discount minus commission.</li>
                <li>Dividend per ticket = pool shared across the tickets set by the agreement.</li>
                <li>Contribution = instalment minus dividend.</li>
              </ul>
              <h3>What &ldquo;illustrative&rdquo; means</h3>
              <p>Anything labelled illustrative uses sample inputs to show how the arithmetic works. It is not a real scheme, a quote, an auction result, or a promise of any outcome. Real calculations will follow the approved scheme agreement.</p>
              <p><Link href="/calculator">Try the calculator</Link> to test your own inputs.</p>
            </Prose>
          </Reveal>
          <Reveal className="lg:col-span-3" delay={0.1}><BreakdownPanel rules={showcaseScheme.rules} discountBps={ILLUSTRATIVE_DISCOUNT_BPS} /></Reveal>
        </div>
      </Section>

      <Section id="grievance" aria-labelledby="grievance-h">
        <Stagger className="max-w-3xl">
          <StaggerItem><h2 id="grievance-h" className="text-2xl font-extrabold text-emerald sm:text-3xl">Grievance <span className="font-serif font-normal italic text-gold-antique">information</span></h2></StaggerItem>
          <StaggerItem>
            {grievance ? (
              <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-ink shadow-[var(--shadow-1)]">{grievance}</p>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-gold-antique/50 bg-white p-5 text-sm leading-relaxed text-muted">Grievance contact details will be published here once they have been verified. In the meantime you can send a message through the contact page.</p>
            )}
          </StaggerItem>
          <StaggerItem><div className="mt-5"><Link href="/contact" className={buttonClass("secondary", "lg")}>Contact us</Link></div></StaggerItem>
        </Stagger>
      </Section>
    </>
  );
}
