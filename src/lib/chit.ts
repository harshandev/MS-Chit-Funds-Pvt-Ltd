import { applyBps, type Bps, type Paise } from "./money";

/**
 * Deterministic, ILLUSTRATIVE chit arithmetic. Real schemes must be
 * calculated by an authoritative server-side service following the approved
 * agreement; the rules below are explicit inputs, never hidden assumptions.
 */
export interface SchemeRules {
  grossChit: Paise;
  tickets: number;
  instalments: number;
  /** Monthly subscription per ticket. */
  instalment: Paise;
  /** Foreman commission (basis points of gross chit). Per approved scheme. */
  commissionBps: Bps;
  /** Maximum permitted auction discount (basis points of gross chit). */
  maxDiscountBps: Bps;
  /** Who shares the distributable dividend. Set per approved agreement. */
  dividendBasis: "all_tickets" | "non_prized_tickets";
  /** Whether a prized ticket receives dividend on later instalments. */
  prizedReceivesDividend: boolean;
}

export interface ChitBreakdown {
  gross: Paise;
  discount: Paise;
  commission: Paise;
  /** Gross minus discount: the amount paid to the winning ticket. */
  netChit: Paise;
  /** Discount minus commission, shared per `dividendBasis`. */
  distributable: Paise;
  dividendPerTicket: Paise;
  /** Instalment payable by a non-winning ticket that month. */
  payableNonWinner: Paise;
  /** Instalment payable by the winning ticket (no dividend by default). */
  payableWinner: Paise;
  remainingAfterWin: number;
  futureObligationWinner: Paise;
}

export type ValidationIssue = { field: string; message: string };

export function validateRules(r: SchemeRules, discountBps: Bps): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!(r.grossChit > 0)) issues.push({ field: "grossChit", message: "Gross chit amount must be greater than zero." });
  if (!Number.isInteger(r.tickets) || r.tickets < 2) issues.push({ field: "tickets", message: "Tickets must be a whole number of at least 2." });
  if (!Number.isInteger(r.instalments) || r.instalments < 1) issues.push({ field: "instalments", message: "Instalments must be a whole number of at least 1." });
  if (!(r.instalment > 0)) issues.push({ field: "instalment", message: "Instalment must be greater than zero." });
  if (discountBps < 0) issues.push({ field: "discount", message: "Discount cannot be negative." });
  if (discountBps > r.maxDiscountBps) issues.push({ field: "discount", message: "Discount exceeds the configured maximum for this scheme." });
  if (applyBps(r.grossChit, discountBps) < applyBps(r.grossChit, r.commissionBps) && discountBps >= 0)
    issues.push({ field: "discount", message: "Discount is lower than the foreman commission, so there is nothing to distribute." });
  if (r.tickets * r.instalment !== r.grossChit && r.tickets * r.instalment > 0 && r.grossChit > 0 && r.instalments === r.tickets)
    issues.push({ field: "instalment", message: "Note: tickets × instalment does not equal the gross chit; check the scheme definition." });
  return issues;
}

export function computeBreakdown(r: SchemeRules, discountBps: Bps, instalmentNo = 1): ChitBreakdown {
  const gross = r.grossChit;
  const discount = applyBps(gross, discountBps);
  const commission = applyBps(gross, r.commissionBps);
  const netChit = gross - discount;
  const distributable = Math.max(0, discount - commission);
  const sharers = r.dividendBasis === "all_tickets" ? r.tickets : Math.max(1, r.tickets - 1);
  const dividendPerTicket = Math.floor(distributable / sharers);
  const remainingAfterWin = Math.max(0, r.instalments - instalmentNo);
  const payableWinner = r.prizedReceivesDividend ? r.instalment - dividendPerTicket : r.instalment;
  return {
    gross, discount, commission, netChit, distributable, dividendPerTicket,
    payableNonWinner: r.instalment - dividendPerTicket,
    payableWinner,
    remainingAfterWin,
    futureObligationWinner: payableWinner * remainingAfterWin,
  };
}
