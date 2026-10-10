import Link from "next/link";
import { ArrowRight, Calculator, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { company } from "@/config/company";
import { testimonials } from "@/config/testimonials";
import { Eyebrow } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { Marquee } from "@/components/motion/Marquee";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";

export { learnTopics } from "./home/topics";

const principles = ["Clear scheme information", "Transparent calculations", "Accessible digital records", "Illustrative figures are always labelled", "Plain-language terms", "Questions welcome"];

export function PrinciplesTicker() {
  return (
    <section aria-label="Product principles" className="border-y border-gold/20 bg-navy py-5 text-ivory">
      <Marquee speed={45}>
        {principles.map((p) => (
          <span key={p} className="flex items-center gap-10 whitespace-nowrap font-serif text-xl sm:text-2xl">
            {p}<span aria-hidden className="text-gold">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}

export function TrustSection() {
  const facts = company.verifiedFacts.filter((f) => f.value !== null);
  return (
    <section aria-labelledby="trust-title" className="relative overflow-x-clip bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <Eyebrow>Trust &amp; compliance</Eyebrow>
          <h2 id="trust-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">Verified details, <em className="text-gold-antique">published when confirmed.</em></h2>
        </Reveal>
        {facts.length > 0 ? (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <StaggerItem key={f.label}>
                <Spotlight className="h-full rounded-2xl border border-line bg-white p-5">
                  <p className="text-xs uppercase tracking-wider text-muted">{f.label}</p>
                  <p className="mt-1 font-semibold text-ink">{f.value}</p>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Reveal delay={0.1} className="mt-10 flex max-w-3xl items-start gap-5 rounded-3xl border border-dashed border-gold-antique/50 bg-white p-6 sm:p-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-gold-antique"><ShieldCheck className="h-6 w-6" aria-hidden /></span>
            <p className="text-sm leading-relaxed text-muted"><span className="block text-base font-semibold text-ink">Verified company details will be published here.</span>We only show registration, sanction and grievance details once they have been checked against official documents.</p>
          </Reveal>
        )}
        <div className="mt-8"><Link href="/transparency" className={buttonClass("secondary")}>Transparency &amp; disclosures</Link></div>
      </div>
    </section>
  );
}

export function SocialProofOrBenefits() {
  if (testimonials.length > 0) {
    return (
      <section aria-labelledby="voices-title" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal><Eyebrow>In their words</Eyebrow><h2 id="voices-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">Verified customer feedback.</h2></Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <li key={t.name}><figure className="h-full rounded-3xl border border-line bg-ivory p-7">
                <blockquote className="font-serif text-xl leading-snug text-emerald">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm text-muted"><span className="font-semibold text-ink">{t.name}</span>{t.descriptor ? `, ${t.descriptor}` : ""}</figcaption>
              </figure></li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
  const items = [
    { icon: Calculator, title: "Numbers you can check", text: "A calculator and worked examples so you can test any assumption yourself." },
    { icon: Smartphone, title: "Built for your phone", text: "Instalments, statements and documents in a layout that works on any screen." },
    { icon: CheckCircle2, title: "Plain-language terms", text: "Scheme terms presented in sections, with placeholders clearly marked until approved." },
  ];
  return (
    <section aria-labelledby="benefits-title" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal><Eyebrow>Why this experience</Eyebrow><h2 id="benefits-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">Designed to reduce <em className="text-gold-antique">guesswork.</em></h2></Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <StaggerItem key={it.title}>
              <Spotlight className="group h-full rounded-3xl border border-line bg-ivory p-7 transition-transform duration-300 hover:-translate-y-1">
                <it.icon className="h-7 w-7 text-gold-antique transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" aria-hidden />
                <h3 className="mt-4 text-lg font-bold text-emerald">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{it.text}</p>
              </Spotlight>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="grain relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald py-24 text-ivory sm:py-32">
      <div aria-hidden className="aurora pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/25 blur-[110px]" />
      <div aria-hidden className="aurora pointer-events-none absolute -bottom-32 left-10 h-96 w-96 rounded-full bg-emerald-700/50 blur-[110px] [animation-delay:-8s]" />
      <Reveal className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 id="cta-title" className="font-serif text-5xl leading-tight sm:text-6xl">Take your time. <em className="text-shimmer pr-[0.14em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">Ask questions.</em></h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ivory/75">Explore schemes, test the numbers, and reach out whenever something is unclear.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Magnetic><Link href="/chit-plans" className={buttonClass("gold", "lg", "shadow-[0_10px_40px_-8px_rgb(212_175_55/0.55)]")}>Explore Chit Plans <ArrowRight className="h-4 w-4" aria-hidden /></Link></Magnetic>
          <Magnetic><Link href="/contact" className={buttonClass("glass", "lg")}>Contact us</Link></Magnetic>
        </div>
      </Reveal>
    </section>
  );
}
