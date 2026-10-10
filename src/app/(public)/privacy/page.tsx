import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy (Draft)",
  description: "Draft privacy policy template for MS Chit Funds Pvt. Ltd., pending legal review.",
};

const pending = "To be completed and approved by legal counsel.";
const sections = [
  { h: "1. Who we are", p: `Identification of the company as the data controller and its registered details. ${pending}` },
  { h: "2. Information we collect", p: `Categories of information collected, for example profile, contact, verification and payment-related information. ${pending}` },
  { h: "3. Demo mode", p: "In this demo build, forms are validated in your browser and are not sent to or stored by any server. No real personal data should be entered." },
  { h: "4. How we use information", p: `Purposes and lawful bases for processing. ${pending}` },
  { h: "5. Sharing of information", p: `Recipients such as verification, payment and regulatory parties. ${pending}` },
  { h: "6. Retention", p: `How long information is kept. ${pending}` },
  { h: "7. Security", p: `Safeguards applied to personal information. ${pending}` },
  { h: "8. Your choices and rights", p: `Access, correction and other rights, and how to exercise them. ${pending}` },
  { h: "9. Grievances and contact", p: "Grievance contact details will be published on the Transparency page once verified." },
  { h: "10. Changes to this policy", p: `How updates are communicated. ${pending}` },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" intro="How personal information will be handled. This page is a draft template." sections={sections} />;
}
