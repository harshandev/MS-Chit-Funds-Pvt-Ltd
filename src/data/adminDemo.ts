/**
 * ADDITIONAL ILLUSTRATIVE demo data for the administration console.
 * Nothing here is a real scheme, customer, payment, document or date.
 * Replace with authoritative backend data; the UI only reads via
 * src/services/adminExtra.ts.
 */
import { rupees } from "@/lib/money";
import type { SchemeRules } from "@/lib/chit";
import { payments as basePayments, tickets as baseTickets } from "./demo";
import type {
  Scheme, Payment, Payout, MembershipStatus, SupportTicket,
} from "./types";

/** Fixed "as of" instant so SLA and expiry displays are stable in the demo. */
export const DEMO_NOW = "2026-10-10T12:00:00+05:30";

const baseRules = {
  commissionBps: 500,
  maxDiscountBps: 3000,
  dividendBasis: "all_tickets" as const,
  prizedReceivesDividend: false,
};
const mkRules = (gross: number, n: number): SchemeRules => ({
  ...baseRules, grossChit: rupees(gross), tickets: n, instalments: n, instalment: rupees(gross / n),
});
const mk = (id: string, name: string, gross: number, n: number, status: Scheme["status"], summary: string): Scheme => ({
  id, name, status, summary, demo: true, rules: mkRules(gross, n),
  commencementNote: "Commencement date to be announced after scheme approval.",
  auctionNote: "Auction schedule is defined in the approved scheme agreement.",
});

/** Extra schemes so every lifecycle state is represented in the console. */
export const extraSchemes: Scheme[] = [
  mk("ms-2l-20", "Sample Scheme ₹2 Lakh · 20 months", 200000, 20, "Draft", "A draft illustrative scheme prepared for legal review."),
  mk("ms-50k-10", "Sample Scheme ₹50,000 · 10 months", 50000, 10, "Suspended", "An illustrative scheme shown as suspended pending an (imaginary) inquiry."),
  mk("ms-1l-10", "Sample Scheme ₹1 Lakh · 10 months", 100000, 10, "Closed", "An illustrative closed scheme kept for record purposes."),
];

export interface SchemeHistoryEntry { id: string; schemeId: string; at: string; actor: string; text: string }
const maker = "demo.maker@mschit.test";
const checker = "demo.checker@mschit.test";
export const schemeHistory: SchemeHistoryEntry[] = [
  { id: "sh-1", schemeId: "ms-1l-20", at: "2026-04-02T10:00:00+05:30", actor: maker, text: "Draft created (demo)." },
  { id: "sh-2", schemeId: "ms-1l-20", at: "2026-04-10T15:00:00+05:30", actor: checker, text: "Moved to Under Review (demo)." },
  { id: "sh-3", schemeId: "ms-1l-20", at: "2026-05-01T11:00:00+05:30", actor: checker, text: "Shown as Active in demo data only; evidence not attached." },
  { id: "sh-4", schemeId: "ms-3l-30", at: "2026-09-01T09:30:00+05:30", actor: maker, text: "Draft created (demo)." },
  { id: "sh-5", schemeId: "ms-3l-30", at: "2026-09-20T17:10:00+05:30", actor: checker, text: "Marked Approved (demo, simulated)." },
  { id: "sh-6", schemeId: "ms-5l-25", at: "2026-10-08T10:00:00+05:30", actor: maker, text: "Requested change Approved → Commencement Pending." },
  { id: "sh-7", schemeId: "ms-10l-40", at: "2026-10-01T09:00:00+05:30", actor: maker, text: "Draft created for legal review." },
  { id: "sh-8", schemeId: "ms-2l-20", at: "2026-10-09T09:00:00+05:30", actor: maker, text: "Draft created (demo)." },
  { id: "sh-9", schemeId: "ms-50k-10", at: "2026-08-14T12:00:00+05:30", actor: checker, text: "Suspended (demo scenario)." },
  { id: "sh-10", schemeId: "ms-1l-10", at: "2026-06-30T12:00:00+05:30", actor: checker, text: "Closed (demo scenario)." },
];

export interface EvidenceItem { id: string; label: string; status: "Evidence missing" | "Evidence attached"; note: string }
/** Evidence needed before ANY scheme may become Active. Always missing in the demo. */
export const commencementEvidence: EvidenceItem[] = [
  { id: "ev-agreement", label: "Approved scheme agreement", status: "Evidence missing", note: "Requires the agreement approved by the competent authority (to be supplied; see the Missing company information panel under Compliance)." },
  { id: "ev-commencement", label: "Commencement approval", status: "Evidence missing", note: "Requires the formal commencement approval/certificate before the first instalment is collected." },
];

export interface Subscriber { id: string; schemeId: string; ticketNo: number; maskedName: string; customerId: string; status: MembershipStatus; instalmentsPaid: number }
export const subscribers: Subscriber[] = [
  { id: "sub-1", schemeId: "ms-1l-20", ticketNo: 7, maskedName: "D**** C******** A", customerId: "cus-1", status: "Active", instalmentsPaid: 5 },
  { id: "sub-2", schemeId: "ms-1l-20", ticketNo: 3, maskedName: "D**** C******** C", customerId: "cus-3", status: "Prized", instalmentsPaid: 6 },
  { id: "sub-3", schemeId: "ms-1l-20", ticketNo: 14, maskedName: "D**** C******** B", customerId: "cus-2", status: "Active", instalmentsPaid: 5 },
  { id: "sub-4", schemeId: "ms-1l-20", ticketNo: 18, maskedName: "D**** C******** D", customerId: "cus-4", status: "Suspended", instalmentsPaid: 3 },
  { id: "sub-5", schemeId: "ms-1l-20", ticketNo: 9, maskedName: "D**** C******** E", customerId: "cus-5", status: "Active", instalmentsPaid: 6 },
  { id: "sub-6", schemeId: "ms-3l-30", ticketNo: 12, maskedName: "D**** C******** A", customerId: "cus-1", status: "Enrolment pending", instalmentsPaid: 0 },
  { id: "sub-7", schemeId: "ms-3l-30", ticketNo: 4, maskedName: "D**** C******** E", customerId: "cus-5", status: "Enrolment pending", instalmentsPaid: 0 },
  { id: "sub-8", schemeId: "ms-1l-10", ticketNo: 2, maskedName: "D**** C******** E", customerId: "cus-5", status: "Closed", instalmentsPaid: 10 },
];

export interface CustomerProfile {
  customerId: string;
  memberships: { schemeId: string; ticketNo: number; status: MembershipStatus }[];
  paymentSummary: { successful: number; failed: number; underReconciliation: number; lastPaymentDate: string | null };
  outstandingInstalments: { schemeId: string; instalmentNo: number; due: string; amount: number }[];
  nominee: { name: string; relationship: string } | null;
  supportTicketIds: string[];
  notes: { id: string; at: string; by: string; text: string }[];
  /** Full (demo) contact details, revealed only through the audited reveal flow. */
  revealed: { mobile: string; email: string };
}
export const customerProfiles: CustomerProfile[] = [
  { customerId: "cus-1", memberships: [{ schemeId: "ms-1l-20", ticketNo: 7, status: "Active" }, { schemeId: "ms-3l-30", ticketNo: 12, status: "Enrolment pending" }],
    paymentSummary: { successful: 4, failed: 1, underReconciliation: 1, lastPaymentDate: "2026-10-05" }, outstandingInstalments: [], nominee: { name: "Demo Nominee A", relationship: "Spouse (demo)" },
    supportTicketIds: ["TKT-1001", "TKT-1002"], notes: [{ id: "n-1", at: "2026-10-02T10:00:00+05:30", by: "Demo checker", text: "Customer called about KYC; asked to resubmit address proof." }],
    revealed: { mobile: "+91 98000 00001", email: "demo.customer.a@example.test" } },
  { customerId: "cus-2", memberships: [{ schemeId: "ms-1l-20", ticketNo: 14, status: "Active" }],
    paymentSummary: { successful: 4, failed: 0, underReconciliation: 0, lastPaymentDate: "2026-09-06" }, outstandingInstalments: [{ schemeId: "ms-1l-20", instalmentNo: 6, due: "2026-10-05", amount: rupees(5000) }], nominee: null,
    supportTicketIds: ["TKT-1003"], notes: [], revealed: { mobile: "+91 98000 00002", email: "demo.customer.b@example.test" } },
  { customerId: "cus-3", memberships: [{ schemeId: "ms-1l-20", ticketNo: 3, status: "Prized" }],
    paymentSummary: { successful: 6, failed: 0, underReconciliation: 0, lastPaymentDate: "2026-10-04" }, outstandingInstalments: [], nominee: { name: "Demo Nominee C", relationship: "Parent (demo)" },
    supportTicketIds: [], notes: [{ id: "n-2", at: "2026-09-12T14:00:00+05:30", by: "Demo maker", text: "Prize paperwork complete (demo note)." }], revealed: { mobile: "+91 98000 00003", email: "demo.customer.c@example.test" } },
  { customerId: "cus-4", memberships: [{ schemeId: "ms-1l-20", ticketNo: 18, status: "Suspended" }],
    paymentSummary: { successful: 3, failed: 2, underReconciliation: 0, lastPaymentDate: "2026-07-05" }, outstandingInstalments: [{ schemeId: "ms-1l-20", instalmentNo: 5, due: "2026-09-05", amount: rupees(5000) }, { schemeId: "ms-1l-20", instalmentNo: 6, due: "2026-10-05", amount: rupees(5000) }], nominee: null,
    supportTicketIds: ["TKT-1004"], notes: [], revealed: { mobile: "+91 98000 00004", email: "demo.customer.d@example.test" } },
  { customerId: "cus-5", memberships: [{ schemeId: "ms-1l-20", ticketNo: 9, status: "Active" }, { schemeId: "ms-3l-30", ticketNo: 4, status: "Enrolment pending" }, { schemeId: "ms-1l-10", ticketNo: 2, status: "Closed" }],
    paymentSummary: { successful: 9, failed: 0, underReconciliation: 0, lastPaymentDate: "2026-10-01" }, outstandingInstalments: [{ schemeId: "ms-1l-20", instalmentNo: 6, due: "2026-10-05", amount: rupees(5000) }], nominee: { name: "Demo Nominee E", relationship: "Sibling (demo)" },
    supportTicketIds: [], notes: [], revealed: { mobile: "+91 98000 00005", email: "demo.customer.e@example.test" } },
];

export type PaymentReconView = "Matched" | "Not matched" | "Awaiting bank file" | "Not applicable (cash)";
export interface AdminPayment extends Payment {
  customerId: string;
  schemeId: string;
  ticketNo: number;
  recon: PaymentReconView;
}
const reconFor = (p: Payment): PaymentReconView =>
  p.method === "Cash (office)" ? "Not applicable (cash)"
  : p.status === "Successful" || p.status === "Refunded" ? "Matched"
  : p.status === "Under reconciliation" ? "Awaiting bank file" : "Not matched";

const extra = (id: string, cus: string, scheme: string, ticket: number, no: number, amt: number, date: string, method: Payment["method"], status: Payment["status"], gw: string | null): AdminPayment => {
  const p: Payment = { id, membershipId: `mem-${cus}`, instalmentNo: no, amount: rupees(amt), date, method, reference: `DEMO-PAY-${id.toUpperCase()}`, gatewayRef: gw, status };
  return { ...p, customerId: cus, schemeId: scheme, ticketNo: ticket, recon: reconFor(p) };
};
export const adminPayments: AdminPayment[] = [
  ...basePayments.map((p): AdminPayment => ({ ...p, customerId: "cus-1", schemeId: "ms-1l-20", ticketNo: 7, recon: reconFor(p) })),
  extra("x-101", "cus-2", "ms-1l-20", 14, 5, 5000, "2026-09-06", "UPI", "Successful", "DEMO-GW-7790"),
  extra("x-102", "cus-2", "ms-1l-20", 14, 4, 5000, "2026-08-05", "UPI", "Successful", "DEMO-GW-7511"),
  extra("x-103", "cus-3", "ms-1l-20", 3, 6, 5000, "2026-10-04", "Net banking", "Successful", "DEMO-GW-7901"),
  extra("x-104", "cus-3", "ms-1l-20", 3, 5, 5000, "2026-09-04", "NACH mandate", "Successful", "DEMO-GW-7770"),
  extra("x-105", "cus-4", "ms-1l-20", 18, 4, 5000, "2026-08-06", "UPI", "Failed", "DEMO-GW-7520"),
  extra("x-106", "cus-4", "ms-1l-20", 18, 3, 5000, "2026-07-05", "UPI", "Successful", "DEMO-GW-7215"),
  extra("x-107", "cus-5", "ms-1l-20", 9, 6, 5000, "2026-10-01", "UPI", "Successful", "DEMO-GW-7890"),
  extra("x-108", "cus-5", "ms-1l-20", 9, 5, 5000, "2026-09-03", "Card", "Successful", "DEMO-GW-7760"),
  extra("x-109", "cus-5", "ms-1l-20", 9, 2, 5000, "2026-06-04", "UPI", "Successful", "DEMO-GW-7010"),
  extra("x-110", "cus-2", "ms-1l-20", 14, 6, 5000, "2026-10-08", "UPI", "Pending", null),
];

export interface AdminTicket {
  id: string;
  customerId: string;
  subject: string;
  category: string;
  status: SupportTicket["status"];
  assignee: string | null;
  openedAt: string;
  slaHours: number;
  history: { at: string; by: "Customer" | "Support"; text: string }[];
}
const hist = (id: string) => baseTickets.find((t) => t.id === id)?.history ?? [];
export const adminTickets: AdminTicket[] = [
  { id: "TKT-1002", customerId: "cus-1", subject: "Payment still under reconciliation", category: "Payments", status: "In progress", assignee: "Demo support agent 1", openedAt: "2026-10-06T09:15:00+05:30", slaHours: 72, history: hist("TKT-1002") },
  { id: "TKT-1003", customerId: "cus-2", subject: "KYC document rejected: what is wrong?", category: "KYC", status: "Open", assignee: null, openedAt: "2026-10-09T11:00:00+05:30", slaHours: 48, history: [{ at: "2026-10-09T11:00:00+05:30", by: "Customer", text: "My KYC says under review for two weeks. Please explain." }] },
  { id: "TKT-1004", customerId: "cus-4", subject: "Query about refund of a failed payment", category: "Payments", status: "Awaiting customer", assignee: "Demo support agent 2", openedAt: "2026-10-03T16:00:00+05:30", slaHours: 72, history: [{ at: "2026-10-03T16:00:00+05:30", by: "Customer", text: "A payment failed but my bank shows a debit." }, { at: "2026-10-04T10:30:00+05:30", by: "Support", text: "Please share the bank statement page showing the debit. (demo)" }] },
  { id: "TKT-1001", customerId: "cus-1", subject: "Receipt for instalment 4", category: "Documents", status: "Resolved", assignee: "Demo support agent 1", openedAt: "2026-08-10T10:00:00+05:30", slaHours: 48, history: hist("TKT-1001") },
];
export const supportAgents = ["Demo support agent 1", "Demo support agent 2", "Demo grievance officer (placeholder)"] as const;

export type RegisterStatus = "Not uploaded" | "Received (demo)" | "Pending review" | "Expiring soon" | "Expired";
export interface RegisterDoc { id: string; scope: "Scheme" | "Customer"; ref: string; type: string; status: RegisterStatus; expiry: string | null; note: string }
export const documentRegister: RegisterDoc[] = [
  { id: "dr-1", scope: "Scheme", ref: "ms-1l-20", type: "Approved scheme agreement", status: "Not uploaded", expiry: null, note: "No file stored. Pending verified document from legal." },
  { id: "dr-2", scope: "Scheme", ref: "ms-1l-20", type: "Commencement approval", status: "Not uploaded", expiry: null, note: "No file stored." },
  { id: "dr-3", scope: "Scheme", ref: "ms-3l-30", type: "Approved scheme agreement", status: "Not uploaded", expiry: null, note: "No file stored." },
  { id: "dr-4", scope: "Scheme", ref: "ms-5l-25", type: "Scheme terms summary", status: "Pending review", expiry: null, note: "Draft text only; no uploaded file." },
  { id: "dr-5", scope: "Scheme", ref: "ms-10l-40", type: "Legal opinion", status: "Not uploaded", expiry: null, note: "Requested; not received." },
  { id: "dr-6", scope: "Customer", ref: "cus-1", type: "Identity proof", status: "Pending review", expiry: null, note: "KYC action required (demo)." },
  { id: "dr-7", scope: "Customer", ref: "cus-3", type: "Security document (prize)", status: "Received (demo)", expiry: "2026-11-01", note: "Placeholder record only; no file." },
  { id: "dr-8", scope: "Customer", ref: "cus-3", type: "Bank account proof", status: "Expiring soon", expiry: "2026-10-25", note: "Placeholder record only." },
  { id: "dr-9", scope: "Customer", ref: "cus-5", type: "Identity proof", status: "Received (demo)", expiry: null, note: "Placeholder record only." },
  { id: "dr-10", scope: "Customer", ref: "cus-4", type: "Bank account proof", status: "Expired", expiry: "2026-09-30", note: "Verification failed (demo)." },
  { id: "dr-11", scope: "Customer", ref: "cus-2", type: "Identity proof", status: "Pending review", expiry: null, note: "Under review (demo)." },
  { id: "dr-12", scope: "Customer", ref: "cus-5", type: "Nominee declaration", status: "Not uploaded", expiry: null, note: "No file stored." },
];

/** Extra payout requests (merged after demo payouts). */
export const extraPayouts: Payout[] = [
  { id: "po-4", auctionId: "auc-5", ticket: 3, amount: rupees(5000), status: "Awaiting maker", docsRequired: ["Refund request form", "Bank verification"] },
  { id: "po-5", auctionId: "auc-5", ticket: 3, amount: rupees(10000), status: "Awaiting maker", docsRequired: ["Security release form", "Foreman sign-off"] },
];
export type PayoutDocState = "Received (demo)" | "Not received" | "Failed verification";
export interface PayoutMeta {
  kind: string;
  /** Who raised the request (maker). Same actor cannot approve. */
  raisedBy: string | null;
  docs: { name: string; state: PayoutDocState }[];
}
export const payoutMeta: Record<string, PayoutMeta> = {
  "po-1": { kind: "Prize payout", raisedBy: maker, docs: [{ name: "Signed prize receipt", state: "Received (demo)" }, { name: "Security documents", state: "Received (demo)" }] },
  "po-2": { kind: "Prize payout", raisedBy: maker, docs: [{ name: "Signed prize receipt", state: "Received (demo)" }, { name: "Security documents", state: "Received (demo)" }] },
  "po-3": { kind: "Prize payout", raisedBy: maker, docs: [{ name: "Bank verification", state: "Failed verification" }] },
  "po-4": { kind: "Refund of excess instalment", raisedBy: null, docs: [{ name: "Refund request form", state: "Received (demo)" }, { name: "Bank verification", state: "Received (demo)" }] },
  "po-5": { kind: "Security release", raisedBy: null, docs: [{ name: "Security release form", state: "Received (demo)" }, { name: "Foreman sign-off", state: "Not received" }] },
};

export interface ReviewEntry { id: string; taskId: string; at: string; actor: string; text: string }
export const complianceHistory: ReviewEntry[] = [
  { id: "rh-1", taskId: "c3", at: "2026-10-06T11:00:00+05:30", actor: checker, text: "Queue reviewed; 2 items remain (demo)." },
  { id: "rh-2", taskId: "c4", at: "2026-10-04T09:30:00+05:30", actor: checker, text: "Alert opened for cash payment review (demo)." },
  { id: "rh-3", taskId: "c1", at: "2026-09-15T16:00:00+05:30", actor: maker, text: "Reminder set: approved agreement still outstanding." },
];
