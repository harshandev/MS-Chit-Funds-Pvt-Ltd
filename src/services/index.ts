/**
 * Service layer. Every UI screen reads data through these functions.
 * The implementations below are MOCK ADAPTERS over src/data/demo.ts; replace
 * them with API calls to an authoritative backend without touching the UI.
 * All amounts and calculations must ultimately be computed server-side.
 */
import * as d from "@/data/demo";
import { computeBreakdown } from "@/lib/chit";

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const schemeService = {
  list: () => delay(d.schemes),
  get: (id: string) => delay(d.getScheme(id) ?? null),
};
export const membershipService = {
  list: () => delay(d.memberships),
  get: (id: string) => delay(d.memberships.find((m) => m.id === id) ?? null),
};
export const paymentService = {
  list: (membershipId?: string) => delay(membershipId ? d.payments.filter((p) => p.membershipId === membershipId) : d.payments),
};
export const auctionService = {
  list: () => delay(d.auctions),
  get: (id: string) => delay(d.getAuction(id) ?? null),
  breakdown: (auctionId: string) => {
    const a = d.getAuction(auctionId);
    const s = a && d.getScheme(a.schemeId);
    return a && s && a.discountBps != null ? computeBreakdown(s.rules, a.discountBps, a.instalmentNo) : null;
  },
};
export const notificationService = { list: () => delay(d.notifications) };
export const documentService = { list: () => delay(d.documents) };
export const supportService = { list: () => delay(d.tickets) };
export const adminService = {
  customers: () => delay(d.customers),
  recon: () => delay(d.reconRows),
  payouts: () => delay(d.payouts),
  compliance: () => delay(d.complianceTasks),
  audit: () => delay(d.auditLogs),
};
