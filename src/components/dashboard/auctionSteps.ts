import type { AuctionState } from "@/data/types";
import type { Step } from "@/components/ui/StepTracker";

const order: { state: AuctionState; label: string; short: string }[] = [
  { state: "Scheduled", label: "Scheduled", short: "Sched." },
  { state: "Open", label: "Open", short: "Open" },
  { state: "Closed", label: "Closed", short: "Closed" },
  { state: "Result pending verification", label: "Pending verification", short: "Verify" },
  { state: "Result published", label: "Published", short: "Published" },
];

/** Lifecycle track for an auction state; null for Cancelled / Rescheduled (off the normal path). */
export function auctionSteps(state: AuctionState): Step[] | null {
  const idx = order.findIndex((o) => o.state === state);
  if (idx < 0) return null;
  return order.map((o, i) => ({ label: o.label, short: o.short, state: i < idx || (i === idx && idx === order.length - 1) ? "done" : i === idx ? "current" : "todo" }));
}
