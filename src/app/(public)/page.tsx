import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { FinalCta, PrinciplesTicker, SocialProofOrBenefits, TrustSection } from "@/components/marketing/HomeSections";
import { Playground } from "@/components/marketing/home/Playground";
import { Bento } from "@/components/marketing/home/Bento";
import { StickySteps } from "@/components/marketing/home/StickySteps";
import { PlansCarousel } from "@/components/marketing/home/PlansCarousel";
import { Receipt } from "@/components/marketing/home/Receipt";
import { EducationStack } from "@/components/marketing/home/EducationStack";

export const metadata: Metadata = {
  title: { absolute: "MS Chit Funds Pvt. Ltd. — Financial journeys, built on trust" },
  description: "Clear scheme information, transparent chit calculations and accessible digital records from a Tamil Nadu chit fund company. Demo build: all schemes are illustrative.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Playground />
      <PrinciplesTicker />
      <Bento />
      <StickySteps />
      <PlansCarousel />
      <Receipt />
      <EducationStack />
      <TrustSection />
      <SocialProofOrBenefits />
      <FinalCta />
    </>
  );
}
