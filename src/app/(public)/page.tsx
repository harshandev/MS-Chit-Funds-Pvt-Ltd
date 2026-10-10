import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { FeaturedPlans, FinalCta, HowSteps, LearnCards, Pillars, SocialProofOrBenefits, TransparencyFeature, TrustSection } from "@/components/marketing/HomeSections";

export const metadata: Metadata = {
  title: { absolute: "MS Chit Funds Pvt. Ltd. — Financial journeys, built on trust" },
  description: "Clear scheme information, transparent chit calculations and accessible digital records from a Tamil Nadu chit fund company. Demo build: all schemes are illustrative.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pillars />
      <HowSteps />
      <FeaturedPlans />
      <TransparencyFeature />
      <LearnCards />
      <TrustSection />
      <SocialProofOrBenefits />
      <FinalCta />
    </>
  );
}
