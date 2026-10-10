import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { company, publicNav } from "@/config/company";
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
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/75">{company.description}</p>
          <p className="mt-3 font-serif text-xl italic text-gold">{company.tagline}</p>
          {socials.length > 0 && (
            <ul className="mt-4 flex gap-4 text-sm">{socials.map(([k, v]) => <li key={k}><a href={v} rel="noopener noreferrer" target="_blank" className="capitalize underline">{k}</a></li>)}</ul>
          )}
        </div>
        <nav aria-label="Footer explore">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Explore</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {publicNav.map((n) => <li key={n.href}><Link href={n.href} className={link}>{n.label}</Link></li>)}
            <li><Link href="/calculator" className={link}>Chit Calculator</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Legal &amp; contact</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {legal.map((n) => <li key={n.href}><Link href={n.href} className={link}>{n.label}</Link></li>)}
          </ul>
          <ul className="mt-4 space-y-1 text-sm text-ivory/75">
            <li>Phone: {c.phone ?? "To be updated"}</li>
            <li>Email: {c.email ?? "To be updated"}</li>
            <li>Office: {c.registeredOffice ?? "To be updated"}</li>
          </ul>
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6"><Wordmark text={company.shortName} /></div>
      <div className="relative border-t border-ivory/15 px-4 py-5 text-center text-xs text-ivory/60">
        © {new Date().getFullYear()} {company.displayName} · Participation in any chit scheme is subject to the approved scheme terms and applicable law. Illustrations on this site are not offers or guarantees.
      </div>
    </footer>
  );
}
