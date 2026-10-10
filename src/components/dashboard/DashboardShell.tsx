"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Layers, CreditCard, Gavel, FileText, Bell, LifeBuoy, UserCircle, LogOut, Menu,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { Dialog } from "@/components/ui/Dialog";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { useDemoAuth } from "@/lib/demoAuth";
import { DashboardDataProvider, useDashboard } from "./DashboardData";

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

function NavList({ onNavigate, unread }: { onNavigate?: () => void; unread: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Customer navigation">
      <ul className="space-y-1">
        {nav.map((n) => {
          const active = isActive(path, n);
          const Icon = n.icon;
          return (
            <li key={n.href}>
              <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                  active ? "bg-ivory/10 text-gold shadow-[inset_3px_0_0_var(--gold)]" : "text-ivory/80 hover:bg-ivory/5 hover:text-ivory")}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="flex-1">{n.label}</span>
                {"badge" in n && n.badge && unread > 0 && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy" aria-label={`${unread} unread`}>{unread}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SignOut({ className }: { className?: string }) {
  const { signOut } = useDemoAuth();
  const router = useRouter();
  return (
    <button type="button" onClick={() => { signOut(); router.push("/"); }}
      className={cn("flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-ivory/80 hover:bg-ivory/5 hover:text-ivory", className)}>
      <LogOut className="h-5 w-5" aria-hidden />Sign out
    </button>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { data, unreadCount } = useDashboard();
  const [open, setOpen] = useState(false);
  const current = nav.find((n) => isActive(path, n));
  const name = data?.customer.name;

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">Skip to content</a>
      <DemoBanner />
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-emerald px-4 py-6 lg:flex">
          <Link href="/dashboard" className="mb-8 px-1" aria-label="MS Chit Funds customer dashboard home"><Logo tone="dark" /></Link>
          <div className="flex-1 overflow-y-auto"><NavList unread={unreadCount} /></div>
          <div className="mt-4 border-t border-ivory/10 pt-4"><SignOut /></div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-line bg-ivory/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <button type="button" onClick={() => setOpen(true)} className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-emerald hover:bg-emerald-50 lg:hidden" aria-label="Open navigation menu">
              <Menu className="h-6 w-6" />
            </button>
            <span className="lg:hidden"><Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:block" /></span>
            <p className="hidden text-sm font-semibold text-muted lg:block">{current?.label ?? "Dashboard"}</p>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/dashboard/notifications" className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-emerald hover:bg-emerald-50" aria-label={`Notifications, ${unreadCount} unread`}>
                <Bell className="h-5 w-5" aria-hidden />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy">{unreadCount}</span>}
              </Link>
              <Link href="/dashboard/profile" className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-sm font-semibold text-ink hover:border-emerald">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-xs font-bold text-gold" aria-hidden>{name ? name.replace("Demo ", "").slice(0, 1) + (name.split(" ").pop()?.slice(0, 1) ?? "") : "…"}</span>
                <span className="hidden max-w-40 truncate sm:inline">{name ?? "Loading…"}</span>
              </Link>
            </div>
          </header>
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
        </div>
      </div>

      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {tabs.map((n) => {
            const active = isActive(path, n);
            const Icon = n.icon;
            return (
              <li key={n.href}>
                <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold", active ? "text-emerald shadow-[inset_0_2px_0_var(--gold)]" : "text-muted")}>
                  <Icon className="h-5 w-5" aria-hidden />{n.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setOpen(true)} className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted">
              <Menu className="h-5 w-5" aria-hidden />More
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={open} onOpenChange={setOpen} variant="drawer" title="Menu" description="Navigate your customer dashboard">
        <div className="-m-5 min-h-full bg-emerald p-4">
          <NavList unread={unreadCount} onNavigate={() => setOpen(false)} />
          <div className="mt-4 border-t border-ivory/10 pt-4"><SignOut /></div>
        </div>
      </Dialog>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return <DashboardDataProvider><Shell>{children}</Shell></DashboardDataProvider>;
}
