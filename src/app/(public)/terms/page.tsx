import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use (Draft)",
  description: "Draft website terms of use template for MS Chit Funds Pvt. Ltd., pending legal review.",
};

const pending = "To be completed and approved by legal counsel.";
const sections = [
  { h: "1. About this website", p: "This website provides information about chit funds and a demonstration of a digital experience. It is a demo build." },
  { h: "2. Illustrative content", p: "Schemes, figures, calculators, statuses and auction results shown are illustrative. They are not offers, quotes, guarantees or advice." },
  { h: "3. Schemes are governed by their own terms", p: `Participation in any chit scheme is governed solely by the approved scheme agreement and applicable law. ${pending}` },
  { h: "4. Acceptable use", p: `Rules for using the website. ${pending}` },
  { h: "5. Accounts and sign-in", p: "Sign-in in this demo is simulated and provides no real access. Do not share real credentials or identity numbers." },
  { h: "6. Intellectual property", p: `Ownership of site content. ${pending}` },
  { h: "7. Limitation of liability", p: `To be drafted by legal counsel. ${pending}` },
  { h: "8. Governing law and disputes", p: `Applicable law and forum. ${pending}` },
  { h: "9. Changes to these terms", p: `${pending}` },
];

export default function TermsPage() {
  return <LegalPage title="Terms of Use" intro="Terms for using this website. This page is a draft template." sections={sections} />;
}
