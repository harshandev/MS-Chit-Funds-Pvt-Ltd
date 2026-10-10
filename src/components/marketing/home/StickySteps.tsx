"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowRight, BarChart3, Check, FileSearch, ShieldCheck, Sliders, UserCheck, Landmark } from "lucide-react";
import { schemes } from "@/data/demo";
import { formatINR } from "@/lib/money";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { useTr } from "@/i18n/LanguageProvider";
import { lakh } from "../constants";
import { cn } from "@/lib/cn";

const steps = [
  { n: "01", title: "Explore a scheme", text: "Browse available chit schemes and their key figures.", icon: FileSearch },
  { n: "02", title: "Understand the terms", text: "Read the scheme terms and try the calculator before you decide.", icon: Sliders },
  { n: "03", title: "Complete the required onboarding", text: "Profile, KYC and bank verification, as required for the scheme.", icon: UserCheck },
  { n: "04", title: "Manage your participation digitally", text: "Track instalments, auctions and documents from your dashboard.", icon: BarChart3 },
];
const note = "Participation, eligibility and commencement depend on each scheme's terms and on regulatory requirements. Nothing on this site is an offer to enrol.";

function Visual({ i }: { i: number }) {
  const tr = useTr();
  const shell = "relative h-full w-full overflow-hidden rounded-3xl border border-ivory/15 bg-ivory/[0.06] p-6 backdrop-blur-xl sm:p-8";
  if (i === 0)
    return (
      <div className={shell} aria-hidden>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{tr("Illustrative schemes")}</p>
        <ul className="mt-5 space-y-3">
          {schemes.slice(0, 3).map((s, k) => (
            <motion.li key={s.id} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: k * 0.12, type: "spring", stiffness: 160, damping: 18 }}
              className="flex items-center justify-between rounded-2xl border border-ivory/15 bg-emerald-950/60 px-5 py-4">
              <div><p className="font-serif text-2xl text-ivory">{lakh(tr, s.rules.grossChit)}</p><p className="text-xs text-ivory/60">{tr("{n} months", { n: s.rules.instalments })} · {tr("{amt}/mo", { amt: formatINR(s.rules.instalment) })}</p></div>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold-soft">{tr(s.status)}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  if (i === 1)
    return (
      <div className={shell} aria-hidden>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{tr("Test the numbers")}</p>
        <div className="mt-6 space-y-6">
          {[["Discount", 60], ["Commission", 17], ["Dividend", 43]].map(([l, v], k) => (
            <div key={l as string}>
              <div className="flex justify-between text-sm text-ivory/80"><span>{tr(l as string)}</span><span className="text-ivory/50">{tr("sample")}</span></div>
              <div className="mt-2 h-2.5 rounded-full bg-ivory/10"><motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-gold-antique to-gold-soft" initial={{ scaleX: 0 }} animate={{ scaleX: (v as number) / 100 }} transition={{ delay: 0.15 + k * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%" }} /></div>
            </div>
          ))}
        </div>
        <p className="mt-8 rounded-2xl border border-ivory/15 bg-emerald-950/60 p-4 text-sm text-ivory/75">{tr("Read the terms, then try the calculator with your own assumptions.")}</p>
      </div>
    );
  if (i === 2)
    return (
      <div className={shell} aria-hidden>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{tr("Onboarding, as required")}</p>
        <ul className="mt-6 space-y-3">
          {[["Profile details", UserCheck], ["KYC verification", ShieldCheck], ["Bank verification", Landmark]].map(([l, Ic], k) => {
            const Icon = Ic as typeof UserCheck;
            return (
              <motion.li key={l as string} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.18 }} className="flex items-center gap-4 rounded-2xl border border-ivory/15 bg-emerald-950/60 px-5 py-4">
                <Icon className="h-6 w-6 text-gold" />
                <span className="flex-1 text-ivory">{tr(l as string)}</span>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + k * 0.25, type: "spring", stiffness: 400, damping: 14 }} className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-navy"><Check className="h-4 w-4" /></motion.span>
              </motion.li>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-ivory/60">{tr("Requirements vary by scheme.")}</p>
      </div>
    );
  return (
    <div className={shell} aria-hidden>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{tr("Your dashboard (demo)")}</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {["Instalments", "Auctions", "Documents"].map((l, k) => (
          <motion.div key={l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.1 }} className="rounded-2xl border border-ivory/15 bg-emerald-950/60 p-3 text-center text-xs text-ivory/80">{tr(l)}</motion.div>
        ))}
      </div>
      <div className="mt-6 flex h-32 items-end gap-2">
        {[30, 48, 40, 66, 54, 78, 62, 90].map((h, k) => (
          <motion.span key={k} className="flex-1 origin-bottom rounded-t-md bg-gradient-to-t from-emerald-700 to-gold" style={{ height: `${h}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.2 + k * 0.07, type: "spring", stiffness: 150, damping: 14 }} />
        ))}
      </div>
      <p className="mt-4 text-xs text-ivory/60">{tr("Illustrative shapes, not data.")}</p>
    </div>
  );
}

function Desktop() {
  const tr = useTr();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length * 0.999)))));
  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + ((i + 0.5) / steps.length) * range, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <div ref={ref} className="relative hidden h-[360vh] lg:block">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center gap-16 px-6">
          <div>
            <Eyebrow className="text-gold">{tr("How it works")}</Eyebrow>
            <h2 className="mt-2 font-serif text-5xl text-ivory">{tr("Four steps,")} <em className="text-shimmer pr-[0.14em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">{tr("explained simply.")}</em></h2>
            <div className="relative mt-10 pl-10">
              <div aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-ivory/15" />
              <motion.div aria-hidden className="absolute bottom-3 left-[14px] top-3 w-0.5 origin-top bg-gold" style={{ scaleY: line }} />
              <ol className="space-y-5">
                {steps.map((s, i) => (
                  <li key={s.n} className="relative">
                    <span aria-hidden className={cn("absolute -left-10 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-all duration-500", i <= active ? "border-gold bg-gold text-navy" : "border-ivory/30 bg-emerald-950 text-ivory/60", i === active && "scale-110 shadow-[0_0_24px_rgb(212_175_55/0.6)]")}>{s.n}</span>
                    <button type="button" onClick={() => jump(i)} aria-current={i === active ? "step" : undefined} className={cn("block w-full rounded-xl p-2 text-left transition-opacity duration-500", i === active ? "opacity-100" : "opacity-45 hover:opacity-80")}>
                      <span className="block text-xl font-bold text-ivory">{tr(s.title)}</span>
                      <AnimatePresence initial={false}>
                        {i === active && <motion.span key="t" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden text-sm leading-relaxed text-ivory/70"><span className="block pt-1">{tr(s.text)}</span></motion.span>}
                      </AnimatePresence>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-8 max-w-md text-xs leading-relaxed text-ivory/55">{tr(note)}</p>
            <div className="mt-6"><Link href="/how-it-works" className={buttonClass("gold")}>{tr("Read the full guide")} <ArrowRight className="h-4 w-4" aria-hidden /></Link></div>
          </div>
          <div className="relative h-[26rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={active} className="absolute inset-0" initial={reduce ? false : { opacity: 0, y: 24, rotateX: -8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={reduce ? undefined : { opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 1000 }}>
                <Visual i={active} />
                <span className="sr-only">{tr("Step {n}: {title}", { n: steps[active].n, title: tr(steps[active].title) })}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mobile() {
  const tr = useTr();
  return (
    <div className="px-4 py-20 sm:px-6 lg:hidden">
      <Reveal>
        <Eyebrow className="text-gold">{tr("How it works")}</Eyebrow>
        <h2 className="mt-2 font-serif text-4xl text-ivory">{tr("Four steps,")} <em className="text-shimmer pr-[0.14em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">{tr("explained simply.")}</em></h2>
      </Reveal>
      <ol className="relative mt-10 space-y-8 border-l border-gold/40 pl-8">
        {steps.map((s) => (
          <li key={s.n} className="relative">
            <Reveal dir="left" distance={20}>
              <span aria-hidden className="absolute -left-[3.05rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{s.n}</span>
              <div className="rounded-2xl border border-ivory/15 bg-ivory/[0.06] p-5">
                <s.icon className="h-5 w-5 text-gold" aria-hidden />
                <h3 className="mt-2 text-lg font-bold text-ivory">{tr(s.title)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ivory/70">{tr(s.text)}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-xs leading-relaxed text-ivory/60">{tr(note)}</p>
      <div className="mt-6"><Link href="/how-it-works" className={buttonClass("gold")}>{tr("Read the full guide")} <ArrowRight className="h-4 w-4" aria-hidden /></Link></div>
    </div>
  );
}

export function StickySteps() {
  const tr = useTr();
  return (
    <section aria-label={tr("How it works")} className="relative overflow-x-clip bg-gradient-to-b from-emerald-950 to-emerald-900 text-ivory">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-gold/10 to-transparent" />
      <Desktop />
      <Mobile />
    </section>
  );
}
