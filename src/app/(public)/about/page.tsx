import type { Metadata } from "next";
import Link from "next/link";
import { Eye, HandHeart, Scale, Smartphone } from "lucide-react";
import { company } from "@/config/company";
import { Container, PageHero, Prose } from "@/components/marketing/shared";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Our approach to chit funds: clarity, plain language, and technology that keeps records easy to follow.",
};

const values = [
  { icon: Eye, title: "Clarity", text: "Show the working behind every figure, so nobody has to take a number on faith." },
  { icon: Scale, title: "Fairness in explanation", text: "State terms and responsibilities plainly, including the ones that ask something of the member." },
  { icon: HandHeart, title: "Respect for the tradition", text: "Chit funds are a long-standing community practice. We are modernising the experience, not replacing the idea." },
  { icon: Smartphone, title: "Convenience", text: "A digital experience for instalments, statements and documents that works well on a phone." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={`${company.displayName}`} intro={`${company.description} ${company.tagline}`} />
      <Container className="grid gap-12 py-12 lg:grid-cols-2">
        <div>
        <Prose>
          <h2>Our approach</h2>
          <p>We believe a chit should be easy to understand before it is easy to join. That means plain-language explanations, worked examples with the arithmetic shown, and scheme terms presented in clear sections.</p>
          <p>This website is a demo build. Schemes, figures and processes shown here are illustrative. Company registration, sanction and contact details will be published on the <Link href="/transparency">Transparency page</Link> once they are verified.</p>
        </Prose>
        <div className="mt-6"><Link href="/how-it-works" className={buttonClass("primary")}>How chit funds work</Link></div>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2" aria-label="Our values">
          {values.map((v) => (
            <li key={v.title} className="rounded-lg border border-line bg-white p-6">
              <v.icon className="h-6 w-6 text-gold-antique" aria-hidden />
              <h3 className="mt-3 font-bold text-emerald">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
