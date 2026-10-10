"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { schemes } from "@/data/demo";
import { formatINR } from "@/lib/money";
import { StatusBadge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Tilt } from "@/components/motion/Tilt";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Card";
import { useTr } from "@/i18n/LanguageProvider";
import { lakh } from "../constants";
import { cn } from "@/lib/cn";

export function PlansCarousel() {
  const tr = useTr();
  const reduce = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(0);
  const [step, setStep] = useState(340);
  const [index, setIndex] = useState(0);
  const moved = useRef(false);

  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !track.current) return;
      const first = track.current.children[0] as HTMLElement | undefined;
      const gap = 20;
      setStep((first?.offsetWidth ?? 320) + gap);
      setMax(Math.max(0, track.current.scrollWidth - viewport.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback((i: number) => {
    const n = Math.min(schemes.length - 1, Math.max(0, i));
    setIndex(n);
    const target = -Math.min(max, n * step);
    if (reduce) x.set(target); else animate(x, target, { type: "spring", stiffness: 220, damping: 30 });
  }, [max, step, reduce, x]);

  return (
    <section aria-labelledby="featured-title" className="relative overflow-x-clip bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <Eyebrow>{tr("Chit plans")}</Eyebrow>
            <h2 id="featured-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">{tr("Illustrative schemes")} <em className="text-gold-antique">{tr("to explore.")}</em></h2>
            <p className="mt-4 text-base leading-relaxed text-muted">{tr("These demo schemes show how scheme information will be presented. They are not available offers.")}</p>
          </Reveal>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label={tr("Previous scheme")} className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-emerald transition-colors hover:border-gold-antique disabled:opacity-40"><ArrowLeft className="h-5 w-5" aria-hidden /></button>
            <button type="button" onClick={() => goTo(index + 1)} disabled={index >= schemes.length - 1} aria-label={tr("Next scheme")} className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-emerald transition-colors hover:border-gold-antique disabled:opacity-40"><ArrowRight className="h-5 w-5" aria-hidden /></button>
          </div>
        </div>
      </div>

      <div
        ref={viewport} role="region" aria-roledescription="carousel" aria-label={tr("Illustrative demo schemes")} tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); } }}
        className="mx-auto mt-10 max-w-7xl cursor-grab overflow-hidden px-4 py-6 active:cursor-grabbing sm:px-6"
      >
        <motion.ul
          ref={track} style={{ x }} drag="x" dragConstraints={{ left: -max, right: 0 }} dragElastic={0.12}
          onDragStart={() => { moved.current = true; }}
          onDragEnd={(_, info) => {
            const projected = -x.get() - info.velocity.x * 0.15;
            goTo(Math.round(projected / step));
            setTimeout(() => { moved.current = false; }, 60);
          }}
          className="flex gap-5"
        >
          {schemes.map((s, i) => {
            const r = s.rules;
            return (
              <li key={s.id} aria-roledescription="slide" aria-label={tr("{i} of {n}", { i: i + 1, n: schemes.length })} className="w-[82%] shrink-0 sm:w-[22rem]">
                <Tilt className="relative h-full rounded-3xl" max={5}>
                  <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-2)] sm:p-7">
                    <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/15 blur-2xl" />
                    <div className="relative flex flex-wrap items-center gap-2">
                      <StatusBadge status={s.status} />
                      <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-ink">{tr("Illustrative demo scheme")}</span>
                    </div>
                    <h3 className="relative mt-5 font-serif text-4xl text-emerald">{lakh(tr, r.grossChit)}</h3>
                    <p className="relative text-sm font-semibold text-ink">{tr(s.name)}</p>
                    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">{tr(s.summary)}</p>
                    <dl className="relative mt-5 grid grid-cols-3 gap-3 border-y border-line py-4 text-sm">
                      <div><dt className="text-[11px] uppercase tracking-wider text-muted">{tr("Instalment")}</dt><dd className="font-bold tabular-nums">{formatINR(r.instalment)}</dd></div>
                      <div><dt className="text-[11px] uppercase tracking-wider text-muted">{tr("Duration")}</dt><dd className="font-bold tabular-nums">{tr("{n} mo", { n: r.instalments })}</dd></div>
                      <div><dt className="text-[11px] uppercase tracking-wider text-muted">{tr("Tickets")}</dt><dd className="font-bold tabular-nums">{r.tickets}</dd></div>
                    </dl>
                    <p className="relative mt-3 text-xs text-muted">{tr(s.commencementNote)}</p>
                    <Link href={`/chit-plans/${s.id}`} draggable={false} onClick={(e) => { if (moved.current) e.preventDefault(); }} className={buttonClass("primary", "md", "relative mt-4")}>{tr("View details")} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                  </article>
                </Tilt>
              </li>
            );
          })}
        </motion.ul>
      </div>

      <div className="mx-auto mt-2 flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex gap-2" aria-hidden>
          {schemes.map((s, i) => <span key={s.id} className={cn("h-1.5 rounded-full transition-all duration-300", i === index ? "w-8 bg-gold-antique" : "w-1.5 bg-line")} />)}
        </div>
        <Link href="/chit-plans" className={buttonClass("secondary", "sm")}>{tr("View all plans")}</Link>
      </div>
    </section>
  );
}
