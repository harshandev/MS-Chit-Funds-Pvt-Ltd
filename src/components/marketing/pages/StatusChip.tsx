"use client";
import { Badge } from "@/components/ui/Badge";
import { useTr } from "@/i18n/LanguageProvider";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";
const tones: Record<string, Tone> = {
  Active: "success", Verified: "success", Approved: "success",
  "Commencement Pending": "warning", "Under review": "warning", "Under Review": "warning", "In progress": "warning", "Action required": "warning",
  Rejected: "danger", Failed: "danger",
  "Not started": "neutral",
};

/** Status badge whose text is translated (same look as ui/StatusBadge). */
export function StatusChip({ status }: { status: string }) {
  const tr = useTr();
  return <Badge tone={tones[status] ?? "neutral"}>{tr(status)}</Badge>;
}
