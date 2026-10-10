"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";

export interface NavItem { id: string; label: string; n?: string }

/** Scroll-spy navigation: vertical rail on lg+, horizontal sticky chip bar below. Active indicator glides via layoutId. */
export function SectionNav({ items, active, uid, title = "On this page", className }: { items: NavItem[]; active: string; uid: string; title?: string; className?: string }) {
  const tr = useTr();
  return (
    <nav aria-label={tr(title)} className={className}>
      {/* Desktop rail */}
      <div className="hidden lg:block">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">{tr(title)}</p>
        <ul className="relative mt-4 border-l border-line">
          {items.map((t) => {
            const on = active === t.id;
            return (
              <li key={t.id} className="relative">
                {on && <motion.span layoutId={`${uid}-rail`} aria-hidden className="absolute -left-px top-1 bottom-1 w-0.5 rounded-full bg-gold" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <a href={`#${t.id}`} aria-current={on ? "location" : undefined} className={cn("group flex min-h-10 items-center gap-3 py-1.5 pl-4 pr-2 text-sm font-semibold transition-colors", on ? "text-emerald" : "text-muted hover:text-ink")}>
                  {t.n && <span className={cn("font-serif text-base italic transition-colors", on ? "text-gold-antique" : "text-muted/60")}>{t.n}</span>}
                  <span className={cn("transition-transform duration-300", on && "translate-x-0.5")}>{tr(t.label)}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Mobile chip bar */}
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 py-2 lg:hidden [scrollbar-width:none]">
        {items.map((t) => {
          const on = active === t.id;
          return (
            <li key={t.id} className="shrink-0">
              <a href={`#${t.id}`} aria-current={on ? "location" : undefined} className={cn("relative inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors", on ? "text-ivory" : "bg-white text-emerald ring-1 ring-line hover:ring-gold-antique")}>
                {on && <motion.span layoutId={`${uid}-chip`} aria-hidden className="absolute inset-0 rounded-full bg-emerald" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{tr(t.label)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
