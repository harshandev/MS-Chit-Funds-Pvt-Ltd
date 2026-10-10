/**
 * Extra mock adapters for the administration console. Same contract as
 * src/services/index.ts: swap for authoritative API calls without UI changes.
 */
import { schemes } from "@/data/demo";
import * as a from "@/data/adminDemo";
import type { Payout, Scheme } from "@/data/types";

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const allAdminSchemes = (): Scheme[] => [...schemes, ...a.extraSchemes];

export const adminExtraService = {
  schemes: () => delay(allAdminSchemes()),
  schemeHistory: (schemeId: string) => delay(a.schemeHistory.filter((h) => h.schemeId === schemeId)),
  evidence: () => delay(a.commencementEvidence),
  subscribers: (schemeId: string) => delay(a.subscribers.filter((s) => s.schemeId === schemeId)),
  customerProfiles: () => delay(a.customerProfiles),
  payments: () => delay(a.adminPayments),
  tickets: () => delay(a.adminTickets),
  documents: () => delay(a.documentRegister),
  payouts: (base: Payout[]) => delay([...base, ...a.extraPayouts]),
  payoutMeta: () => delay(a.payoutMeta),
  complianceHistory: () => delay(a.complianceHistory),
};
