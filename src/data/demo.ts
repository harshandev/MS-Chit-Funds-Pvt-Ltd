import { rupees } from "@/lib/money";
import type {
  Scheme, Membership, Payment, Auction, AppNotification, DocumentItem, SupportTicket,
  Customer, ReconRow, Payout, ComplianceTask, AuditLog,
} from "./types";

/** ILLUSTRATIVE demo data. Nothing here is a real scheme, person, payment or date. */

const base = {
  commissionBps: 500,
  maxDiscountBps: 3000,
  dividendBasis: "all_tickets" as const,
  prizedReceivesDividend: false,
};
const mk = (id: string, name: string, lakh: number, n: number, status: Scheme["status"], summary: string): Scheme => ({
  id, name, status, summary, demo: true,
  rules: { ...base, grossChit: rupees(lakh * 100000), tickets: n, instalments: n, instalment: rupees((lakh * 100000) / n) },
  commencementNote: status === "Active"
    ? "Illustrative: scheme shown as active for demo purposes."
    : "Commencement date to be announced after scheme approval.",
  auctionNote: "Auction schedule is defined in the approved scheme agreement.",
});

export const schemes: Scheme[] = [
  mk("ms-1l-20", "Sample Scheme ₹1 Lakh · 20 months", 1, 20, "Active", "A compact illustrative scheme to explain how monthly instalments and auctions fit together."),
  mk("ms-3l-30", "Sample Scheme ₹3 Lakh · 30 months", 3, 30, "Approved", "A mid-sized illustrative scheme with a longer instalment period."),
  mk("ms-5l-25", "Sample Scheme ₹5 Lakh · 25 months", 5, 25, "Commencement Pending", "An illustrative scheme awaiting commencement in this demo."),
  mk("ms-10l-40", "Sample Scheme ₹10 Lakh · 40 months", 10, 40, "Under Review", "An illustrative high-value scheme still under review in this demo."),
];
export const getScheme = (id: string) => schemes.find((s) => s.id === id);

export const memberships: Membership[] = [
  { id: "mem-1", schemeId: "ms-1l-20", ticketNo: 7, currentInstalment: 6, status: "Active", nextDue: "2026-11-05", prizeStatus: "Not yet prized" },
  { id: "mem-2", schemeId: "ms-3l-30", ticketNo: 12, currentInstalment: 0, status: "Enrolment pending", nextDue: "2026-12-05", prizeStatus: "Not yet prized" },
];

export const payments: Payment[] = [
  { id: "pay-6", membershipId: "mem-1", instalmentNo: 6, amount: rupees(5000), date: "2026-10-05", method: "UPI", reference: "DEMO-PAY-0006", gatewayRef: null, status: "Under reconciliation" },
  { id: "pay-5", membershipId: "mem-1", instalmentNo: 5, amount: rupees(5000), date: "2026-09-05", method: "NACH mandate", reference: "DEMO-PAY-0005", gatewayRef: "DEMO-GW-7781", status: "Successful" },
  { id: "pay-4", membershipId: "mem-1", instalmentNo: 4, amount: rupees(5000), date: "2026-08-06", method: "UPI", reference: "DEMO-PAY-0004", gatewayRef: "DEMO-GW-7502", status: "Successful" },
  { id: "pay-3", membershipId: "mem-1", instalmentNo: 3, amount: rupees(5000), date: "2026-07-05", method: "Net banking", reference: "DEMO-PAY-0003", gatewayRef: "DEMO-GW-7210", status: "Failed" },
  { id: "pay-3b", membershipId: "mem-1", instalmentNo: 3, amount: rupees(5000), date: "2026-07-07", method: "UPI", reference: "DEMO-PAY-0003R", gatewayRef: "DEMO-GW-7233", status: "Successful" },
  { id: "pay-2", membershipId: "mem-1", instalmentNo: 2, amount: rupees(5000), date: "2026-06-05", method: "Cash (office)", reference: "DEMO-PAY-0002", gatewayRef: null, status: "Successful" },
  { id: "pay-1", membershipId: "mem-1", instalmentNo: 1, amount: rupees(5000), date: "2026-05-05", method: "UPI", reference: "DEMO-PAY-0001", gatewayRef: "DEMO-GW-6900", status: "Refunded" },
];

export const auctions: Auction[] = [
  { id: "auc-7", schemeId: "ms-1l-20", instalmentNo: 7, state: "Open", scheduledAt: "2026-11-02T11:00:00+05:30", discountBps: null, winningTicket: null, auditRef: null, tieBreakRule: "Per approved scheme agreement (not configured in demo).", eligibility: "Tickets in good standing that have not yet been prized, subject to the scheme agreement." },
  { id: "auc-6", schemeId: "ms-1l-20", instalmentNo: 6, state: "Result pending verification", scheduledAt: "2026-10-02T11:00:00+05:30", discountBps: 1800, winningTicket: 14, auditRef: "DEMO-AUD-0006", tieBreakRule: "Per approved scheme agreement (not configured in demo).", eligibility: "Tickets in good standing that have not yet been prized." },
  { id: "auc-5", schemeId: "ms-1l-20", instalmentNo: 5, state: "Result published", scheduledAt: "2026-09-02T11:00:00+05:30", discountBps: 1600, winningTicket: 3, auditRef: "DEMO-AUD-0005", tieBreakRule: "Per approved scheme agreement (not configured in demo).", eligibility: "Tickets in good standing that have not yet been prized." },
  { id: "auc-4", schemeId: "ms-1l-20", instalmentNo: 4, state: "Result published", scheduledAt: "2026-08-02T11:00:00+05:30", discountBps: 1500, winningTicket: 18, auditRef: "DEMO-AUD-0004", tieBreakRule: "Per approved scheme agreement (not configured in demo).", eligibility: "Tickets in good standing that have not yet been prized." },
  { id: "auc-8", schemeId: "ms-1l-20", instalmentNo: 8, state: "Scheduled", scheduledAt: "2026-12-02T11:00:00+05:30", discountBps: null, winningTicket: null, auditRef: null, tieBreakRule: "Per approved scheme agreement (not configured in demo).", eligibility: "Tickets in good standing that have not yet been prized." },
  { id: "auc-3", schemeId: "ms-1l-20", instalmentNo: 3, state: "Rescheduled", scheduledAt: "2026-07-02T11:00:00+05:30", discountBps: null, winningTicket: null, auditRef: null, tieBreakRule: "Per approved scheme agreement (not configured in demo).", eligibility: "Tickets in good standing that have not yet been prized." },
];
export const getAuction = (id: string) => auctions.find((a) => a.id === id);

export const notifications: AppNotification[] = [
  { id: "n1", category: "Payment", title: "Payment under reconciliation", body: "Your instalment 6 payment (DEMO-PAY-0006) is being matched with bank records.", at: "2026-10-05T10:20:00+05:30", read: false, href: "/dashboard/payments" },
  { id: "n2", category: "Auction", title: "Auction for instalment 7 is open", body: "A simulated auction window is open for Sample Scheme ₹1 Lakh.", at: "2026-10-04T09:00:00+05:30", read: false, href: "/dashboard/auctions/auc-7" },
  { id: "n3", category: "KYC", title: "KYC action required", body: "Placeholder: identity verification needs a real integration before completion.", at: "2026-10-01T14:00:00+05:30", read: true, href: "/dashboard/profile" },
  { id: "n4", category: "Document", title: "Agreement placeholder available", body: "The agreement will appear here once a verified document is supplied.", at: "2026-09-28T16:30:00+05:30", read: true, href: "/dashboard/documents" },
];

export const documents: DocumentItem[] = [
  { id: "d1", name: "Chit agreement — Sample Scheme ₹1 Lakh", category: "Agreement", fileUrl: null, membershipId: "mem-1", note: "Placeholder: pending verified agreement from legal." },
  { id: "d2", name: "Receipt — Instalment 5", category: "Receipt", fileUrl: null, membershipId: "mem-1", note: "Demo receipt; no real file." },
  { id: "d3", name: "Auction statement — Instalment 5", category: "Auction statement", fileUrl: null, membershipId: "mem-1", note: "Illustrative statement, not a signed document." },
  { id: "d4", name: "Welcome letter", category: "Correspondence", fileUrl: null, note: "Placeholder." },
  { id: "d5", name: "Scheme terms summary", category: "Scheme document", fileUrl: null, note: "Pending legal approval." },
];

export const tickets: SupportTicket[] = [
  { id: "TKT-1001", subject: "Receipt for instalment 4", category: "Documents", status: "Resolved", chitRef: "mem-1", history: [
    { at: "2026-08-10T10:00:00+05:30", by: "Customer", text: "Please share the receipt for instalment 4." },
    { at: "2026-08-11T12:30:00+05:30", by: "Support", text: "Receipt placeholder added to your documents (demo)." } ] },
  { id: "TKT-1002", subject: "Payment still under reconciliation", category: "Payments", status: "In progress", chitRef: "mem-1", history: [
    { at: "2026-10-06T09:15:00+05:30", by: "Customer", text: "My instalment 6 payment shows under reconciliation." },
    { at: "2026-10-06T15:00:00+05:30", by: "Support", text: "We are checking with the bank statement. (demo)" } ] },
];

export const customers: Customer[] = [
  { id: "cus-1", name: "Demo Customer A", mobile: "+91 98XXXXXX01", email: "a***@example.test", kyc: "Action required", bank: "Not started", nominee: "Demo Nominee A", memberships: 2, outstanding: rupees(0) },
  { id: "cus-2", name: "Demo Customer B", mobile: "+91 98XXXXXX02", email: "b***@example.test", kyc: "Under review", bank: "In progress", nominee: null, memberships: 1, outstanding: rupees(5000) },
  { id: "cus-3", name: "Demo Customer C", mobile: "+91 98XXXXXX03", email: "c***@example.test", kyc: "Verified", bank: "Verified", nominee: "Demo Nominee C", memberships: 1, outstanding: rupees(0) },
  { id: "cus-4", name: "Demo Customer D", mobile: "+91 98XXXXXX04", email: "d***@example.test", kyc: "Rejected", bank: "Failed", nominee: null, memberships: 1, outstanding: rupees(10000) },
  { id: "cus-5", name: "Demo Customer E", mobile: "+91 98XXXXXX05", email: "e***@example.test", kyc: "Verified", bank: "Under review", nominee: "Demo Nominee E", memberships: 3, outstanding: rupees(5000) },
];

export const reconRows: ReconRow[] = [
  { id: "rc-1", date: "2026-10-05", gateway: rupees(5000), bank: rupees(5000), ledger: rupees(5000), status: "Matched", note: "" },
  { id: "rc-2", date: "2026-10-05", gateway: rupees(5000), bank: null, ledger: rupees(5000), status: "Missing in bank", note: "Awaiting bank settlement file." },
  { id: "rc-3", date: "2026-10-04", gateway: rupees(5000), bank: rupees(4950), ledger: rupees(5000), status: "Amount mismatch", note: "Possible gateway fee deduction." },
  { id: "rc-4", date: "2026-10-03", gateway: null, bank: rupees(5000), ledger: null, status: "Missing in gateway", note: "Unidentified bank credit." },
  { id: "rc-5", date: "2026-10-03", gateway: rupees(5000), bank: rupees(5000), ledger: null, status: "Missing in ledger", note: "Ledger posting pending." },
];

export const payouts: Payout[] = [
  { id: "po-1", auctionId: "auc-5", ticket: 3, amount: rupees(84000), status: "Approved (simulated)", docsRequired: ["Signed prize receipt", "Security documents"] },
  { id: "po-2", auctionId: "auc-6", ticket: 14, amount: rupees(82000), status: "Awaiting checker", docsRequired: ["Signed prize receipt", "Security documents"] },
  { id: "po-3", auctionId: "auc-4", ticket: 18, amount: rupees(85000), status: "Failed", docsRequired: ["Bank verification"], reason: "Bank account name mismatch (demo)." },
];

export const complianceTasks: ComplianceTask[] = [
  { id: "c1", area: "Scheme documentation", title: "Approved scheme agreement (Tamil Nadu)", status: "Evidence missing", due: null, note: "Attach once approved by the competent authority." },
  { id: "c2", area: "Registrar record", title: "Registrar of Chits registration reference", status: "Evidence missing", due: null, note: "To be supplied by the company." },
  { id: "c3", area: "KYC review", title: "Pending KYC reviews", status: "In review", due: "2026-10-20", note: "Demo queue." },
  { id: "c4", area: "AML alert", title: "Unusual cash payment flag", status: "In review", due: "2026-10-18", note: "Demo alert." },
  { id: "c5", area: "Security document", title: "Subscriber security documents expiry check", status: "Due soon", due: "2026-11-01", note: "Demo reminder." },
  { id: "c6", area: "Regulatory reporting", title: "Periodic returns", status: "Evidence missing", due: null, note: "Obligations to be confirmed by legal counsel." },
];

export const auditLogs: AuditLog[] = [
  { id: "al-1", actor: "demo.maker@mschit.test", action: "Requested scheme status change", entity: "ms-5l-25", at: "2026-10-08T10:00:00+05:30", previous: "Approved", next: "Commencement Pending", reason: "Awaiting commencement certificate", approvalRef: null },
  { id: "al-2", actor: "demo.checker@mschit.test", action: "Approved payout", entity: "po-1", at: "2026-10-07T16:20:00+05:30", previous: "Awaiting checker", next: "Approved (simulated)", reason: "Documents verified (demo)", approvalRef: "DEMO-APR-0001" },
  { id: "al-3", actor: "system", action: "Reconciliation exception raised", entity: "rc-3", at: "2026-10-04T23:00:00+05:30", reason: "Bank amount differs from ledger", approvalRef: null },
  { id: "al-4", actor: "demo.maker@mschit.test", action: "Created draft scheme", entity: "ms-10l-40", at: "2026-10-01T09:00:00+05:30", reason: "Draft for legal review", approvalRef: null },
];
