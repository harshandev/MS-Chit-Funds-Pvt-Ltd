import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { company, publicNav } from "@/config/company";
import { T } from "@/i18n/T";
import { FooterLine, Wordmark } from "./FooterLine";

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/faq", label: "FAQ" },
  { href: "/transparency#grievance", label: "Grievance Information" },
];
const link = "inline-flex min-h-8 items-center text-ivory/75 transition-[color,transform] duration-200 hover:translate-x-1 hover:text-gold";

export function SiteFooter() {
  const c = company.contact;
  const socials = Object.entries(company.social).filter(([, v]) => v) as [string, string][];
  return (
    <footer className="relative overflow-hidden bg-navy text-ivory">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald/40 blur-[110px]" />
      <FooterLine />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo tone="dark" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/75"><T>{company.description}</T></p>
          <p className="mt-3 font-serif text-xl italic text-gold"><T>{company.tagline}</T></p>
          {socials.length > 0 && (
            <ul className="mt-4 flex gap-4 text-sm">{socials.map(([k, v]) => <li key={k}><a href={v} rel="noopener noreferrer" target="_blank" className="capitalize underline"><T>{k.charAt(0).toUpperCase() + k.slice(1)}</T></a></li>)}</ul>
          )}
        </div>
        <nav aria-label="Footer explore">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold"><T>Explore</T></h2>
          <ul className="mt-4 space-y-1 text-sm">
            {publicNav.map((n) => <li key={n.href}><Link href={n.href} className={link}><T>{n.label}</T></Link></li>)}
            <li><Link href="/calculator" className={link}><T>Chit Calculator</T></Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold"><T>Legal & contact</T></h2>
          <ul className="mt-4 space-y-1 text-sm">
            {legal.map((n) => <li key={n.href}><Link href={n.href} className={link}><T>{n.label}</T></Link></li>)}
          </ul>
          <ul className="mt-4 space-y-1 text-sm text-ivory/75">
            <li><T vars={{ v: c.phone ?? "" }}>{c.phone ? "Phone: {v}" : "Phone: To be updated"}</T></li>
            <li><T vars={{ v: c.email ?? "" }}>{c.email ? "Email: {v}" : "Email: To be updated"}</T></li>
            <li><T vars={{ v: c.registeredOffice ?? "" }}>{c.registeredOffice ? "Office: {v}" : "Office: To be updated"}</T></li>
          </ul>
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6"><Wordmark text={company.shortName} /></div>
      <div className="relative border-t border-ivory/15 px-4 py-5 text-center text-xs text-ivory/60">
        © {new Date().getFullYear()} {company.displayName} · <T>Participation in any chit scheme is subject to the approved scheme terms and applicable law. Illustrations on this site are not offers or guarantees.</T>
      </div>
    </footer>
  );
}
