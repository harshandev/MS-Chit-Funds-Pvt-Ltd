import type { Paise } from "@/lib/money";
import type { SchemeRules } from "@/lib/chit";

export type SchemeStatus =
  | "Draft" | "Under Review" | "Approved" | "Commencement Pending" | "Active" | "Suspended" | "Closed";

export type VerificationStatus =
  | "Not started" | "In progress" | "Action required" | "Under review" | "Verified" | "Rejected" | "Failed";

export interface Scheme {
  id: string;
  name: string;
  status: SchemeStatus;
  rules: SchemeRules;
  /** Illustrative only; never a real start date. */
  commencementNote: string;
  auctionNote: string;
  summary: string;
  demo: true;
}

export type PaymentStatus = "Pending" | "Successful" | "Failed" | "Refunded" | "Under reconciliation";

export interface Payment {
  id: string;
  membershipId: string;
  instalmentNo: number;
  amount: Paise;
  date: string; // ISO
  method: "UPI" | "Net banking" | "Card" | "Cash (office)" | "NACH mandate";
  reference: string;
  gatewayRef: string | null;
  status: PaymentStatus;
}

export type MembershipStatus = "Enrolment pending" | "Active" | "Prized" | "Suspended" | "Closed";

export interface Membership {
  id: string;
  schemeId: string;
  ticketNo: number;
  currentInstalment: number;
  status: MembershipStatus;
  nextDue: string; // ISO
  /** Prize status text shown on the dashboard. */
  prizeStatus: "Not yet prized" | "Prized (demo)";
}

export type AuctionState =
  | "Scheduled" | "Open" | "Closed" | "Result pending verification" | "Result published" | "Cancelled" | "Rescheduled";

export interface Auction {
  id: string;
  schemeId: string;
  instalmentNo: number;
  state: AuctionState;
  scheduledAt: string; // ISO (simulated)
  discountBps: number | null; // winning discount when published
  winningTicket: number | null;
  auditRef: string | null;
  tieBreakRule: string;
  eligibility: string;
}

export interface AppNotification {
  id: string;
  category: "Payment" | "Auction" | "Document" | "KYC" | "Support" | "General";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: "Agreement" | "Receipt" | "Auction statement" | "Correspondence" | "Scheme document";
  /** null = no real file exists yet; UI shows an honest placeholder. */
  fileUrl: string | null;
  membershipId?: string;
  note: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "In progress" | "Awaiting customer" | "Resolved";
  chitRef?: string;
  history: { at: string; by: "Customer" | "Support"; text: string }[];
}

export interface Customer {
  id: string;
  name: string;
  mobile: string; // stored masked-ready demo value
  email: string;
  kyc: VerificationStatus;
  bank: VerificationStatus;
  nominee: string | null;
  memberships: number;
  outstanding: Paise;
}

export interface ReconRow {
  id: string;
  date: string;
  gateway: Paise | null;
  bank: Paise | null;
  ledger: Paise | null;
  status: "Matched" | "Amount mismatch" | "Missing in bank" | "Missing in ledger" | "Missing in gateway";
  note: string;
}

export interface Payout {
  id: string;
  auctionId: string;
  ticket: number;
  amount: Paise;
  status: "Awaiting maker" | "Awaiting checker" | "Approved (simulated)" | "Rejected" | "Failed";
  docsRequired: string[];
  reason?: string;
}

export interface ComplianceTask {
  id: string;
  area: "Scheme documentation" | "KYC review" | "AML alert" | "Security document" | "Registrar record" | "Regulatory reporting";
  title: string;
  status: "Evidence missing" | "In review" | "Due soon" | "Evidence attached";
  due: string | null;
  note: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
  previous?: string;
  next?: string;
  reason: string;
  approvalRef: string | null;
}
