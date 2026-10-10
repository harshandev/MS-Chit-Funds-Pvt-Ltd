"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import * as D from "@radix-ui/react-dialog";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";
import { company, publicNav } from "@/config/company";
import { useLang } from "@/i18n/LanguageProvider";
import { languages } from "@/i18n/dictionaries";
import type { DictKey } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";

const keys: Record<string, DictKey> = { "/": "nav.home", "/how-it-works": "nav.how", "/chit-plans": "nav.plans", "/transparency": "nav.transparency", "/about": "nav.about", "/contact": "nav.contact" };

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">Language</span>
      <select value={lang} onChange={(e) => setLang(e.target.value as "en" | "ta")} className="min-h-9 rounded-md border border-line bg-white px-2 text-sm">
        {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  return (
    <>
      {company.announcement && <div className="bg-emerald px-4 py-2 text-center text-xs text-ivory sm:text-sm">{company.announcement}</div>}
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label={`${company.displayName} home`}><Logo /></Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {publicNav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}
                className={cn("rounded-md px-3 py-2 text-sm font-medium hover:text-emerald", path === n.href ? "text-emerald underline decoration-gold decoration-2 underline-offset-8" : "text-ink")}>
                {t(keys[n.href])}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <LangSwitch />
            <Link href="/login" className={buttonClass("ghost", "sm")}>{t("nav.signin")}</Link>
            <Link href="/chit-plans" className={buttonClass("primary", "sm")}>{t("nav.explore")}</Link>
          </div>
          <D.Root open={open} onOpenChange={setOpen}>
            <D.Trigger className="rounded-md p-2 text-emerald lg:hidden" aria-label="Open menu"><Menu className="h-6 w-6" /></D.Trigger>
            <D.Portal>
              <D.Overlay className="fixed inset-0 z-50 bg-navy/50" />
              <D.Content className="fixed right-0 top-0 z-50 flex h-dvh w-[min(20rem,100vw)] flex-col bg-ivory p-5 shadow-[var(--shadow-3)]">
                <D.Title className="sr-only">Menu</D.Title>
                <D.Description className="sr-only">Site navigation</D.Description>
                <div className="flex items-center justify-between">
                  <Logo />
                  <D.Close className="rounded-md p-2" aria-label="Close menu"><X className="h-6 w-6" /></D.Close>
                </div>
                <nav aria-label="Mobile" className="mt-6 flex flex-col">
                  {publicNav.map((n) => (
                    <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line font-semibold text-ink">{t(keys[n.href])}</Link>
                  ))}
                </nav>
                <div className="mt-6 flex flex-col gap-3">
                  <LangSwitch />
                  <Link href="/login" onClick={() => setOpen(false)} className={buttonClass("secondary")}>{t("nav.signin")}</Link>
                  <Link href="/chit-plans" onClick={() => setOpen(false)} className={buttonClass("primary")}>{t("nav.explore")}</Link>
                </div>
              </D.Content>
            </D.Portal>
          </D.Root>
        </div>
      </header>
    </>
  );
}
