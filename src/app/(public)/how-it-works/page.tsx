import type { Metadata } from "next";
import { HowItWorksClient } from "@/components/marketing/pages/HowItWorksClient";
import { PageHero } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: "How Chit Funds Work",
  description: "Plain-language guides to chit funds: monthly instalments, auction discounts, what happens after winning, future instalments and reading a chit agreement.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title="Chit funds, explained" accent="step by step." intro="A chit is a group arrangement where members contribute every month and, each month, one member receives the pooled amount. These guides explain the ideas in plain language. Specific rules always come from the approved scheme agreement." />
      <HowItWorksClient />
    </>
  );
}
