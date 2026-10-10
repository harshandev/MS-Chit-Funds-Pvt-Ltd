"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  LayoutDashboard, Layers, CreditCard, Gavel, FileText, Bell, LifeBuoy, UserCircle, LogOut, Menu, Search, PanelLeftClose, PanelLeftOpen, CheckCheck, Plus, Home, MessageSquarePlus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useLang } from "@/i18n/LanguageProvider";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { CommandPalette, ShortcutHint, useCommandKey, type PaletteItem } from "@/components/ui/CommandPalette";
import { SideSheet } from "@/components/ui/SideSheet";
import { PageTransition } from "@/components/motion/PageTransition";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { useDemoAuth } from "@/lib/demoAuth";
import { useToast } from "@/components/ui/Toast";
import { DashboardDataProvider, useDashboard, schemeFor } from "./DashboardData";
import { computeSummary } from "./summary";
import { greeting } from "./format";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/my-chits", label: "My Chits", icon: Layers },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/auctions", label: "Auctions", icon: Gavel },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: true },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/profile", label: "Profile & KYC", icon: UserCircle },
] as const;
const tabs = nav.slice(0, 4);

const isActive = (path: string, n: (typeof nav)[number]) => ("exact" in n && n.exact ? path === n.href : path === n.href || path.startsWith(`${n.href}/`));

const dateFmts = { en: new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }), ta: new Intl.DateTimeFormat("ta-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }) };

function UnreadBadge({ count, className }: { count: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <motion.span key="b" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className={cn("flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold tabular-nums text-navy", className)} aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={count} initial={reduce ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }}>{count}</motion.span>
          </AnimatePresence>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function NavList({ onNavigate, unread, collapsed, pillId }: { onNavigate?: () => void; unread: number; collapsed?: boolean; pillId: string }) {
  const path = usePathname();
  const { tr } = useLang();
  return (
    <nav aria-label={tr("Customer navigation")}>
      <LayoutGroup id={pillId}>
        <ul className="space-y-1">
          {nav.map((n) => {
            const active = isActive(path, n);
            const Icon = n.icon;
            return (
              <li key={n.href}>
                <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined} aria-label={collapsed ? tr(n.label) : undefined} title={collapsed ? tr(n.label) : undefined}
                  className={cn("group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", collapsed && "justify-center px-0", active ? "text-gold" : "text-ivory/75 hover:text-ivory")}>
                  {active && <motion.span layoutId="dash-pill" className="absolute inset-0 rounded-xl bg-ivory/12 shadow-[inset_0_0_0_1px_rgb(248_246_239/0.12)]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                  {!active && <span aria-hidden className="absolute inset-0 rounded-xl bg-ivory/0 transition-colors group-hover:bg-ivory/6" />}
                  {active && <motion.span layoutId="dash-bar" aria-hidden className="absolute -left-4 top-2.5 h-6 w-1 rounded-r-full bg-gold" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                  <span className="relative"><Icon className="h-5 w-5 shrink-0" aria-hidden />{collapsed && "badge" in n && n.badge && <UnreadBadge count={unread} className="absolute -right-2 -top-2" />}</span>
                  {!collapsed && <span className="relative min-w-0 flex-1 truncate">{tr(n.label)}</span>}
                  {!collapsed && "badge" in n && n.badge && <span className="relative"><UnreadBadge count={unread} /></span>}
                  {!collapsed && "badge" in n && n.badge && unread > 0 && <span className="sr-only">{tr("{n} unread", { n: unread })}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}

function SignOut({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  const { signOut } = useDemoAuth();
  const router = useRouter();
  const { tr } = useLang();
  return (
    <button type="button" onClick={() => { signOut(); router.push("/"); }} aria-label={collapsed ? tr("Sign out") : undefined} title={collapsed ? tr("Sign out") : undefined}
      className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ivory/75 transition-colors hover:bg-ivory/8 hover:text-ivory", collapsed && "justify-center px-0", className)}>
      <LogOut className="h-5 w-5 shrink-0" aria-hidden />{!collapsed && <span className="min-w-0 truncate">{tr("Sign out")}</span>}
    </button>
  );
}

function SidebarBackdrop() {
  return (
    <>
      <div aria-hidden className="aurora pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-700/45 blur-3xl" />
      <div aria-hidden className="aurora pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl [animation-delay:-6s]" />
    </>
  );
}

function initials(name?: string) {
  if (!name) return "…";
  const parts = name.replace("Demo ", "").split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const { tr, lang } = useLang();
  const { signOut } = useDemoAuth();
  const { data, unreadCount, markAllRead, setPayIntent } = useDashboard();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const current = nav.find((n) => isActive(path, n));
  const name = data?.customer.name;
  const togglePalette = useCallback(() => setPalette((p) => !p), []);
  useCommandKey(togglePalette);

  const items = useMemo<PaletteItem[]>(() => {
    const go = (href: string) => () => router.push(href);
    const pages: PaletteItem[] = nav.map((n) => ({ id: `go-${n.href}`, label: tr(n.label), group: tr("Go to"), icon: n.icon, hint: n.href, keywords: "page open navigate", run: go(n.href) }));
    const actions: PaletteItem[] = [
      { id: "act-pay", label: tr("Pay an instalment (simulated)"), group: tr("Quick actions"), icon: Plus, keywords: "payment pay due instalment", run: () => { setPayIntent(true); router.push("/dashboard/payments"); } },
      { id: "act-ticket", label: tr("Raise a support ticket"), group: tr("Quick actions"), icon: MessageSquarePlus, keywords: "help complaint query", run: go("/dashboard/support") },
      { id: "act-read", label: tr("Mark all notifications read"), group: tr("Quick actions"), icon: CheckCheck, keywords: "clear unread", run: () => { markAllRead(); toast(tr("All notifications marked read (local to this demo session).")); } },
      { id: "act-home", label: tr("Back to public website"), group: tr("Quick actions"), icon: Home, keywords: "home site", run: go("/") },
      { id: "act-out", label: tr("Sign out"), group: tr("Quick actions"), icon: LogOut, keywords: "logout exit", run: () => { signOut(); router.push("/"); } },
    ];
    const ua = data ? computeSummary(data, tr).upcomingAuction : null;
    const dyn: PaletteItem[] = [];
    if (data && ua) dyn.push({ id: "dyn-auction", label: tr(ua.state === "Open" ? "Open auction — instalment {n}" : "Next auction — instalment {n}", { n: ua.instalmentNo }), group: tr("Your data"), icon: Gavel, hint: tr(schemeFor(data, ua.schemeId)?.name ?? ""), run: go(`/dashboard/auctions/${ua.id}`) });
    if (data) for (const m of data.memberships) { const s = schemeFor(data, m.schemeId); if (s) dyn.push({ id: `dyn-${m.id}`, label: tr("{name} · ticket {n}", { name: tr(s.name), n: m.ticketNo }), group: tr("Your data"), icon: Layers, keywords: "chit membership", run: go(`/dashboard/my-chits/${m.id}`) }); }
    return [...pages, ...actions, ...dyn];
  }, [router, data, markAllRead, setPayIntent, signOut, toast, tr]);

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">{tr("Skip to content")}</a>
      <DemoBanner />
      <div className="flex flex-1">
        <motion.aside
          initial={false} animate={{ width: collapsed ? 84 : 264 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 34 }}
          className="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden bg-linear-to-b from-emerald-900 via-emerald to-emerald-950 px-4 py-6 lg:flex" aria-label={tr("Sidebar")}>
          <SidebarBackdrop />
          <div className={cn("relative mb-8 flex items-center", collapsed ? "justify-center" : "justify-between px-1")}>
            <Link href="/dashboard" aria-label={tr("MS Chit Funds customer dashboard home")}>{collapsed ? <LogoMark tone="dark" className="h-10 w-10" /> : <Logo tone="dark" />}</Link>
          </div>
          <div className="relative flex-1 overflow-y-auto overflow-x-hidden"><NavList unread={unreadCount} collapsed={collapsed} pillId="rail" /></div>
          <div className="relative mt-4 space-y-1 border-t border-ivory/10 pt-4">
            <button type="button" onClick={() => setCollapsed((c) => !c)} aria-pressed={collapsed} aria-label={collapsed ? tr("Expand sidebar") : tr("Collapse sidebar")}
              className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ivory/75 transition-colors hover:bg-ivory/8 hover:text-ivory", collapsed && "justify-center px-0")}>
              {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden /> : <PanelLeftClose className="h-5 w-5" aria-hidden />}{!collapsed && tr("Collapse")}
            </button>
            <SignOut collapsed={collapsed} />
          </div>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-line/70 bg-ivory/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <button type="button" onClick={() => setOpen(true)} className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-emerald hover:bg-emerald-50 lg:hidden" aria-label={tr("Open navigation menu")}>
              <Menu className="h-6 w-6" />
            </button>
            <span className="lg:hidden"><Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:block" /></span>
            <div className="hidden min-w-0 lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-antique">{tr(current?.label ?? "Dashboard")}</p>
              <p className="truncate text-sm font-semibold text-ink">{data ? `${tr(greeting())}, ${name?.replace("Demo ", "")} · ${dateFmts[lang].format(new Date())}` : tr("Loading…")}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button type="button" onClick={() => setPalette(true)} aria-label={tr("Search pages and actions")} aria-haspopup="dialog"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white/80 px-3 text-sm text-muted shadow-[var(--shadow-1)] transition-colors hover:border-emerald/50 hover:text-ink sm:w-60">
                <Search className="h-4 w-4 shrink-0" aria-hidden /><span className="hidden min-w-0 flex-1 truncate text-left sm:block">{tr("Search or jump to…")}</span><span className="hidden sm:block"><ShortcutHint className="border-line text-muted" /></span>
              </button>
              <Link href="/dashboard/notifications" className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-emerald transition-colors hover:bg-emerald-50" aria-label={tr("Notifications, {n} unread", { n: unreadCount })}>
                <motion.span key={unreadCount} initial={false} animate={reduce || unreadCount === 0 ? {} : { rotate: [0, -16, 14, -10, 6, 0] }} transition={{ duration: 0.7 }} className="inline-flex origin-top"><Bell className="h-5 w-5" aria-hidden /></motion.span>
                <UnreadBadge count={unreadCount} className="absolute right-1 top-1" />
              </Link>
              <Link href="/dashboard/profile" className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-sm font-semibold text-ink shadow-[var(--shadow-1)] transition-colors hover:border-emerald">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-emerald to-emerald-700 text-xs font-bold text-gold" aria-hidden>{initials(name)}</span>
                <span className="hidden max-w-40 truncate sm:inline">{name ?? tr("Loading…")}</span>
              </Link>
            </div>
          </header>
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-32 focus:outline-none sm:px-6 lg:px-8 lg:pb-10"><PageTransition>{children}</PageTransition></main>
        </div>
      </div>

      <nav aria-label={tr("Quick navigation")} className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line/80 bg-white/90 px-1 pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-3)] backdrop-blur-xl lg:hidden">
        <LayoutGroup id="tabbar">
          <ul className="grid grid-cols-5">
            {tabs.map((n) => {
              const active = isActive(path, n);
              const Icon = n.icon;
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[11px] font-semibold leading-tight transition-colors", active ? "text-emerald" : "text-muted")}>
                    {active && <motion.span layoutId="tab-ind" className="absolute inset-x-2 inset-y-1.5 rounded-xl bg-emerald-50" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    {active && <motion.span layoutId="tab-dot" aria-hidden className="absolute top-0.5 h-1 w-6 rounded-full bg-gold" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <Icon className="relative h-5 w-5" aria-hidden /><span className="relative max-w-full truncate">{tr(n.label)}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-0.5 text-[11px] font-semibold leading-tight text-muted">
                <span className="relative"><Menu className="h-5 w-5" aria-hidden /><UnreadBadge count={unreadCount} className="absolute -right-2 -top-1.5" /></span>{tr("More")}
              </button>
            </li>
          </ul>
        </LayoutGroup>
      </nav>

      <SideSheet open={open} onOpenChange={setOpen} title={tr("Menu")} description={tr("Navigate your customer dashboard")} side="left" className="overflow-hidden bg-linear-to-b from-emerald-900 via-emerald to-emerald-950" closeClassName="text-ivory/80 hover:bg-ivory/10">
        <SidebarBackdrop />
        <div className="relative flex h-full flex-col p-4">
          <div className="mb-6 px-1 pt-1"><Logo tone="dark" /></div>
          <div className="flex-1 overflow-y-auto"><NavList unread={unreadCount} onNavigate={() => setOpen(false)} pillId="drawer" /></div>
          <div className="mt-4 border-t border-ivory/10 pt-4"><SignOut /></div>
        </div>
      </SideSheet>

      <CommandPalette open={palette} onOpenChange={setPalette} items={items} placeholder={tr("Jump to a page or run an action…")} title={tr("Quick search")} accent="emerald" />
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return <DashboardDataProvider><Shell>{children}</Shell></DashboardDataProvider>;
}
