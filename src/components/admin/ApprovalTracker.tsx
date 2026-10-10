"use client";
import { StepTracker, type Step } from "@/components/ui/StepTracker";
import type { Payout } from "@/data/types";
import type { SchemeRequest } from "./AdminState";

/** Request → Maker → Checker → Effective / Blocked, derived from the real (local, simulated) request state. */
export function requestSteps(r: SchemeRequest): Step[] {
  const pending = r.state === "Pending approval";
  const effective: Step =
    r.state === "Approved (simulated)" ? { label: "Effective", state: "done", tag: "Simulated" }
    : r.state === "Blocked: evidence missing" ? { label: "Blocked", short: "Blocked", state: "blocked", note: "Evidence missing" }
    : r.state === "Rejected" ? { label: "Not applied", short: "Rejected", state: "blocked", note: "Rejected by checker" }
    : { label: "Effective", state: "todo" };
  return [
    { label: "Request", state: "done" },
    { label: `Maker (${r.raisedBy})`, short: "Maker", state: "done" },
    { label: "Checker", state: pending ? "current" : r.state === "Rejected" ? "blocked" : "done", note: r.decidedBy ? `${r.decidedBy} decided` : "Awaiting decision" },
    effective,
  ];
}

export function payoutSteps(status: Payout["status"]): Step[] {
  const afterMaker = status !== "Awaiting maker";
  const checked = status === "Approved (simulated)" || status === "Failed";
  return [
    { label: "Request", state: "done" },
    { label: "Maker", state: afterMaker ? "done" : "current" },
    { label: "Checker", state: status === "Awaiting checker" ? "current" : status === "Rejected" ? "blocked" : checked ? "done" : "todo" },
    status === "Approved (simulated)" ? { label: "Effective", state: "done", tag: "Simulated" }
      : status === "Failed" ? { label: "Failed", state: "blocked", note: "Not paid" }
      : status === "Rejected" ? { label: "Not paid", state: "blocked" }
      : { label: "Effective", state: "todo" },
  ];
}

export function RequestTracker({ request, compact = true }: { request: SchemeRequest; compact?: boolean }) {
  return <StepTracker steps={requestSteps(request)} label={`Approval progress for ${request.from} to ${request.to}`} compact={compact} tone="navy" className="min-w-[15rem]" />;
}
export function PayoutTracker({ id, status }: { id: string; status: Payout["status"] }) {
  return <StepTracker steps={payoutSteps(status)} label={`Approval progress for payout ${id}`} compact tone="navy" className="min-w-[15rem]" />;
}
