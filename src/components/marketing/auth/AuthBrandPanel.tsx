"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useTr } from "@/i18n/LanguageProvider";

const copy = {
  login: { h: "Welcome", a: "back.", p: "Sign in with your mobile number and a one-time password. No password to remember — and none requested.", pts: ["No password, PAN or Aadhaar is ever asked for", "Demo build: nothing you enter is sent or stored", "Real roles are assigned by the company, never self-selected"] },
  register: { h: "Start your", a: "application.", p: "A short walkthrough of the steps in joining an active scheme — with the reason for each step explained in plain language.", pts: ["Only active schemes can be joined", "Verification steps wait for a verified service", "No signature is simulated; no agreement is faked"] },
};

/** Dark emerald brand panel with orbiting rings and aurora. Honest, short copy. */
export function AuthBrandPanel() {
  const path = usePathname();
  const reduce = useReducedMotion();
  const tr = useTr();
  const c = path.startsWith("/register") ? copy.register : copy.login;
  return (
    <aside aria-label="MS Chit Funds" className="grain relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-8 text-ivory lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:px-12 lg:py-12">
      <div aria-hidden className="aurora pointer-events-none absolute -left-24 -top-24 -z-10 h-96 w-96 rounded-full bg-gold/25 blur-3xl" />
      <div aria-hidden className="aurora pointer-events-none absolute -bottom-32 -right-20 -z-10 h-[26rem] w-[26rem] rounded-full bg-emerald-700/60 blur-3xl [animation-delay:-8s]" />
      <svg aria-hidden className="pointer-events-none absolute -right-44 top-[58%] -z-10 hidden h-[34rem] w-[34rem] -translate-y-1/2 text-gold/25 lg:block" viewBox="0 0 200 200" fill="none">
        <g className="spin-slow origin-center [transform-box:fill-box]">
          <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 5" />
          <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="196" cy="100" r="3" fill="var(--gold)" />
          <circle cx="26" cy="100" r="2" fill="var(--gold-soft)" />
        </g>
        <motion.circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="0.6" animate={reduce ? undefined : { r: [52, 56, 52], opacity: [1, 0.4, 1] }} transition={{ duration: 6, repeat: Infinity }} />
      </svg>
      <div className="flex items-center justify-between">
        <Link href="/" aria-label={tr("MS Chit Funds home")} className="rounded-lg"><Logo tone="dark" /></Link>
      </div>
      <div className="mt-8 lg:mt-0">
        <h2 className="max-w-md text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{tr(c.h)} <span className="font-serif font-normal italic text-gold">{tr(c.a)}</span></h2>
        <p className="mt-4 hidden max-w-md text-ivory/75 sm:block">{tr(c.p)}</p>
        <ul className="mt-6 hidden space-y-3 text-sm text-ivory/85 lg:block">
          {c.pts.map((t, i) => (
            <motion.li key={t} initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-navy"><Check className="h-3 w-3" strokeWidth={3.5} /></span>{tr(t)}
            </motion.li>
          ))}
        </ul>
      </div>
      <p className="mt-6 hidden text-xs text-ivory/50 lg:block">{tr("Demo build — all data, sign-in and approvals are simulated.")}</p>
    </aside>
  );
}
