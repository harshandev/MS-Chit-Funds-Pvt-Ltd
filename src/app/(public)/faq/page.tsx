import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { generalFaqs } from "@/components/marketing/faqs";
import { Container, PageHero } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about chit funds, auctions, dividends, onboarding and how this demo site works.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions." intro="Honest answers to common questions. If yours is missing, send us a message." />
      <Container className="max-w-3xl py-12">
        <Accordion items={generalFaqs.map((f) => ({ q: f.q, a: f.a }))} />
        <p className="mt-8 text-sm text-muted">Still have a question? <Link href="/contact" className="font-semibold text-emerald underline">Contact us</Link>.</p>
      </Container>
    </>
  );
}
