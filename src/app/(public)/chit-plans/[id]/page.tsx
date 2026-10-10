import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScheme, schemes } from "@/data/demo";
import { StatusChip } from "@/components/marketing/pages/StatusChip";
import { T } from "@/i18n/T";
import { SchemeStickyCta } from "@/components/marketing/EnquiryDialog";
import { PageHero } from "@/components/marketing/shared";
import { SchemeDetailClient } from "@/components/marketing/pages/SchemeDetailClient";

export function generateStaticParams() {
  return schemes.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/chit-plans/[id]">): Promise<Metadata> {
  const { id } = await params;
  const s = getScheme(id);
  if (!s) return { title: "Scheme not found" };
  return { title: s.name, description: `${s.summary} Illustrative demo scheme: key figures, status and terms headings.` };
}

export default async function SchemePage({ params }: PageProps<"/chit-plans/[id]">) {
  const { id } = await params;
  const scheme = getScheme(id);
  if (!scheme) notFound();
  return (
    <>
      <PageHero
        eyebrow="Scheme"
        crumbs={[{ label: "Home", href: "/" }, { label: "Chit plans", href: "/chit-plans" }, { label: scheme.name }]}
        title={scheme.name}
        intro={scheme.summary}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ivory"><StatusChip status={scheme.status} /></span>
          <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold-soft"><T>Illustrative demo scheme</T></span>
        </div>
      </PageHero>
      <SchemeDetailClient scheme={scheme} />
      <SchemeStickyCta scheme={scheme} />
    </>
  );
}
