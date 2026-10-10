"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import type { AppNotification } from "@/data/types";
import { DataGate, FilterChips, PageHeader } from "../ui";
import { useDashboard, type Snapshot } from "../DashboardData";
import { formatDateTime } from "../format";

const cats: AppNotification["category"][] = ["Payment", "Auction", "Document", "KYC", "Support", "General"];

function Notifications({ d }: { d: Snapshot }) {
  const { markRead, markAllRead, unreadCount } = useDashboard();
  const [cat, setCat] = useState<"all" | AppNotification["category"]>("all");
  const list = [...d.notifications].filter((n) => cat === "all" || n.category === cat).sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <PageHeader title="Notifications" intro="Updates about payments, auctions, documents and verification. Read state is kept locally in this demo."
        actions={<Button variant="secondary" onClick={markAllRead} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4" aria-hidden />Mark all read</Button>} />
      <div className="mb-5">
        <FilterChips label="Filter by category" value={cat} onChange={setCat}
          options={[{ value: "all", label: "All", count: d.notifications.length }, ...cats.map((c) => ({ value: c, label: c, count: d.notifications.filter((n) => n.category === c).length }))]} />
      </div>
      <p className="mb-3 text-sm text-muted" aria-live="polite">{unreadCount} unread · {list.length} shown</p>
      {list.length === 0 ? <EmptyState title="No notifications" text={cat === "all" ? "You have no notifications." : `No ${cat} notifications.`} /> : (
        <ul className="space-y-3">
          {list.map((n) => (
            <li key={n.id}>
              <Card className={n.read ? "" : "border-gold/60 bg-gold/5"}>
                <CardBody className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Bell className={n.read ? "mt-0.5 h-5 w-5 shrink-0 text-muted" : "mt-0.5 h-5 w-5 shrink-0 text-gold-antique"} aria-hidden />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><Badge tone="info">{n.category}</Badge><Badge tone={n.read ? "neutral" : "gold"}>{n.read ? "Read" : "Unread"}</Badge><time dateTime={n.at} className="text-xs text-muted">{formatDateTime(n.at)}</time></div>
                      <h2 className="mt-2 text-sm font-bold text-ink">{n.title}</h2>
                      <p className="mt-1 text-sm text-muted">{n.body}</p>
                      <Link href={n.href} onClick={() => markRead(n.id)} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-emerald hover:underline">Go to details<span className="sr-only"> for {n.title}</span></Link>
                    </div>
                  </div>
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark as read<span className="sr-only">: {n.title}</span></Button>}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function NotificationsView() { return <DataGate>{(d) => <Notifications d={d} />}</DataGate>; }
