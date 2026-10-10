import type { Metadata } from "next";
import { FaqExplorer } from "@/components/marketing/pages/FaqExplorer";
import { Container, PageHero } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about chit funds, auctions, dividends, onboarding and how this demo site works.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked" accent="questions." intro="Honest answers to common questions. Search, filter by topic — and if yours is missing, send us a message." />
      <div className="bg-gradient-to-b from-ivory to-white"><Container className="max-w-3xl py-12"><FaqExplorer /></Container></div>
    </>
  );
}
