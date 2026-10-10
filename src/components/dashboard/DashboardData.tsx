"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  adminService, auctionService, documentService, membershipService, notificationService,
  paymentService, schemeService, supportService,
} from "@/services";
import type {
  AppNotification, Auction, Customer, DocumentItem, Membership, Payment, Scheme, SupportTicket,
} from "@/data/types";
import { useAsync } from "./useAsync";

export interface Snapshot {
  memberships: Membership[];
  schemes: Scheme[];
  payments: Payment[];
  auctions: Auction[];
  notifications: AppNotification[];
  documents: DocumentItem[];
  tickets: SupportTicket[];
  customer: Customer;
}

export interface Nominee { name: string; relationship: string }

interface Ctx {
  status: "loading" | "error" | "ready";
  error?: string;
  retry: () => void;
  data: Snapshot | null;
  unreadCount: number;
  nominee: Nominee | null;
  addPayment: (p: Payment) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addTicket: (t: SupportTicket) => void;
  saveNominee: (n: Nominee) => void;
  nextTicketNo: () => string;
}

const DashCtx = createContext<Ctx | null>(null);

async function loadSnapshot(): Promise<Snapshot> {
  const [memberships, schemes, payments, auctions, notifications, documents, tickets, customers] = await Promise.all([
    membershipService.list(), schemeService.list(), paymentService.list(), auctionService.list(),
    notificationService.list(), documentService.list(), supportService.list(), adminService.customers(),
  ]);
  // Demo: the signed-in customer is the first demo customer record.
  const customer = customers[0];
  if (!customer) throw new Error("No customer profile is available in the demo data.");
  return { memberships, schemes, payments, auctions, notifications, documents, tickets, customer };
}

/** Loads all service data once and layers LOCAL, in-memory UI changes on top (never persisted, never authoritative). */
export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const loaded = useAsync(loadSnapshot);
  const [localPayments, setLocalPayments] = useState<Payment[]>([]);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());
  const [allRead, setAllRead] = useState(false);
  const [localTickets, setLocalTickets] = useState<SupportTicket[]>([]);
  const [nominee, setNominee] = useState<Nominee | null | undefined>(undefined);

  const data = useMemo<Snapshot | null>(() => {
    if (loaded.status !== "ready") return null;
    const b = loaded.data;
    return {
      ...b,
      payments: [...localPayments, ...b.payments],
      notifications: b.notifications.map((n) => ({ ...n, read: n.read || allRead || readIds.has(n.id) })),
      tickets: [...localTickets, ...b.tickets],
    };
  }, [loaded, localPayments, readIds, allRead, localTickets]);

  const effectiveNominee: Nominee | null =
    nominee !== undefined ? nominee : data?.customer.nominee ? { name: data.customer.nominee, relationship: "Not recorded" } : null;

  const unreadCount = data ? data.notifications.filter((n) => !n.read).length : 0;
  const addPayment = useCallback((p: Payment) => setLocalPayments((s) => [p, ...s]), []);
  const markRead = useCallback((id: string) => setReadIds((s) => new Set(s).add(id)), []);
  const markAllRead = useCallback(() => setAllRead(true), []);
  const addTicket = useCallback((t: SupportTicket) => setLocalTickets((s) => [t, ...s]), []);
  const saveNominee = useCallback((n: Nominee) => setNominee(n), []);
  const nextTicketNo = useCallback(() => `TKT-DEMO-${String(localTickets.length + 1).padStart(4, "0")}`, [localTickets.length]);

  const value: Ctx = {
    status: loaded.status, error: loaded.status === "error" ? loaded.error : undefined, retry: loaded.retry,
    data, unreadCount, nominee: effectiveNominee, addPayment, markRead, markAllRead, addTicket, saveNominee, nextTicketNo,
  };
  return <DashCtx.Provider value={value}>{children}</DashCtx.Provider>;
}

export function useDashboard(): Ctx {
  const c = useContext(DashCtx);
  if (!c) throw new Error("useDashboard must be used inside DashboardDataProvider");
  return c;
}

export const schemeFor = (d: Snapshot, schemeId: string): Scheme | undefined => d.schemes.find((s) => s.id === schemeId);
