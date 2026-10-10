import type { Metadata } from "next";
import { PlansExplorer } from "@/components/marketing/PlansExplorer";
import { Container, PageHero } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: "Explore Chit Plans",
  description: "Browse illustrative chit schemes by value, instalment, duration and status. Only schemes that are active can proceed to onboarding.",
};

export default function ChitPlansPage() {
  return (
    <>
      <PageHero eyebrow="Chit plans" title="Explore chit plans." intro="Compare illustrative schemes by value, instalment and duration. Each scheme page lists its terms headings and status." />
      <Container className="py-10 sm:py-12"><PlansExplorer /></Container>
    </>
  );
}
