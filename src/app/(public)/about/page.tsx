import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, HandHeart, Scale, Smartphone } from "lucide-react";
import { company } from "@/config/company";
import { Container, PageHero, Section } from "@/components/marketing/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";
import { Tilt } from "@/components/motion/Tilt";
import { buttonClass } from "@/components/ui/Button";
import { T } from "@/i18n/T";
import { RichT } from "@/components/marketing/pages/RichT";

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

const promises = [
  "We will never describe a chit as a deposit.",
  "We will never promise or imply guaranteed returns.",
  "Every sample figure is labelled illustrative.",
  "Company details are published only once verified.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={company.displayName} intro="{description} {tagline}" introVars={{ description: company.description, tagline: company.tagline }} />

      <Section aria-labelledby="approach-h">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center [&>*]:min-w-0">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique"><T>Our approach</T></p>
            <h2 id="approach-h" className="mt-2 text-3xl font-extrabold text-emerald sm:text-4xl"><RichT text="Easy to understand <i>before</i> it is easy to join." /></h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/90">
              <p><T>That means plain-language explanations, worked examples with the arithmetic shown, and scheme terms presented in clear sections.</T></p>
              <p><RichT text="This website is a demo build. Schemes, figures and processes shown here are illustrative. Company registration, sanction and contact details will be published on the {link} once they are verified." parts={{ link: <Link href="/transparency" className="font-semibold text-emerald underline"><T>Transparency page</T></Link> }} /></p>
            </div>
            <div className="mt-7"><Link href="/how-it-works" className={buttonClass("primary", "lg", "group")}><T>How chit funds work</T> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2" gap={0.09}>
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <Spotlight className="h-full rounded-2xl">
                  <Tilt max={5} className="relative h-full rounded-2xl">
                    <div className="h-full rounded-2xl border border-line/80 bg-white p-6 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald to-emerald-700 text-gold shadow-md"><v.icon className="h-5 w-5" aria-hidden /></span>
                      <h3 className="mt-4 font-bold text-emerald"><T>{v.title}</T></h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted"><T>{v.text}</T></p>
                    </div>
                  </Tilt>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <section aria-labelledby="promise-h" className="grain relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 py-16 text-ivory sm:py-20">
        <div aria-hidden className="aurora pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <Container className="relative">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold"><T>Our ground rules</T></p>
            <h2 id="promise-h" className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl"><RichT text="What this website will <i>always</i> do." accent="font-serif font-normal italic text-gold" /></h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2" gap={0.1}>
            {promises.map((p, i) => (
              <StaggerItem key={p}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-ivory/10 bg-white/5 p-5 backdrop-blur transition-colors hover:border-gold/40">
                  <span className="font-serif text-3xl italic leading-none text-gold">{i + 1}</span>
                  <p className="text-ivory/90"><T>{p}</T></p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <Section tone="white" aria-labelledby="cta-h">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 id="cta-h" className="text-3xl font-extrabold text-emerald sm:text-4xl"><RichT text="See the <i>arithmetic</i> for yourself." /></h2>
          <p className="mt-3 text-muted"><T>Explore the illustrative schemes or test your own numbers in the calculator.</T></p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/calculator" className={buttonClass("primary", "lg")}><T>Open the calculator</T></Link>
            <Link href="/chit-plans" className={buttonClass("secondary", "lg")}><T>Explore chit plans</T></Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
