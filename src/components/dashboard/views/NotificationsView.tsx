"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";
import type { AppNotification } from "@/data/types";
import { DataGate, FilterChips, PageHeader, Surface } from "../ui";
import { useDashboard, type Snapshot } from "../DashboardData";
import { formatDateTime } from "../format";

const cats: AppNotification["category"][] = ["Payment", "Auction", "Document", "KYC", "Support", "General"];
const THRESHOLD = 90;

function Item({ n }: { n: AppNotification }) {
  const { markRead } = useDashboard();
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const hint = useTransform(x, [0, THRESHOLD], [0, 1]);
  const dragged = useRef(false);
  const canSwipe = !n.read && !reduce;
  return (
    <motion.li layout={!reduce} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, x: 40 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="relative overflow-hidden rounded-2xl">
      {canSwipe && (
        <motion.div aria-hidden style={{ opacity: hint }} className="absolute inset-0 flex items-center gap-2 rounded-2xl bg-emerald pl-5 text-sm font-bold text-ivory"><Check className="h-5 w-5" />Mark read</motion.div>
      )}
      <motion.div style={{ x }} drag={canSwipe ? "x" : false} dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.5 }}
        onDragStart={() => { dragged.current = true; }}
        onDragEnd={(_, info) => { if (info.offset.x > THRESHOLD) markRead(n.id); window.setTimeout(() => { dragged.current = false; }, 50); }}
        onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); } }}
        className="relative touch-pan-y">
        <Surface className={n.read ? "" : "border-gold/60 bg-linear-to-r from-gold/10 to-white"}>
          <CardBody className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.read ? "bg-line/60 text-muted" : "bg-gold/25 text-gold-antique"}`}><Bell className="h-5 w-5" aria-hidden /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><Badge tone="info">{n.category}</Badge><Badge tone={n.read ? "neutral" : "gold"}>{n.read ? "Read" : "Unread"}</Badge><time dateTime={n.at} className="text-xs text-muted">{formatDateTime(n.at)}</time></div>
                <h2 className="mt-2 text-sm font-bold text-ink">{n.title}</h2>
                <p className="mt-1 text-sm text-muted">{n.body}</p>
                <Link href={n.href} onClick={() => markRead(n.id)} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-emerald hover:underline">Go to details<span className="sr-only"> for {n.title}</span></Link>
              </div>
            </div>
            {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark as read<span className="sr-only">: {n.title}</span></Button>}
          </CardBody>
        </Surface>
      </motion.div>
    </motion.li>
  );
}

function Notifications({ d }: { d: Snapshot }) {
  const { markAllRead, unreadCount } = useDashboard();
  const [cat, setCat] = useState<"all" | AppNotification["category"]>("all");
  const [sort, setSort] = useState<"new" | "unread">("new");
  const list = [...d.notifications].filter((n) => cat === "all" || n.category === cat)
    .sort((a, b) => (sort === "unread" && a.read !== b.read ? (a.read ? 1 : -1) : b.at.localeCompare(a.at)));
  return (
    <>
      <PageHeader title="Notifications" intro="Updates about payments, auctions, documents and verification. Read state is kept locally in this demo. On touch screens, swipe an unread card to the right to mark it read."
        actions={<Button variant="secondary" onClick={markAllRead} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4" aria-hidden />Mark all read</Button>} />
      <div className="mb-5 space-y-3">
        <FilterChips label="Filter by category" value={cat} onChange={setCat}
          options={[{ value: "all", label: "All", count: d.notifications.length }, ...cats.map((c) => ({ value: c, label: c, count: d.notifications.filter((n) => n.category === c).length }))]} />
        <FilterChips label="Sort order" value={sort} onChange={setSort} options={[{ value: "new", label: "Newest first" }, { value: "unread", label: "Unread first" }]} />
      </div>
      <p className="mb-3 text-sm text-muted" aria-live="polite"><span className="tabular-nums">{unreadCount}</span> unread · <span className="tabular-nums">{list.length}</span> shown</p>
      {list.length === 0 ? <EmptyState title="No notifications" text={cat === "all" ? "You have no notifications." : `No ${cat} notifications.`} /> : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>{list.map((n) => <Item key={n.id} n={n} />)}</AnimatePresence>
        </ul>
      )}
    </>
  );
}

export function NotificationsView() { return <DataGate>{(d) => <Notifications d={d} />}</DataGate>; }
