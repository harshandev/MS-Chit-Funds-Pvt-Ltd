"use client";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";
const tones: Record<Tone, string> = {
  neutral: "bg-line/60 text-ink",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-navy/10 text-navy",
  gold: "bg-gold/20 text-[#7a5f00]",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-current/10", tones[tone], className)}>{children}</span>;
}

const map: Record<string, Tone> = {
  Active: "success", Verified: "success", Successful: "success", Matched: "success", "Result published": "success", Approved: "success", "Approved (simulated)": "success", Resolved: "success", "Evidence attached": "success",
  Pending: "warning", "In progress": "warning", "Under review": "warning", "Under reconciliation": "warning", "Result pending verification": "warning", "Commencement Pending": "warning", "Action required": "warning", "Due soon": "warning", "Awaiting checker": "warning", "Awaiting maker": "warning", "Awaiting customer": "warning", "Enrolment pending": "warning", Open: "info", Scheduled: "info", Rescheduled: "info", "In review": "warning",
  Failed: "danger", Rejected: "danger", Suspended: "danger", Cancelled: "danger", "Evidence missing": "danger", "Amount mismatch": "danger", "Missing in bank": "danger", "Missing in ledger": "danger", "Missing in gateway": "danger",
  Draft: "neutral", "Not started": "neutral", Closed: "neutral", Refunded: "neutral", Prized: "gold",
};
/** Consistent colour for any status string used in the app. */
export function StatusBadge({ status }: { status: string }) {
  const tr = useTr();
  return <Badge tone={map[status] ?? "neutral"}>{tr(status)}</Badge>;
}
