import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { company, publicNav } from "@/config/company";

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/faq", label: "FAQ" },
  { href: "/transparency#grievance", label: "Grievance Information" },
];

export function SiteFooter() {
  const c = company.contact;
  const socials = Object.entries(company.social).filter(([, v]) => v) as [string, string][];
  return (
    <footer className="bg-navy text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo tone="dark" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/75">{company.description}</p>
          <p className="mt-3 text-sm italic text-gold">{company.tagline}</p>
          {socials.length > 0 && (
            <ul className="mt-4 flex gap-4 text-sm">{socials.map(([k, v]) => <li key={k}><a href={v} rel="noopener noreferrer" target="_blank" className="capitalize underline">{k}</a></li>)}</ul>
          )}
        </div>
        <nav aria-label="Footer explore">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {publicNav.map((n) => <li key={n.href}><Link href={n.href} className="text-ivory/80 hover:text-white">{n.label}</Link></li>)}
            <li><Link href="/calculator" className="text-ivory/80 hover:text-white">Chit Calculator</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Legal &amp; contact</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {legal.map((n) => <li key={n.href}><Link href={n.href} className="text-ivory/80 hover:text-white">{n.label}</Link></li>)}
          </ul>
          <ul className="mt-4 space-y-1 text-sm text-ivory/75">
            <li>Phone: {c.phone ?? "To be updated"}</li>
            <li>Email: {c.email ?? "To be updated"}</li>
            <li>Office: {c.registeredOffice ?? "To be updated"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/15 px-4 py-5 text-center text-xs text-ivory/60">
        © {new Date().getFullYear()} {company.displayName} · Participation in any chit scheme is subject to the approved scheme terms and applicable law. Illustrations on this site are not offers or guarantees.
      </div>
    </footer>
  );
}
