import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { company } from "@/config/company";
import { BreakdownPanel } from "@/components/marketing/BreakdownPanel";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "@/components/marketing/constants";
import { Container, PageHero, Prose } from "@/components/marketing/shared";
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
      <PageHero eyebrow="Transparency" title="Know where every number comes from." intro={`${company.displayName} is a ${company.state} chit fund company. This page explains how figures are calculated and publishes company details only once they have been verified.`} />
      <Container className="space-y-16 py-12">
        <section aria-labelledby="facts-h">
          <h2 id="facts-h" className="text-2xl font-bold text-emerald">Verified company details</h2>
          {facts.length > 0 ? (
            <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">Verified company details</caption>
                <tbody className="divide-y divide-line">
                  {facts.map((f) => (
                    <tr key={f.label}><th scope="row" className="w-1/2 px-4 py-3 font-semibold text-ink">{f.label}</th><td className="px-4 py-3 text-muted">{f.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 flex max-w-3xl items-start gap-4 rounded-lg border border-dashed border-line bg-white p-6">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold-antique" aria-hidden />
              <p className="text-sm leading-relaxed text-muted"><span className="font-semibold text-ink">Verified company details will be published here.</span> Registration and sanction details for operating in {company.state} will be shown once they have been verified against official documents. Until then, nothing on this site should be read as confirming registration, approval or compliance.</p>
            </div>
          )}
        </section>

        <section aria-labelledby="calc-h" className="grid gap-8 lg:grid-cols-5 [&>*]:min-w-0">
          <div className="lg:col-span-2">
            <h2 id="calc-h" className="text-2xl font-bold text-emerald">How numbers are calculated</h2>
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
          </div>
          <div className="lg:col-span-3"><BreakdownPanel rules={showcaseScheme.rules} discountBps={ILLUSTRATIVE_DISCOUNT_BPS} /></div>
        </section>

        <section id="grievance" aria-labelledby="grievance-h" className="scroll-mt-24">
          <h2 id="grievance-h" className="text-2xl font-bold text-emerald">Grievance information</h2>
          {grievance ? (
            <p className="mt-4 max-w-3xl rounded-lg border border-line bg-white p-5 text-sm text-ink">{grievance}</p>
          ) : (
            <p className="mt-4 max-w-3xl rounded-lg border border-dashed border-line bg-white p-5 text-sm leading-relaxed text-muted">Grievance contact details will be published here once they have been verified. In the meantime you can send a message through the contact page.</p>
          )}
          <div className="mt-5"><Link href="/contact" className={buttonClass("secondary")}>Contact us</Link></div>
        </section>
      </Container>
    </>
  );
}
