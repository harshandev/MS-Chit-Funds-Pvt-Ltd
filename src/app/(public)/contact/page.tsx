import type { Metadata } from "next";
import { company } from "@/config/company";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Container, PageHero } from "@/components/marketing/shared";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MS Chit Funds Pvt. Ltd. with a question about schemes, onboarding or feedback.",
};

export default function ContactPage() {
  const c = company.contact;
  const details = [
    ["Phone", c.phone], ["Email", c.email], ["WhatsApp", c.whatsapp], ["Registered office", c.registeredOffice], ["Hours", c.hours],
  ].filter((d): d is [string, string] => d[1] !== null);
  return (
    <>
      <PageHero eyebrow="Contact" title="We are happy to answer questions." intro="Send a message about a scheme, onboarding or feedback." />
      <Container className="grid gap-10 py-12 lg:grid-cols-5">
        <div className="lg:col-span-3"><ContactForm /></div>
        <aside className="lg:col-span-2" aria-labelledby="details-h">
          <h2 id="details-h" className="text-lg font-bold text-emerald">Contact details</h2>
          {details.length > 0 ? (
            <dl className="mt-4 space-y-3 text-sm">
              {details.map(([k, v]) => <div key={k}><dt className="text-xs uppercase tracking-wider text-muted">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>)}
            </dl>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-line bg-white p-5 text-sm leading-relaxed text-muted">Official contact details will be published here once they are verified. Until then, please use the form.</p>
          )}
        </aside>
      </Container>
    </>
  );
}
