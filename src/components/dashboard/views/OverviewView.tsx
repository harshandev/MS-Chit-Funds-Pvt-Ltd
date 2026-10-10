"use client";
import Link from "next/link";
import { ArrowRight, Wallet, CalendarClock, Layers, PiggyBank, Trophy, BellRing, Gavel, Receipt } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { formatINR, formatINRPrecise, formatBps } from "@/lib/money";
import { DataGate, PageHeader, PanelTitle, StatCard } from "../ui";
import { schemeFor, type Snapshot } from "../DashboardData";
import { computeSummary } from "../summary";
import { formatDate, formatDateTime } from "../format";
import { ContributionsChart } from "../ContributionsChart";
import { MembershipCard } from "../MembershipCard";

function Overview({ d }: { d: Snapshot }) {
  const s = computeSummary(d);
  const recent = [...d.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const ua = s.upcomingAuction;
  const uaScheme = ua ? schemeFor(d, ua.schemeId) : undefined;
  const first = d.customer.name;

  return (
    <>
      <PageHeader title={`Welcome, ${first}`} intro="A summary of your demo memberships, payments and auctions. All figures are derived from simulated data." />

      <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active memberships" value={s.activeCount} icon={<Layers className="h-5 w-5" />} hint={`${d.memberships.length - s.activeCount} more awaiting enrolment or inactive`} />
        <StatCard label="Instalment due" accent icon={<CalendarClock className="h-5 w-5" />}
          value={s.nextDueDate ? formatINR(s.nextDueAmount) : "Nothing due"}
          hint={s.nextDueDate ? `Next due date ${formatDate(s.nextDueDate)}${s.nextDueCount > 1 ? ` · ${s.nextDueCount} memberships` : ""}` : "No active membership"} />
        <StatCard label="Recorded contributions" icon={<Wallet className="h-5 w-5" />} value={formatINR(s.totalContributions)} hint={`Sum of ${s.successfulCount} payments with status Successful only`} />
        <StatCard label="Applicable dividends" icon={<PiggyBank className="h-5 w-5" />} value={formatINR(s.dividends)} hint="Illustrative, from published auctions via the demo calculator" />
        <StatCard label="Prize status" icon={<Trophy className="h-5 w-5" />} value={s.prizeText} hint="Across your active tickets" />
        <StatCard label="Pending actions" icon={<BellRing className="h-5 w-5" />} value={s.pendingActions.length} hint={`Unread notifications, KYC and ${s.reconCount} payment${s.reconCount === 1 ? "" : "s"} under reconciliation`} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody>
            <PanelTitle id="chart-h">Payments by instalment</PanelTitle>
            {d.payments.length === 0 ? <EmptyState title="No payments yet" text="Payments will appear here once recorded." /> : <ContributionsChart payments={d.payments} />}
            <p className="mt-2 text-xs text-muted">Only Successful payments count towards recorded contributions.</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <PanelTitle id="auction-h">Upcoming auction</PanelTitle>
            {ua && uaScheme ? (
              <div>
                <div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-gold-antique" aria-hidden /><StatusBadge status={ua.state} /><span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ivory">SIMULATED</span></div>
                <p className="mt-3 font-heading font-bold text-ink">{uaScheme.name}</p>
                <p className="text-sm text-muted">Instalment {ua.instalmentNo} · scheduled {formatDateTime(ua.scheduledAt)}</p>
                <p className="mt-2 text-sm text-muted">Max discount {formatBps(uaScheme.rules.maxDiscountBps)} of gross chit {formatINR(uaScheme.rules.grossChit)}.</p>
                <Button href={`/dashboard/auctions/${ua.id}`} className="mt-4" variant={ua.state === "Open" ? "primary" : "secondary"}>{ua.state === "Open" ? "Open auction" : "View schedule"}</Button>
              </div>
            ) : <EmptyState title="No upcoming auction" text="Scheduled auctions for your schemes will show here." />}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <PanelTitle id="pending-h" action={<Link href="/dashboard/notifications" className="text-sm font-semibold text-emerald hover:underline">All notifications</Link>}>Pending actions</PanelTitle>
            {s.pendingActions.length === 0 ? <p className="text-sm text-muted">You are all caught up.</p> : (
              <ul className="divide-y divide-line">
                {s.pendingActions.map((a) => (
                  <li key={a.id}>
                    <Link href={a.href} className="flex min-h-11 items-center justify-between gap-3 py-3 hover:text-emerald">
                      <span className="min-w-0"><span className="block text-sm font-semibold">{a.label}</span><span className="block text-xs text-muted">{a.detail}</span></span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gold-antique" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <PanelTitle id="recent-h" action={<Link href="/dashboard/payments" className="text-sm font-semibold text-emerald hover:underline">All payments</Link>}>Recent payments</PanelTitle>
            {recent.length === 0 ? <p className="text-sm text-muted">No payments recorded.</p> : (
              <ul className="divide-y divide-line">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Receipt className="h-5 w-5 shrink-0 text-gold-antique" aria-hidden />
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{formatINRPrecise(p.amount)} · Instalment {p.instalmentNo}</p><p className="text-xs text-muted">{formatDate(p.date)} · {p.method}</p></div>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <section className="mt-8" aria-labelledby="mem-h">
        <PanelTitle id="mem-h" action={<Link href="/dashboard/my-chits" className="text-sm font-semibold text-emerald hover:underline">View all</Link>}>My memberships</PanelTitle>
        {d.memberships.length === 0 ? <EmptyState title="No memberships yet" text="Enrol in a scheme to see it here." action={<Button href="/register">Get started</Button>} /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {d.memberships.map((m) => { const sc = schemeFor(d, m.schemeId); return sc ? <MembershipCard key={m.id} m={m} s={sc} compact /> : null; })}
          </div>
        )}
      </section>
    </>
  );
}

export function OverviewView() { return <DataGate>{(d) => <Overview d={d} />}</DataGate>; }
