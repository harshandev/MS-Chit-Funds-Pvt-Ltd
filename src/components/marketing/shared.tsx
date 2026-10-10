import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Card";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({ id, tone = "ivory", className, children, "aria-labelledby": labelledBy }: {
  id?: string; tone?: "ivory" | "white" | "emerald"; className?: string; children: ReactNode; "aria-labelledby"?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-24 py-16 sm:py-20", tone === "white" && "bg-white", tone === "emerald" && "bg-emerald text-ivory", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/** Top-of-page heading block for inner pages. Renders the page's single h1. */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-12 sm:py-16">
        <div className="rise max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold text-emerald sm:text-5xl">{title}</h1>
          {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </Container>
    </div>
  );
}

/** Clearly marked placeholder for content that needs legal approval. */
export function LegalPlaceholder({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-gold-antique/60 bg-gold/10 px-4 py-3 text-sm text-ink">
      <p className="font-semibold">Pending legal approval — to be supplied</p>
      <p className="mt-1 text-muted">{children ?? "This section will be completed from the approved scheme agreement. No terms are stated here."}</p>
    </div>
  );
}

export function DraftBanner({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-ink">{children}</div>
  );
}

/** Prose wrapper with consistent spacing for long-form text. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("max-w-3xl space-y-4 text-base leading-relaxed text-ink/90 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-emerald [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-emerald [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_a]:font-semibold [&_a]:text-emerald [&_a]:underline", className)}>{children}</div>;
}
