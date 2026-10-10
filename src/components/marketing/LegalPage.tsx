import type { ReactNode } from "react";
import { Container, DraftBanner, PageHero } from "./shared";
import { LegalToc } from "./pages/LegalToc";
import { Reveal } from "@/components/motion/Reveal";

const slug = (h: string) => "s-" + h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function LegalPage({ title, intro, sections, children }: { title: string; intro: string; sections: { h: string; p: ReactNode }[]; children?: ReactNode }) {
  const toc = sections.map((s) => ({ id: slug(s.h), label: s.h.replace(/^\d+\.\s*/, ""), n: undefined }));
  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={intro} />
      <Container className="grid gap-10 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 [&>*]:min-w-0">
        <div className="sticky top-[4.25rem] z-20 -mx-4 bg-ivory/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <LegalToc items={toc} />
        </div>
        <div className="max-w-3xl">
          <DraftBanner>DRAFT TEMPLATE — pending legal review. This text is a structural placeholder and is not a binding or approved legal document. It will be replaced with counsel-approved wording before launch.</DraftBanner>
          <div className="mt-8 space-y-10">
            {sections.map((s) => (
              <Reveal key={s.h}>
                <section id={slug(s.h)} aria-labelledby={`${slug(s.h)}-h`} className="scroll-mt-28">
                  <h2 id={`${slug(s.h)}-h`} className="text-2xl font-extrabold text-emerald">{s.h}</h2>
                  <p className="mt-3 text-base leading-relaxed text-ink/90">{s.p}</p>
                </section>
              </Reveal>
            ))}
            {children}
          </div>
        </div>
      </Container>
    </>
  );
}
