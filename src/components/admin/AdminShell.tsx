"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  LayoutDashboard, Layers, Users, Gavel, CreditCard, Banknote, Scale, FileText, ShieldCheck, LifeBuoy, ScrollText, Settings, Menu, LogOut, UserCircle2, Search, ChevronDown, Plus, Pencil, Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/Logo";
import { PulseDot } from "@/components/ui/fx";
import { CommandPalette, ShortcutHint, useCommandKey, type PaletteItem } from "@/components/ui/CommandPalette";
import { SideSheet } from "@/components/ui/SideSheet";
import { useToast } from "@/components/ui/Toast";
import { PageTransition } from "@/components/motion/PageTransition";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { company } from "@/config/company";
import { useDemoAuth } from "@/lib/demoAuth";
import { ActingAsProvider, ActingAsSwitch, useActingAs } from "./ActingAs";
import { AdminStateProvider, useAdminState } from "./AdminState";

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

function CountBadge({ n }: { n: number }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {n > 0 && (
        <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold tabular-nums text-navy">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={n} initial={reduce ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }}>{n}</motion.span>
          </AnimatePresence>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function NavList({ onNavigate, pillId }: { onNavigate?: () => void; pillId: string }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const { requests, audit } = useAdminState();
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());
  const pending = requests.filter((r) => r.state === "Pending approval").length;
  const counts: Record<string, number> = { "/admin/chits": pending, "/admin/audit-logs": audit.length };
  const toggle = (t: string) => setClosed((c) => { const n = new Set(c); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  return (
    <nav aria-label="Administration" className="flex-1 overflow-y-auto px-3 pb-4">
      <LayoutGroup id={pillId}>
        {groups.map((g) => {
          const isOpen = !closed.has(g.title);
          const lid = `grp-${pillId}-${g.title}`;
          return (
            <div key={g.title} className="mt-3">
              <button type="button" aria-expanded={isOpen} aria-controls={lid} onClick={() => toggle(g.title)}
                className="flex min-h-8 w-full items-center justify-between rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/50 transition-colors hover:text-ivory/90">
                {g.title}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", !isOpen && "-rotate-90")} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul id={lid} initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="mt-1 space-y-0.5 overflow-hidden">
                    {g.items.map(({ href, label, icon: Icon }) => {
                      const active = isActive(path, href);
                      const n = counts[href] ?? 0;
                      return (
                        <li key={href}>
                          <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                            className={cn("group relative flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-[13px] font-semibold transition-colors", active ? "text-ivory" : "text-ivory/70 hover:text-ivory")}>
                            {active && <motion.span layoutId="adm-pill" className="absolute inset-0 rounded-lg bg-ivory/10 shadow-[inset_0_0_0_1px_rgb(248_246_239/0.1)]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                            {!active && <span aria-hidden className="absolute inset-0 rounded-lg bg-ivory/0 transition-colors group-hover:bg-ivory/5" />}
                            {active && <motion.span layoutId="adm-bar" aria-hidden className="absolute -left-3 top-2 h-6 w-[3px] rounded-r-full bg-gold" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                            <Icon className={cn("relative h-4 w-4 shrink-0 transition-colors", active && "text-gold")} aria-hidden />
                            <span className="relative flex-1">{label}</span>
                            <span className="relative"><CountBadge n={n} /></span>
                            {n > 0 && <span className="sr-only">{n} {href === "/admin/chits" ? "pending approval" : "session entries"}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </LayoutGroup>
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

/** Soft ambient glow so the navy sidebar is not flat. */
const sidebarGlow = { backgroundImage: "radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--emerald-700) 28%, transparent), transparent 60%), radial-gradient(100% 50% at 100% 100%, color-mix(in srgb, var(--gold) 7%, transparent), transparent 60%)" } as const;

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { signOut } = useDemoAuth();
  const { role, setRole } = useActingAs();
  const { setCreateIntent } = useAdminState();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const leaving = useRef(false);
  const signOutRef = useRef(signOut);
  useEffect(() => { signOutRef.current = signOut; }, [signOut]);
  // Clear the demo session only after the admin shell has unmounted, so the
  // route guard cannot redirect to /login while we navigate home.
  useEffect(() => () => { if (leaving.current) signOutRef.current(); }, []);
  const current = allItems.find((i) => isActive(path, i.href));
  const togglePalette = useCallback(() => setPalette((p) => !p), []);
  useCommandKey(togglePalette);

  const items = useMemo<PaletteItem[]>(() => {
    const go = (href: string) => () => router.push(href);
    const pages: PaletteItem[] = allItems.map((i) => ({ id: `go-${i.href}`, label: i.label, group: "Go to", icon: i.icon, hint: i.href, keywords: "page open navigate", run: go(i.href) }));
    const actions: PaletteItem[] = [
      { id: "act-draft", label: "Create draft scheme", group: "Quick actions", icon: Plus, keywords: "new scheme chit add", run: () => { setCreateIntent(true); router.push("/admin/chits"); } },
      { id: "act-payouts", label: "Review payouts awaiting approval", group: "Quick actions", icon: Banknote, keywords: "checker approve payout", run: go("/admin/payouts") },
      { id: "act-recon", label: "Open reconciliation exceptions", group: "Quick actions", icon: Scale, keywords: "mismatch exception", run: go("/admin/reconciliation") },
      { id: "act-maker", label: "Switch to Maker (demo)", group: "Acting as", icon: Pencil, keywords: "role maker", run: () => { setRole("Maker"); toast("Now acting as Maker (demo)."); } },
      { id: "act-checker", label: "Switch to Checker (demo)", group: "Acting as", icon: ShieldCheck, keywords: "role checker", run: () => { setRole("Checker"); toast("Now acting as Checker (demo)."); } },
      { id: "act-site", label: "Open public website", group: "Session", icon: Globe, keywords: "home site", run: go("/") },
      { id: "act-out", label: "Sign out", group: "Session", icon: LogOut, keywords: "logout exit", run: () => { leaving.current = true; router.push("/"); } },
    ];
    return [...pages, ...actions];
  }, [router, setCreateIntent, setRole, toast]);

  return (
    <div className="min-h-dvh bg-ivory">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">Skip to main content</a>
      <DemoBanner />
      <div className="flex">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-navy text-ivory lg:flex" style={sidebarGlow} aria-label="Sidebar">
          <SidebarBrand />
          <NavList pillId="side" />
        </aside>

        <SideSheet open={open} onOpenChange={setOpen} title="Administration menu" description="Navigate between administration pages" side="left" className="bg-navy text-ivory" closeClassName="text-ivory/80 hover:bg-ivory/10">
          <div className="flex h-full flex-col" style={sidebarGlow}>
            <SidebarBrand />
            <NavList onNavigate={() => setOpen(false)} pillId="sheet" />
            <div className="border-t border-ivory/10 p-3"><button type="button" onClick={() => { setOpen(false); leaving.current = true; router.push("/"); }} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-[13px] font-semibold text-ivory/75 hover:bg-ivory/5 hover:text-ivory"><LogOut className="h-4 w-4" aria-hidden />Sign out</button></div>
          </div>
        </SideSheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line/70 bg-white/85 px-3 py-2 backdrop-blur-xl sm:px-5 md:h-14 md:flex-nowrap md:py-0">
            <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-navy hover:bg-navy/5 lg:hidden" aria-label="Open menu" aria-haspopup="dialog"><Menu className="h-5 w-5" /></button>
            <p className="min-w-0 truncate text-sm font-bold text-navy lg:min-w-32">{current?.label ?? "Admin"}</p>
            <button type="button" onClick={() => setPalette(true)} aria-haspopup="dialog" aria-label="Search pages and run commands"
              className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg border border-line bg-ivory/70 px-2.5 text-sm text-muted transition-colors hover:border-navy/40 hover:text-ink md:ml-2 md:w-64 md:flex-none">
              <Search className="h-4 w-4 shrink-0" aria-hidden /><span className="hidden flex-1 whitespace-nowrap text-left md:block">Search or run…</span><span className="hidden md:block"><ShortcutHint className="border-line text-muted" /></span>
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-gold px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy md:ml-auto"><PulseDot className="text-navy" />Demo mode</span>
            <div className="order-last flex w-full items-center justify-between gap-2 md:order-none md:w-auto md:justify-start">
              <ActingAsSwitch />
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy/10 px-2.5 py-1.5 text-xs font-semibold text-navy" title={`Acting as ${role}`}>
                <UserCircle2 className="h-4 w-4" aria-hidden />Demo admin
              </span>
            </div>
            <button type="button" onClick={() => { leaving.current = true; router.push("/"); }} className="hidden min-h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5 md:inline-flex">
              <LogOut className="h-4 w-4" aria-hidden />Sign out
            </button>
          </div>
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-3 py-5 text-sm focus:outline-none sm:px-5 lg:px-6"><PageTransition>{children}</PageTransition></main>
        </div>
      </div>
      <CommandPalette open={palette} onOpenChange={setPalette} items={items} placeholder="Jump to a page or run a command…" title="Command palette" accent="navy" />
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
