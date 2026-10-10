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

export function computeSummary(d: Snapshot): Summary {
  const liable = d.memberships.filter(isLiable);
  const dated = liable.filter((m) => m.nextDue).map((m) => m.nextDue).sort();
  const nextDueDate = dated[0] ?? null;
  const dueNow = nextDueDate ? liable.filter((m) => m.nextDue === nextDueDate) : [];
  const nextDueAmount = dueNow.reduce((s, m) => s + (schemeFor(d, m.schemeId)?.rules.instalment ?? 0), 0);

  const prized = liable.filter((m) => m.status === "Prized").length;
  const prizeText = liable.length === 0 ? "No active ticket" : prized === 0 ? "Not yet prized" : `${prized} of ${liable.length} prized (demo)`;

  const liableSchemes = new Set(liable.map((m) => m.schemeId));
  const candidates = d.auctions.filter((a) => liableSchemes.has(a.schemeId) && (a.state === "Open" || a.state === "Scheduled"));
  candidates.sort((a, b) => (a.state === b.state ? a.scheduledAt.localeCompare(b.scheduledAt) : a.state === "Open" ? -1 : 1));

  const recon = d.payments.filter((p) => p.status === "Under reconciliation");
  const pendingActions: PendingAction[] = [
    ...d.notifications.filter((n) => !n.read).map((n) => ({ id: `n-${n.id}`, label: n.title, detail: `Unread ${n.category.toLowerCase()} notification`, href: n.href })),
    ...(d.customer.kyc === "Action required" ? [{ id: "kyc", label: "Complete KYC verification", detail: "KYC status: Action required", href: "/dashboard/profile" }] : []),
    ...recon.map((p) => ({ id: `r-${p.id}`, label: `Payment ${p.reference} is under reconciliation`, detail: "No action needed unless it stays unresolved; contact support if so", href: "/dashboard/payments" })),
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
