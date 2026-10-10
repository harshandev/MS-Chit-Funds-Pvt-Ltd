import type { Metadata } from "next";
import { CalculatorClient } from "@/components/marketing/CalculatorClient";
import { Container, PageHero } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: "Chit Calculator",
  description: "An illustrative chit calculator: see how discount, commission and dividend change the net chit amount and instalments. Not a quote or investment return.",
};

export default function CalculatorPage() {
  return (
    <>
      <PageHero eyebrow="Calculator" title="Chit calculator." intro="Change the inputs and see the arithmetic update live.">
        <p role="note" className="inline-block rounded-md border border-gold/50 bg-gold/15 px-4 py-2.5 text-sm font-bold text-ink">Illustrative estimate — not investment returns or a scheme quote.</p>
      </PageHero>
      <Container className="py-10"><CalculatorClient /></Container>
    </>
  );
}
