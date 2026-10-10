import { computeBreakdown } from "@/lib/chit";
import type { Auction, Membership, Payment } from "@/data/types";
import type { Paise } from "@/lib/money";
import { schemeFor, type Snapshot } from "./DashboardData";

export interface PendingAction { id: string; label: string; detail: string; href: string }

export interface Summary {
  liable: Membership[];
  activeCount: number;
  nextDueDate: string | null;
  nextDueAmount: Paise;
  nextDueCount: number;
  totalContributions: Paise;
  successfulCount: number;
  dividends: Paise;
  prizeText: string;
  upcomingAuction: Auction | null;
  pendingActions: PendingAction[];
  reconCount: number;
}

/** Memberships that carry instalment obligations. */
export const isLiable = (m: Membership) => m.status === "Active" || m.status === "Prized";

export const nextInstalmentNo = (m: Membership) => m.currentInstalment + 1;

export function dividendFor(d: Snapshot, m: Membership): Paise {
  const s = schemeFor(d, m.schemeId);
  if (!s || m.status === "Enrolment pending") return 0;
  if (m.status === "Prized" && !s.rules.prizedReceivesDividend) return 0;
  return d.auctions
    .filter((a) => a.schemeId === m.schemeId && a.state === "Result published" && a.discountBps != null && a.instalmentNo <= m.currentInstalment && a.winningTicket !== m.ticketNo)
    .reduce((sum, a) => sum + computeBreakdown(s.rules, a.discountBps ?? 0, a.instalmentNo).dividendPerTicket, 0);
}

export const sumSuccessful = (payments: Payment[]): Paise =>
  payments.filter((p) => p.status === "Successful").reduce((s, p) => s + p.amount, 0);

type Tr = (en: string, vars?: Record<string, string | number>) => string;

/** `tr` translates the generated sentences; defaults to English. */
export function computeSummary(d: Snapshot, tr: Tr = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (_, k) => String(v[k])) : s)): Summary {
  const liable = d.memberships.filter(isLiable);
  const dated = liable.filter((m) => m.nextDue).map((m) => m.nextDue).sort();
  const nextDueDate = dated[0] ?? null;
  const dueNow = nextDueDate ? liable.filter((m) => m.nextDue === nextDueDate) : [];
  const nextDueAmount = dueNow.reduce((s, m) => s + (schemeFor(d, m.schemeId)?.rules.instalment ?? 0), 0);

  const prized = liable.filter((m) => m.status === "Prized").length;
  const prizeText = liable.length === 0 ? tr("No active ticket") : prized === 0 ? tr("Not yet prized") : tr("{n} of {m} prized (demo)", { n: prized, m: liable.length });

  const liableSchemes = new Set(liable.map((m) => m.schemeId));
  const candidates = d.auctions.filter((a) => liableSchemes.has(a.schemeId) && (a.state === "Open" || a.state === "Scheduled"));
  candidates.sort((a, b) => (a.state === b.state ? a.scheduledAt.localeCompare(b.scheduledAt) : a.state === "Open" ? -1 : 1));

  const recon = d.payments.filter((p) => p.status === "Under reconciliation");
  const pendingActions: PendingAction[] = [
    ...d.notifications.filter((n) => !n.read).map((n) => ({ id: `n-${n.id}`, label: tr(n.title), detail: tr("Unread {cat} notification", { cat: tr(n.category).toLowerCase() }), href: n.href })),
    ...(d.customer.kyc === "Action required" ? [{ id: "kyc", label: tr("Complete KYC verification"), detail: tr("KYC status: Action required"), href: "/dashboard/profile" }] : []),
    ...recon.map((p) => ({ id: `r-${p.id}`, label: tr("Payment {ref} is under reconciliation", { ref: p.reference }), detail: tr("No action needed unless it stays unresolved; contact support if so"), href: "/dashboard/payments" })),
  ];

  return {
    liable,
    activeCount: liable.length,
    nextDueDate,
    nextDueAmount,
    nextDueCount: dueNow.length,
    totalContributions: sumSuccessful(d.payments),
    successfulCount: d.payments.filter((p) => p.status === "Successful").length,
    dividends: liable.reduce((s, m) => s + dividendFor(d, m), 0),
    prizeText,
    upcomingAuction: candidates[0] ?? null,
    pendingActions,
    reconCount: recon.length,
  };
}

/** Cumulative Successful contributions (rupees) ordered by instalment number; real data only. */
export function contributionSeries(payments: Payment[]): number[] {
  const byNo = new Map<number, number>();
  for (const p of payments) if (p.status === "Successful") byNo.set(p.instalmentNo, (byNo.get(p.instalmentNo) ?? 0) + p.amount / 100);
  let run = 0;
  return [...byNo.entries()].sort(([a], [b]) => a - b).map(([, v]) => (run += v));
}

/** Cumulative illustrative dividends by instalment number (same rules as dividendFor). */
export function dividendSeries(d: Snapshot): number[] {
  const byNo = new Map<number, number>();
  for (const m of d.memberships.filter(isLiable)) {
    const s = schemeFor(d, m.schemeId);
    if (!s || m.status === "Enrolment pending" || (m.status === "Prized" && !s.rules.prizedReceivesDividend)) continue;
    for (const a of d.auctions) {
      if (a.schemeId !== m.schemeId || a.state !== "Result published" || a.discountBps == null || a.instalmentNo > m.currentInstalment || a.winningTicket === m.ticketNo) continue;
      byNo.set(a.instalmentNo, (byNo.get(a.instalmentNo) ?? 0) + computeBreakdown(s.rules, a.discountBps, a.instalmentNo).dividendPerTicket / 100);
    }
  }
  let run = 0;
  return [...byNo.entries()].sort(([a], [b]) => a - b).map(([, v]) => (run += v));
}
