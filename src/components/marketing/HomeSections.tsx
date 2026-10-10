import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, FileSearch, FolderLock, Gavel, Layers, Scale, ShieldCheck, Smartphone } from "lucide-react";
import { schemes } from "@/data/demo";
import { company } from "@/config/company";
import { testimonials } from "@/config/testimonials";
import { SectionHeading, Card, CardBody } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { BreakdownPanel } from "./BreakdownPanel";
import { SchemeCard } from "./SchemeCard";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "./constants";
import { Section } from "./shared";

export function Pillars() {
  const items = [
    { icon: FileSearch, title: "Clear scheme information", text: "Every scheme lays out its value, instalment, duration and status in plain language, with terms one click away." },
    { icon: Calculator, title: "Transparent financial calculations", text: "See how a chit amount, discount, commission and dividend relate to each other, with the arithmetic shown." },
    { icon: FolderLock, title: "Accessible digital records", text: "Statements, receipts and scheme documents are designed to be organised in one place you can return to." },
  ];
  return (
    <Section tone="white" aria-labelledby="pillars-title">
      <div id="pillars-title"><SectionHeading eyebrow="Our approach" title="Confidence starts with clarity." intro="Chit funds work best when everyone understands them. We design around three simple ideas." /></div>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <li key={it.title}>
            <Card className="h-full"><CardBody>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald"><it.icon className="h-5 w-5" aria-hidden /></span>
              <h3 className="mt-4 text-lg font-bold text-emerald">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{it.text}</p>
            </CardBody></Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function HowSteps() {
  const steps = [
    { n: "01", title: "Explore a scheme", text: "Browse available chit schemes and their key figures." },
    { n: "02", title: "Understand the terms", text: "Read the scheme terms and try the calculator before you decide." },
    { n: "03", title: "Complete the required onboarding", text: "Profile, KYC and bank verification, as required for the scheme." },
    { n: "04", title: "Manage your participation digitally", text: "Track instalments, auctions and documents from your dashboard." },
  ];
  return (
    <Section aria-labelledby="steps-title">
      <div id="steps-title"><SectionHeading eyebrow="How it works" title="Four steps, explained simply." /></div>
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="relative rounded-lg border border-line bg-white p-6">
            <span className="font-serif text-4xl text-gold-antique">{s.n}</span>
            <h3 className="mt-3 text-base font-bold text-emerald">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-3xl text-sm text-muted">Participation, eligibility and commencement depend on each scheme&apos;s terms and on regulatory requirements. Nothing on this site is an offer to enrol.</p>
      <div className="mt-6"><Link href="/how-it-works" className={buttonClass("secondary")}>Read the full guide <ArrowRight className="h-4 w-4" /></Link></div>
    </Section>
  );
}

export function FeaturedPlans() {
  const featured = schemes.slice(0, 3);
  return (
    <Section tone="white" aria-labelledby="featured-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div id="featured-title"><SectionHeading eyebrow="Chit plans" title="Illustrative schemes to explore." intro="These demo schemes show how scheme information will be presented. They are not available offers." /></div>
        <Link href="/chit-plans" className={buttonClass("secondary")}>View all plans</Link>
      </div>
      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((s) => <li key={s.id} className="flex"><div className="flex w-full"><SchemeCard scheme={s} /></div></li>)}
      </ul>
    </Section>
  );
}

export function TransparencyFeature() {
  return (
    <Section aria-labelledby="transparency-title">
      <div className="grid gap-10 lg:grid-cols-5 lg:items-start [&>*]:min-w-0">
        <div className="lg:col-span-2">
          <div id="transparency-title"><SectionHeading eyebrow="Transparency" title="Know where every number comes from." intro="Every figure in a chit has a source: the gross chit, the discount from the auction, the foreman commission, and the dividend shared back. We show the working, not just the result." /></div>
          <div className="mt-6"><Link href="/transparency" className={buttonClass("primary")}>Explore Transparency <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
        <div className="lg:col-span-3">
          <BreakdownPanel rules={showcaseScheme.rules} discountBps={ILLUSTRATIVE_DISCOUNT_BPS} title="Illustrative breakdown: where a chit's money goes" />
        </div>
      </div>
    </Section>
  );
}

export const learnTopics = [
  { id: "how-chit-funds-work", icon: BookOpen, title: "How chit funds work", text: "A group contributes monthly; each month one member receives the chit amount." },
  { id: "auction-discounts", icon: Gavel, title: "Understanding auction discounts", text: "Why a winning bidder accepts less than the gross chit, and where the difference goes." },
  { id: "after-winning", icon: Scale, title: "What happens after winning", text: "What changes for a winning ticket and what stays the same." },
  { id: "future-instalments", icon: Layers, title: "Understanding future instalments", text: "Your continuing obligation after receiving the chit amount." },
  { id: "reading-agreement", icon: FileSearch, title: "Reading a chit agreement", text: "The clauses worth reading carefully before you sign anything." },
] as const;

export function LearnCards() {
  return (
    <Section tone="white" aria-labelledby="learn-title">
      <div id="learn-title"><SectionHeading eyebrow="Learn" title="Understand before you decide." intro="Short, plain-language guides to the ideas behind a chit." /></div>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {learnTopics.map((t) => (
          <li key={t.id}>
            <Link href={`/how-it-works#${t.id}`} className="group flex h-full flex-col rounded-lg border border-line bg-ivory p-6 transition-colors hover:border-gold-antique">
              <t.icon className="h-5 w-5 text-gold-antique" aria-hidden />
              <h3 className="mt-3 font-bold text-emerald">{t.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{t.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald">Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function TrustSection() {
  const facts = company.verifiedFacts.filter((f) => f.value !== null);
  return (
    <Section aria-labelledby="trust-title">
      <div id="trust-title"><SectionHeading eyebrow="Trust & compliance" title="Verified details, published when confirmed." /></div>
      {facts.length > 0 ? (
        <dl className="mt-8 grid max-w-3xl gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="bg-white p-5">
              <dt className="text-xs uppercase tracking-wider text-muted">{f.label}</dt>
              <dd className="mt-1 font-semibold text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-8 flex max-w-3xl items-start gap-4 rounded-lg border border-dashed border-line bg-white p-6">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold-antique" aria-hidden />
          <p className="text-sm leading-relaxed text-muted"><span className="font-semibold text-ink">Verified company details will be published here.</span> We only show registration, sanction and grievance details once they have been checked against official documents.</p>
        </div>
      )}
      <div className="mt-6"><Link href="/transparency" className={buttonClass("secondary")}>Transparency &amp; disclosures</Link></div>
    </Section>
  );
}

export function SocialProofOrBenefits() {
  if (testimonials.length > 0) {
    return (
      <Section tone="white" aria-labelledby="voices-title">
        <div id="voices-title"><SectionHeading eyebrow="In their words" title="Verified customer feedback." /></div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <li key={t.name}><figure className="h-full rounded-lg border border-line bg-ivory p-6">
              <blockquote className="font-serif text-xl leading-snug text-emerald">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm text-muted"><span className="font-semibold text-ink">{t.name}</span>{t.descriptor ? `, ${t.descriptor}` : ""}</figcaption>
            </figure></li>
          ))}
        </ul>
      </Section>
    );
  }
  const items = [
    { icon: Calculator, title: "Numbers you can check", text: "A calculator and worked examples so you can test any assumption yourself." },
    { icon: Smartphone, title: "Built for your phone", text: "Instalments, statements and documents in a layout that works on any screen." },
    { icon: ShieldCheck, title: "Plain-language terms", text: "Scheme terms presented in sections, with placeholders clearly marked until approved." },
  ];
  return (
    <Section tone="white" aria-labelledby="benefits-title">
      <div id="benefits-title"><SectionHeading eyebrow="Why this experience" title="Designed to reduce guesswork." /></div>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <li key={it.title} className="flex gap-4">
            <it.icon className="mt-1 h-6 w-6 shrink-0 text-gold-antique" aria-hidden />
            <div><h3 className="font-bold text-emerald">{it.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{it.text}</p></div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section tone="emerald" aria-labelledby="cta-title">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 id="cta-title" className="font-serif text-3xl text-ivory sm:text-4xl">Take your time. Ask questions.</h2>
          <p className="mt-2 max-w-xl text-ivory/80">Explore schemes, test the numbers, and reach out whenever something is unclear.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/chit-plans" className={buttonClass("gold", "lg")}>Explore Chit Plans</Link>
          <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-md border border-ivory/60 px-7 font-semibold text-ivory hover:bg-ivory/10">Contact us</Link>
        </div>
      </div>
    </Section>
  );
}
