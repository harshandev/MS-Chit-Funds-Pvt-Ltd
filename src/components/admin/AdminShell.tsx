"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import * as D from "@radix-ui/react-dialog";
import {
  LayoutDashboard, Layers, Users, Gavel, CreditCard, Banknote, Scale, FileText, ShieldCheck, LifeBuoy, ScrollText, Settings, Menu, X, LogOut, UserCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/Logo";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { company } from "@/config/company";
import { useDemoAuth } from "@/lib/demoAuth";
import { ActingAsProvider, ActingAsSwitch, useActingAs } from "./ActingAs";
import { AdminStateProvider } from "./AdminState";

interface NavItem { href: string; label: string; icon: LucideIcon }
const groups: { title: string; items: NavItem[] }[] = [
  { title: "Operations", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/chits", label: "Chit schemes", icon: Layers },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/auctions", label: "Auctions", icon: Gavel },
  ] },
  { title: "Money", items: [
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/payouts", label: "Payouts", icon: Banknote },
    { href: "/admin/reconciliation", label: "Reconciliation", icon: Scale },
  ] },
  { title: "Governance", items: [
    { href: "/admin/documents", label: "Documents", icon: FileText },
    { href: "/admin/compliance", label: "Compliance", icon: ShieldCheck },
    { href: "/admin/support", label: "Support", icon: LifeBuoy },
    { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ] },
];
const allItems = groups.flatMap((g) => g.items);

const isActive = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Administration" className="flex-1 overflow-y-auto px-3 pb-4">
      {groups.map((g) => (
        <div key={g.title} className="mt-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/50">{g.title}</p>
          <ul className="mt-1.5 space-y-0.5">
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(path, href);
              return (
                <li key={href}>
                  <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                    className={cn("flex min-h-10 items-center gap-2.5 rounded-md border-l-[3px] px-3 text-[13px] font-semibold transition-colors",
                      active ? "border-gold bg-ivory/10 text-ivory" : "border-transparent text-ivory/75 hover:bg-ivory/5 hover:text-ivory")}>
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-gold")} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <LogoMark tone="dark" className="h-8 w-8" />
      <div className="leading-tight">
        <p className="font-heading text-sm font-extrabold text-ivory">{company.shortName}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Admin console</p>
      </div>
    </div>
  );
}

/** Quick page finder in the top bar (type a page name, press Enter). */
function PageFinder() {
  const id = useId();
  const listId = useId();
  const router = useRouter();
  const [q, setQ] = useState("");
  const go = (value: string) => {
    const hit = allItems.find((i) => i.label.toLowerCase() === value.trim().toLowerCase()) ?? allItems.find((i) => i.label.toLowerCase().includes(value.trim().toLowerCase()));
    if (hit && value.trim()) { router.push(hit.href); setQ(""); }
  };
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); go(q); }} className="hidden min-w-0 flex-1 md:block md:max-w-xs">
      <label htmlFor={id} className="sr-only">Go to page</label>
      <input id={id} list={listId} value={q} onChange={(e) => { setQ(e.target.value); if (allItems.some((i) => i.label === e.target.value)) go(e.target.value); }}
        placeholder="Go to page…" className="min-h-9 w-full rounded-md border border-line bg-ivory px-3 text-sm placeholder:text-muted/70 focus:border-navy" />
      <datalist id={listId}>{allItems.map((i) => <option key={i.href} value={i.label} />)}</datalist>
    </form>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { signOut } = useDemoAuth();
  const { role } = useActingAs();
  const [open, setOpen] = useState(false);
  const leaving = useRef(false);
  const signOutRef = useRef(signOut);
  useEffect(() => { signOutRef.current = signOut; }, [signOut]);
  // Clear the demo session only after the admin shell has unmounted, so the
  // route guard cannot redirect to /login while we navigate home.
  useEffect(() => () => { if (leaving.current) signOutRef.current(); }, []);
  const current = allItems.find((i) => isActive(path, i.href));

  return (
    <div className="min-h-dvh bg-ivory">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">Skip to main content</a>
      <DemoBanner />
      <div className="flex">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-navy text-ivory lg:flex" aria-label="Sidebar">
          <SidebarBrand />
          <NavList />
        </aside>

        <D.Root open={open} onOpenChange={setOpen}>
          <D.Portal>
            <D.Overlay className="fixed inset-0 z-50 bg-navy/60 lg:hidden" />
            <D.Content className="fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col bg-navy text-ivory shadow-[var(--shadow-3)] lg:hidden">
              <D.Title className="sr-only">Administration menu</D.Title>
              <D.Description className="sr-only">Navigate between administration pages</D.Description>
              <div className="flex items-center justify-between pr-3"><SidebarBrand />
                <D.Close className="rounded-md p-2 text-ivory/80 hover:bg-ivory/10" aria-label="Close menu"><X className="h-5 w-5" /></D.Close>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </D.Content>
          </D.Portal>
        </D.Root>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-white px-3 py-2 sm:px-5">
            <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-navy hover:bg-ivory lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <p className="text-sm font-bold text-navy lg:min-w-32">{current?.label ?? "Admin"}</p>
            <PageFinder />
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-gold px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy">Demo mode</span>
              <ActingAsSwitch />
              <span className="inline-flex items-center gap-1.5 rounded-md bg-navy/10 px-2.5 py-1.5 text-xs font-semibold text-navy" title={`Acting as ${role}`}>
                <UserCircle2 className="h-4 w-4" aria-hidden />Demo admin
              </span>
              <button type="button" onClick={() => { leaving.current = true; router.push("/"); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-semibold text-navy hover:bg-ivory">
                <LogOut className="h-4 w-4" aria-hidden />Sign out
              </button>
            </div>
          </div>
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-3 py-5 text-sm sm:px-5 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <ActingAsProvider>
      <AdminStateProvider>
        <Shell>{children}</Shell>
      </AdminStateProvider>
    </ActingAsProvider>
  );
}
