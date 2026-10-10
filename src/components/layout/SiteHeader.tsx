"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import * as D from "@radix-ui/react-dialog";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";
import { company, publicNav } from "@/config/company";
import { useLang } from "@/i18n/LanguageProvider";
import { languages } from "@/i18n/dictionaries";
import type { DictKey } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";

const keys: Record<string, DictKey> = { "/": "nav.home", "/how-it-works": "nav.how", "/chit-plans": "nav.plans", "/transparency": "nav.transparency", "/about": "nav.about", "/contact": "nav.contact" };

function LangSwitch({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">Language</span>
      <select value={lang} onChange={(e) => setLang(e.target.value as "en" | "ta")} className={cn("min-h-11 rounded-md border px-2 text-sm transition-colors", dark ? "border-ivory/30 bg-white/10 text-ivory [&>option]:text-ink" : "border-line bg-white text-ink")}>
        {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  const { t } = useLang();
  const dark = path === "/" && !scrolled;
  const shown = hover ?? path;

  return (
    <>
      {company.announcement && <div className="relative z-40 bg-emerald-950 px-4 py-2 text-center text-xs text-ivory/90 sm:text-sm">{company.announcement}</div>}
      <header className={cn("sticky top-0 z-40 border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-500", dark ? "border-transparent bg-transparent" : "border-line/70 bg-ivory/80 shadow-[var(--shadow-2)] backdrop-blur-xl")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label={`${company.displayName} home`} className="rounded-md"><Logo tone={dark ? "dark" : "light"} /></Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex" onPointerLeave={() => setHover(null)}>
            {publicNav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined} onPointerEnter={() => setHover(n.href)} onFocus={() => setHover(n.href)} onBlur={() => setHover(null)}
                className={cn("relative whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors", dark ? "text-ivory/85 hover:text-ivory" : "text-ink hover:text-emerald", path === n.href && (dark ? "text-ivory" : "text-emerald"))}>
                {t(keys[n.href])}
                {shown === n.href && <motion.span aria-hidden layoutId="nav-underline" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }} className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" />}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 xl:flex">
            <LangSwitch dark={dark} />
            <Link href="/login" className={buttonClass(dark ? "glass" : "ghost", "sm", "min-h-11")}>{t("nav.signin")}</Link>
            <Link href="/chit-plans" className={buttonClass(dark ? "gold" : "primary", "sm", "min-h-11")}>{t("nav.explore")}</Link>
          </div>
          <D.Root open={open} onOpenChange={setOpen}>
            <D.Trigger className={cn("flex h-11 w-11 items-center justify-center rounded-md transition-colors xl:hidden", dark ? "text-ivory" : "text-emerald")} aria-label="Open menu"><Menu className="h-6 w-6" /></D.Trigger>
            <D.Portal>
              <D.Overlay asChild><motion.div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} /></D.Overlay>
              <D.Content className="fixed right-0 top-0 z-50 h-dvh w-[min(22rem,100vw)] outline-none">
                <motion.div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-emerald-950 to-emerald-900 p-5 text-ivory shadow-[var(--shadow-3)]" initial={reduce ? false : { x: "100%" }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
                  <D.Title className="sr-only">Menu</D.Title>
                  <D.Description className="sr-only">Site navigation</D.Description>
                  <div className="flex items-center justify-between">
                    <Logo tone="dark" />
                    <D.Close className="flex h-11 w-11 items-center justify-center rounded-md" aria-label="Close menu"><X className="h-6 w-6" /></D.Close>
                  </div>
                  <nav aria-label="Mobile" className="mt-8 flex flex-col">
                    {publicNav.map((n, i) => (
                      <motion.div key={n.href} initial={reduce ? false : { opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                        <Link href={n.href} onClick={() => setOpen(false)} aria-current={path === n.href ? "page" : undefined} className={cn("flex min-h-14 items-center justify-between border-b border-ivory/10 font-serif text-2xl", path === n.href ? "text-gold" : "text-ivory")}>
                          {t(keys[n.href])}{path === n.href && <span aria-hidden className="h-2 w-2 rounded-full bg-gold" />}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                  <motion.div className="mt-8 flex flex-col gap-3" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                    <LangSwitch dark />
                    <Link href="/login" onClick={() => setOpen(false)} className={buttonClass("glass")}>{t("nav.signin")}</Link>
                    <Link href="/chit-plans" onClick={() => setOpen(false)} className={buttonClass("gold")}>{t("nav.explore")}</Link>
                  </motion.div>
                </motion.div>
              </D.Content>
            </D.Portal>
          </D.Root>
        </div>
      </header>
    </>
  );
}
