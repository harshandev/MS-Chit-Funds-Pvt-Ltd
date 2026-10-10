import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { company } from "@/config/company";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Container, PageHero } from "@/components/marketing/shared";
import { Reveal } from "@/components/motion/Reveal";
import { T } from "@/i18n/T";
import { RichT } from "@/components/marketing/pages/RichT";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MS Chit Funds Pvt. Ltd. with a question about schemes, onboarding or feedback.",
};

const icons: Record<string, typeof Phone> = { Phone, Email: Mail, WhatsApp: MessageCircle, "Registered office": MapPin, Hours: Clock };

export default function ContactPage() {
  const c = company.contact;
  const details = [
    ["Phone", c.phone], ["Email", c.email], ["WhatsApp", c.whatsapp], ["Registered office", c.registeredOffice], ["Hours", c.hours],
  ].filter((d): d is [string, string] => d[1] !== null);
  return (
    <>
      <PageHero eyebrow="Contact" title="We are happy to" accent="answer questions." intro="Send a message about a scheme, onboarding or feedback." />
      <div className="bg-gradient-to-b from-ivory to-white">
        <Container className="grid gap-10 py-12 lg:grid-cols-5 [&>*]:min-w-0">
          <Reveal className="lg:col-span-3"><ContactForm /></Reveal>
          <Reveal className="lg:col-span-2" delay={0.12}>
            <aside aria-labelledby="details-h" className="space-y-5">
              <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-[var(--shadow-1)]">
                <h2 id="details-h" className="text-lg font-extrabold text-emerald"><RichT text="Contact <i>details</i>" /></h2>
                {details.length > 0 ? (
                  <dl className="mt-4 space-y-4 text-sm">
                    {details.map(([k, v]) => { const I = icons[k] ?? Phone; return <div key={k} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald"><I className="h-4 w-4" aria-hidden /></span><div><dt className="text-xs uppercase tracking-wider text-muted"><T>{k}</T></dt><dd className="font-semibold text-ink">{v}</dd></div></div>; })}
                  </dl>
                ) : (
                  <p className="mt-4 rounded-2xl border border-dashed border-gold-antique/50 bg-ivory p-5 text-sm leading-relaxed text-muted"><T>Official contact details will be published here once they are verified. Until then, please use the form.</T></p>
                )}
              </div>
              <div className="flex gap-4 rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-900 p-6 text-ivory">
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden />
                <div className="text-sm leading-relaxed">
                  <p className="font-bold text-gold-soft"><T>Raising a complaint?</T></p>
                  <p className="mt-1 text-ivory/75"><RichT text="Choose “Complaint or grievance” as the topic. Grievance contact details will appear on the {link} once verified." parts={{ link: <Link href="/transparency#grievance" className="font-semibold text-gold underline"><T>Transparency page</T></Link> }} /></p>
                </div>
              </div>
            </aside>
          </Reveal>
        </Container>
      </div>
    </>
  );
}
