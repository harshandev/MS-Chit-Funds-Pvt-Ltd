"use client";
import { motion, useReducedMotion } from "motion/react";
import { Calculator, FileSearch, FolderLock, FileText, Receipt, ScrollText } from "lucide-react";
import { Spotlight } from "@/components/motion/Spotlight";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <StaggerItem className={cn("h-full", className)}>
      <Spotlight className="group h-full overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-1)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-3)] sm:p-8">
        {children}
      </Spotlight>
    </StaggerItem>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald transition-[transform,background-color,color] duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-emerald group-hover:text-gold">{children}</span>;
}

function MiniSchemeRows() {
  const reduce = useReducedMotion();
  const rows = [["Value", "₹1,00,000"], ["Instalment", "₹5,000 / mo"], ["Duration", "20 months"], ["Status", "Illustrative"]];
  return (
    <div className="mt-6 space-y-2" aria-hidden>
      {rows.map(([k, v], i) => (
        <motion.div key={k} initial={reduce ? false : { opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
          className="flex items-center justify-between rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm transition-colors group-hover:border-gold/50">
          <span className="text-muted">{k}</span><span className="font-semibold text-ink">{v}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MiniBars() {
  const reduce = useReducedMotion();
  const h = [38, 62, 46, 80, 58, 92];
  return (
    <div className="mt-6 flex h-28 items-end gap-2" aria-hidden>
      {h.map((v, i) => (
        <motion.span key={i} className="flex-1 origin-bottom rounded-t-lg bg-gradient-to-t from-emerald to-emerald-700 transition-colors group-hover:from-gold-antique group-hover:to-gold"
          style={{ height: `${v}%` }} initial={reduce ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 140, damping: 14 }} />
      ))}
    </div>
  );
}

export function Bento() {
  return (
    <section aria-labelledby="pillars-title" className="relative overflow-x-clip bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <Eyebrow>Our approach</Eyebrow>
          <h2 id="pillars-title" className="mt-2 font-serif text-4xl text-emerald sm:text-5xl">Confidence starts with <em className="text-gold-antique">clarity.</em></h2>
          <p className="mt-4 text-base leading-relaxed text-muted">Chit funds work best when everyone understands them. We design around three simple ideas.</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3 md:grid-rows-2" gap={0.12}>
          <Tile className="md:col-span-2 md:row-span-1">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <IconBadge><FileSearch className="h-6 w-6" aria-hidden /></IconBadge>
                <h3 className="mt-5 text-2xl font-bold text-emerald">Clear scheme information</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">Every scheme lays out its value, instalment, duration and status in plain language, with terms one click away.</p>
              </div>
              <MiniSchemeRows />
            </div>
          </Tile>
          <Tile className="md:row-span-2">
            <IconBadge><Calculator className="h-6 w-6" aria-hidden /></IconBadge>
            <h3 className="mt-5 text-2xl font-bold text-emerald">Transparent financial calculations</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">See how a chit amount, discount, commission and dividend relate to each other, with the arithmetic shown.</p>
            <MiniBars />
            <p className="mt-3 text-xs text-muted">Illustrative shapes, not data.</p>
          </Tile>
          <Tile className="md:col-span-2">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <IconBadge><FolderLock className="h-6 w-6" aria-hidden /></IconBadge>
                <h3 className="mt-5 text-2xl font-bold text-emerald">Accessible digital records</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">Statements, receipts and scheme documents are designed to be organised in one place you can return to.</p>
              </div>
              <ul className="grid grid-cols-3 gap-3" aria-hidden>
                {[FileText, Receipt, ScrollText].map((I, i) => (
                  <li key={i} className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-line bg-ivory text-gold-antique transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold" style={{ transitionDelay: `${i * 60}ms` }}><I className="h-8 w-8" /></li>
                ))}
              </ul>
            </div>
          </Tile>
        </Stagger>
      </div>
    </section>
  );
}
