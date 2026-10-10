import type { ReactNode } from "react";
import { Container, DraftBanner, PageHero, Prose } from "./shared";

export function LegalPage({ title, intro, sections, children }: { title: string; intro: string; sections: { h: string; p: ReactNode }[]; children?: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={intro} />
      <Container className="py-12">
        <div className="max-w-3xl">
          <DraftBanner>DRAFT TEMPLATE — pending legal review. This text is a structural placeholder and is not a binding or approved legal document. It will be replaced with counsel-approved wording before launch.</DraftBanner>
          <Prose className="mt-8">
            {sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                <p>{s.p}</p>
              </section>
            ))}
            {children}
          </Prose>
        </div>
      </Container>
    </>
  );
}
