"use client";
/**
 * Session-local admin state (audit trail + scheme workflow). Lives in memory
 * only: it resets on reload and is never sent anywhere. In production the
 * audit trail is an append-only, tamper-evident, SERVER-SIDE log and approvals
 * are enforced by the backend, not by the browser.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuditLog, Scheme, SchemeStatus } from "@/data/types";
import { useActingAs, type ActingRole } from "./ActingAs";

export interface SessionAudit extends AuditLog { source: "session" }
export type AuditInput = { action: string; entity: string; previous?: string; next?: string; reason: string; approvalRef?: string | null };

export type RequestState = "Pending approval" | "Approved (simulated)" | "Blocked: evidence missing" | "Rejected";
export interface SchemeRequest {
  id: string;
  schemeId: string;
  from: SchemeStatus;
  to: SchemeStatus;
  reason: string;
  raisedBy: ActingRole;
  raisedAt: string;
  state: RequestState;
  decidedBy?: ActingRole;
  decidedAt?: string;
  decisionNote?: string;
}

/** Allowed lifecycle transitions (requests only; nothing is applied directly). */
export const schemeTransitions: Record<SchemeStatus, SchemeStatus[]> = {
  Draft: ["Under Review", "Closed"],
  "Under Review": ["Approved", "Draft", "Closed"],
  Approved: ["Commencement Pending", "Closed"],
  "Commencement Pending": ["Active", "Approved"],
  Active: ["Suspended", "Closed"],
  Suspended: ["Active", "Closed"],
  Closed: [],
};
export const schemeStatuses: SchemeStatus[] = ["Draft", "Under Review", "Approved", "Commencement Pending", "Active", "Suspended", "Closed"];

type SchemePatch = Partial<Pick<Scheme, "name" | "rules" | "summary">>;
export type Result = { ok: boolean; message: string };

interface Value {
  audit: SessionAudit[];
  addAudit: (e: AuditInput) => void;
  createdSchemes: Scheme[];
  addDraftScheme: (s: Scheme) => void;
  patchScheme: (id: string, p: SchemePatch) => void;
  /** Overlay local drafts, patches and simulated status changes on base schemes. */
  applyLocal: (base: Scheme[]) => Scheme[];
  requests: SchemeRequest[];
  raiseRequest: (schemeId: string, from: SchemeStatus, to: SchemeStatus, reason: string) => void;
  decideRequest: (id: string, decision: "approve" | "reject", note: string) => Result;
}

const Ctx = createContext<Value | null>(null);
export function useAdminState(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminState must be used inside AdminStateProvider");
  return v;
}

let seq = 0;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq += 1)}`;

export function AdminStateProvider({ children }: { children: ReactNode }) {
  const { role, actor } = useActingAs();
  const [audit, setAudit] = useState<SessionAudit[]>([]);
  const [createdSchemes, setCreated] = useState<Scheme[]>([]);
  const [patches, setPatches] = useState<Record<string, SchemePatch>>({});
  const [statuses, setStatuses] = useState<Record<string, SchemeStatus>>({});
  const [requests, setRequests] = useState<SchemeRequest[]>([
    { id: "req-seed-1", schemeId: "ms-3l-30", from: "Approved", to: "Commencement Pending", reason: "Legal confirmed documents are ready for commencement review (demo).", raisedBy: "Maker", raisedAt: "2026-10-09T10:00:00+05:30", state: "Pending approval" },
  ]);

  const addAudit = useCallback((e: AuditInput) => {
    setAudit((s) => [{ id: nextId("sess"), actor, at: new Date().toISOString(), action: e.action, entity: e.entity, previous: e.previous, next: e.next, reason: e.reason, approvalRef: e.approvalRef ?? null, source: "session" }, ...s]);
  }, [actor]);

  const addDraftScheme = useCallback((s: Scheme) => setCreated((c) => [s, ...c]), []);
  const patchScheme = useCallback((id: string, p: SchemePatch) => setPatches((m) => ({ ...m, [id]: { ...m[id], ...p } })), []);

  const applyLocal = useCallback((base: Scheme[]): Scheme[] =>
    [...createdSchemes, ...base].map((s) => ({ ...s, ...patches[s.id], status: statuses[s.id] ?? s.status })), [createdSchemes, patches, statuses]);

  const raiseRequest = useCallback((schemeId: string, from: SchemeStatus, to: SchemeStatus, reason: string) => {
    const id = nextId("req");
    setRequests((r) => [{ id, schemeId, from, to, reason, raisedBy: role, raisedAt: new Date().toISOString(), state: "Pending approval" }, ...r]);
    addAudit({ action: "Raised scheme status change request", entity: schemeId, previous: from, next: to, reason });
  }, [role, addAudit]);

  const decideRequest = useCallback((id: string, decision: "approve" | "reject", note: string): Result => {
    const req = requests.find((r) => r.id === id);
    if (!req) return { ok: false, message: "Request not found." };
    if (req.state !== "Pending approval") return { ok: false, message: "This request is no longer pending." };
    if (role === req.raisedBy) return { ok: false, message: "Maker-checker: the person who raised a request cannot decide it. Switch the acting role." };
    const at = new Date().toISOString();
    const ref = `DEMO-APR-${id.slice(-4).toUpperCase()}`;
    const finish = (state: RequestState, message: string, auditAction: string, nextLabel: string): Result => {
      setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, state, decidedBy: role, decidedAt: at, decisionNote: note } : r)));
      addAudit({ action: auditAction, entity: req.schemeId, previous: req.from, next: nextLabel, reason: note, approvalRef: ref });
      return { ok: state !== "Blocked: evidence missing" && state !== "Rejected", message };
    };
    if (decision === "reject") return finish("Rejected", "Request rejected. Scheme status unchanged.", "Rejected scheme status change", req.from);
    if (req.to === "Active") {
      return finish("Blocked: evidence missing", "Activation is BLOCKED: the approved scheme agreement and commencement approval are not attached. A scheme cannot become operational from this console.", "Approval attempted; activation blocked (evidence missing)", req.from);
    }
    setStatuses((m) => ({ ...m, [req.schemeId]: req.to }));
    return finish("Approved (simulated)", `Simulated transition to ${req.to}. Nothing operational has changed.`, "Approved scheme status change (simulated)", req.to);
  }, [requests, role, addAudit]);

  const value = useMemo<Value>(() => ({ audit, addAudit, createdSchemes, addDraftScheme, patchScheme, applyLocal, requests, raiseRequest, decideRequest }),
    [audit, addAudit, createdSchemes, addDraftScheme, patchScheme, applyLocal, requests, raiseRequest, decideRequest]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

