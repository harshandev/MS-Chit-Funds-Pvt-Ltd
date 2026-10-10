"use client";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronRight } from "lucide-react";
import { SplitWords } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";

/** Dark emerald stage with drifting aurora, grain and a gold hairline. Renders the page's single h1. */
export function PageHero({ eyebrow, title, accent, intro, introVars, children, crumbs, className, tall }: {
  eyebrow: string; title: string; accent?: string; intro?: string; introVars?: Record<string, string>; children?: ReactNode;
  crumbs?: { label: string; href?: string }[]; className?: string; tall?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const tr = useTr();
  const trail = (crumbs ?? [{ label: "Home", href: "/" }, { label: eyebrow }]).map((c) => ({ ...c, label: tr(c.label) }));
  return (
    <header ref={ref} className={cn("grain relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-ivory", className)}>
      <motion.div aria-hidden style={{ y: y1 }} className="pointer-events-none absolute -left-24 -top-32 -z-10 h-96 w-96">
        <div className="aurora h-full w-full rounded-full bg-gold/25 blur-3xl" />
      </motion.div>
      <motion.div aria-hidden style={{ y: y2 }} className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-[28rem] w-[28rem]">
        <div className="aurora h-full w-full rounded-full bg-emerald-700/60 blur-3xl [animation-delay:-6s]" />
      </motion.div>
      <svg aria-hidden className="pointer-events-none absolute right-[-6rem] top-1/2 -z-10 hidden h-[30rem] w-[30rem] -translate-y-1/2 text-gold/20 md:block" viewBox="0 0 200 200" fill="none">
        <g className="spin-slow origin-center [transform-box:fill-box]">
          <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 5" />
          <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 4" />
          <circle cx="196" cy="100" r="3" fill="currentColor" />
        </g>
      </svg>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6", tall ? "py-20 sm:py-28" : "py-12 sm:py-16")}>
        <nav aria-label={tr("Breadcrumb")} className="mb-5">
          <ol className="flex flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-ivory/60">
            {trail.map((c, i) => (
              <li key={i} className="flex items-center gap-1">
                {c.href ? <Link href={c.href} className="rounded transition-colors hover:text-gold">{c.label}</Link> : <span aria-current="page" className="text-gold">{c.label}</span>}
                {i < trail.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden />}
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-[1.08] text-ivory sm:text-5xl lg:text-6xl">
            <SplitWords text={tr(title)} />
            {accent && <> <span className="inline-block font-serif font-normal italic text-gold"><SplitWords text={tr(accent)} delay={0.25} /></span></>}
          </h1>
          {intro && <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75 sm:text-lg">{tr(intro, introVars && Object.fromEntries(Object.entries(introVars).map(([k, v]) => [k, tr(v)])))}</motion.p>}
          {children && <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-6">{children}</motion.div>}
        </div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
    </header>
  );
}
