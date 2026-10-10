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
import { T } from "@/i18n/T";
import { RichT } from "@/components/marketing/pages/RichT";

export const metadata: Metadata = {
  title: "Transparency",
  description: "How chit figures are calculated, what 'illustrative' means, and the verified company details we publish once confirmed.",
};

export default function TransparencyPage() {
  const facts = company.verifiedFacts.filter((f) => f.value !== null && f.label !== "Grievance officer name & contact");
  const grievance = company.verifiedFacts.find((f) => f.label === "Grievance officer name & contact")?.value ?? null;
  return (
    <>
      <PageHero eyebrow="Transparency" title="Know where every" accent="number comes from." intro="{name} is a {state} chit fund company. This page explains how figures are calculated and publishes company details only once they have been verified." introVars={{ name: company.displayName, state: company.state }} />

      <Section tone="white" aria-labelledby="flow-h">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique"><T>Follow the money</T></p>
          <h2 id="flow-h" className="mt-2 max-w-2xl text-3xl font-extrabold text-emerald sm:text-4xl"><RichT text="One month of a chit, <i>traced end to end.</i>" /></h2>
          <p className="mt-3 max-w-2xl text-muted"><T>From the pot to the payout: see how the discount splits into commission and dividend, and how each number is worked out.</T></p>
        </Reveal>
        <Reveal className="mt-8" delay={0.1}><TransparencyFlow /></Reveal>
      </Section>

      <Section aria-labelledby="facts-h">
        <Reveal>
          <h2 id="facts-h" className="text-2xl font-extrabold text-emerald sm:text-3xl"><RichT text="Verified company <i>details</i>" /></h2>
        </Reveal>
        {facts.length > 0 ? (
          <Reveal delay={0.1} className="mt-6 overflow-x-auto rounded-2xl border border-line/80 bg-white shadow-[var(--shadow-2)]">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <caption className="sr-only"><T>Verified company details</T></caption>
              <tbody className="divide-y divide-line">
                {facts.map((f) => (
                  <tr key={f.label} className="transition-colors hover:bg-gold/10"><th scope="row" className="w-1/2 px-5 py-4 font-semibold text-ink"><T>{f.label}</T></th><td className="px-5 py-4 text-muted">{f.value}</td></tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        ) : (
          <Reveal delay={0.1} className="mt-6 flex max-w-3xl items-start gap-4 rounded-2xl border border-dashed border-gold-antique/50 bg-white p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15"><ShieldCheck className="h-6 w-6 text-gold-antique" aria-hidden /></span>
            <p className="text-sm leading-relaxed text-muted"><RichT text="<b>Verified company details will be published here.</b> Registration and sanction details for operating in {state} will be shown once they have been verified against official documents. Until then, nothing on this site should be read as confirming registration, approval or compliance." vars={{ state: company.state }} bold="font-semibold text-ink" /></p>
          </Reveal>
        )}
      </Section>

      <Section tone="white" aria-labelledby="calc-h">
        <div className="grid gap-10 lg:grid-cols-5 [&>*]:min-w-0">
          <Reveal className="lg:col-span-2">
            <h2 id="calc-h" className="text-2xl font-extrabold text-emerald sm:text-3xl"><RichT text="How numbers are <i>calculated</i>" /></h2>
            <Prose className="mt-4 text-sm">
              <p><T>Every chit figure follows from a few inputs: the gross chit, the number of tickets, the instalment, the auction discount and the foreman commission.</T></p>
              <ul>
                <li><T>Net chit = gross chit minus discount.</T></li>
                <li><T>Dividend pool = discount minus commission.</T></li>
                <li><T>Dividend per ticket = pool shared across the tickets set by the agreement.</T></li>
                <li><T>Contribution = instalment minus dividend.</T></li>
              </ul>
              <h3><T>What “illustrative” means</T></h3>
              <p><T>Anything labelled illustrative uses sample inputs to show how the arithmetic works. It is not a real scheme, a quote, an auction result, or a promise of any outcome. Real calculations will follow the approved scheme agreement.</T></p>
              <p><RichT text="{link} to test your own inputs." parts={{ link: <Link href="/calculator"><T>Try the calculator</T></Link> }} /></p>
            </Prose>
          </Reveal>
          <Reveal className="lg:col-span-3" delay={0.1}><BreakdownPanel rules={showcaseScheme.rules} discountBps={ILLUSTRATIVE_DISCOUNT_BPS} /></Reveal>
        </div>
      </Section>

      <Section id="grievance" aria-labelledby="grievance-h">
        <Stagger className="max-w-3xl">
          <StaggerItem><h2 id="grievance-h" className="text-2xl font-extrabold text-emerald sm:text-3xl"><RichT text="Grievance <i>information</i>" /></h2></StaggerItem>
          <StaggerItem>
            {grievance ? (
              <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-ink shadow-[var(--shadow-1)]">{grievance}</p>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-gold-antique/50 bg-white p-5 text-sm leading-relaxed text-muted"><T>Grievance contact details will be published here once they have been verified. In the meantime you can send a message through the contact page.</T></p>
            )}
          </StaggerItem>
          <StaggerItem><div className="mt-5"><Link href="/contact" className={buttonClass("secondary", "lg")}><T>Contact us</T></Link></div></StaggerItem>
        </Stagger>
      </Section>
    </>
  );
}
