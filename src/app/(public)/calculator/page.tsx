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
      <PageHero eyebrow="Calculator" title="The chit" accent="calculator." intro="Drag a slider or type a value and watch the arithmetic update live.">
        <p role="note" className="inline-block rounded-full border border-gold/60 bg-gold px-4 py-2 text-sm font-extrabold text-navy">Illustrative estimate — not investment returns or a scheme quote.</p>
      </PageHero>
      <div className="bg-gradient-to-b from-ivory to-white"><Container className="py-10"><CalculatorClient /></Container></div>
    </>
  );
}
