import type { AuctionState } from "@/data/types";
import type { Step } from "@/components/ui/StepTracker";

const order: { state: AuctionState; label: string; short: string }[] = [
  { state: "Scheduled", label: "Scheduled", short: "Sched." },
  { state: "Open", label: "Open", short: "Live" },
  { state: "Closed", label: "Closed", short: "Ended" },
  { state: "Result pending verification", label: "Pending verification", short: "Verify" },
  { state: "Result published", label: "Published", short: "Result" },
];

/** Lifecycle track for an auction state; null for Cancelled / Rescheduled (off the normal path). */
export function auctionSteps(state: AuctionState, tr: (s: string) => string = (s) => s): Step[] | null {
  const idx = order.findIndex((o) => o.state === state);
  if (idx < 0) return null;
  return order.map((o, i) => ({ label: tr(o.label), short: tr(o.short), state: i < idx || (i === idx && idx === order.length - 1) ? "done" : i === idx ? "current" : "todo" }));
}
