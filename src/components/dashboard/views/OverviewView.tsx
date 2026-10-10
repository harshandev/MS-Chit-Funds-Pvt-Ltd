"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Wallet, CalendarClock, Layers, PiggyBank, Trophy, BellRing, Gavel, Receipt, Plus, CircleDot } from "lucide-react";
import { CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { AnimatedCheck } from "@/components/ui/fx";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StepTracker } from "@/components/ui/StepTracker";
import { CountUp } from "@/components/motion/CountUp";
import { Magnetic } from "@/components/motion/Magnetic";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { formatINR, formatINRPrecise, formatBps } from "@/lib/money";
import { useTr } from "@/i18n/LanguageProvider";
import { DataGate, PanelTitle, StatCard, StatusChip, Surface } from "../ui";
import { schemeFor, useDashboard, type Snapshot } from "../DashboardData";
import { computeSummary, contributionSeries, dividendSeries, type PendingAction } from "../summary";
import { useDates, greeting } from "../format";
import { ContributionsChart } from "../ContributionsChart";
import { MembershipCard, membershipMetrics } from "../MembershipCard";
import { auctionSteps } from "../auctionSteps";

function PendingList({ items }: { items: PendingAction[] }) {
  const { markRead } = useDashboard();
  const reduce = useReducedMotion();
  const tr = useTr();
  const [checking, setChecking] = useState<ReadonlySet<string>>(new Set());
  const timers = useRef<number[]>([]);
  const check = (a: PendingAction) => {
    setChecking((s) => new Set(s).add(a.id));
    timers.current.push(window.setTimeout(() => markRead(a.id.replace(/^n-/, "")), reduce ? 0 : 900));
  };
  return (
    <ul className="divide-y divide-line">
      <AnimatePresence initial={false}>
        {items.map((a) => {
          const isNote = a.id.startsWith("n-");
          const done = checking.has(a.id);
          return (
            <motion.li key={a.id} layout={!reduce} exit={reduce ? undefined : { opacity: 0, x: 24, height: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 overflow-hidden">
              {isNote ? (
                <button type="button" onClick={() => check(a)} disabled={done} aria-label={tr("Mark as read: {title}", { title: a.label })}
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-emerald disabled:text-success">
                  {done ? <AnimatedCheck size={24} /> : <span className="h-5 w-5 rounded-full border-2 border-current" />}
                </button>
              ) : <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center text-gold-antique"><CircleDot className="h-5 w-5" /></span>}
              <Link href={a.href} className="group flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 py-3">
                <span className={`min-w-0 transition-opacity ${done ? "opacity-50" : ""}`}><span className={`block text-sm font-semibold group-hover:text-emerald ${done ? "line-through" : ""}`}>{a.label}</span><span className="block text-xs text-muted">{a.detail}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-gold-antique transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function Overview({ d }: { d: Snapshot }) {
  const router = useRouter();
  const tr = useTr();
  const { formatDate, formatDateTime } = useDates();
  const { setPayIntent } = useDashboard();
  const s = computeSummary(d, tr);
  const recent = [...d.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const ua = s.upcomingAuction;
  const uaScheme = ua ? schemeFor(d, ua.schemeId) : undefined;
  const uaSteps = ua ? auctionSteps(ua.state, tr) : null;
  const first = d.customer.name;
  const progressVals = s.liable.map((m) => { const sc = schemeFor(d, m.schemeId); return sc ? membershipMetrics(m, sc).progress : 0; });
  const avgProgress = progressVals.length ? progressVals.reduce((a, b) => a + b, 0) / progressVals.length : 0;
  const contribSpark = contributionSeries(d.payments);
  const divSpark = dividendSeries(d);

  return (
    <>
      <section aria-label={tr("Wallet summary")} className="grain relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald p-6 text-ivory shadow-[var(--shadow-3)] sm:p-8">
        <div aria-hidden className="aurora pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
        <div aria-hidden className="aurora pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-emerald-700/60 blur-3xl [animation-delay:-8s]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{tr(greeting())}</p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{tr("Welcome, {name}", { name: first })}</h1>
            <p className="mt-1 max-w-xl text-sm text-ivory/70">{tr("A summary of your demo memberships, payments and auctions. All figures are derived from simulated data.")}</p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/60">{tr("Recorded contributions")}</p>
            <p className="font-heading text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl"><CountUp value={s.totalContributions} format={(n) => formatINR(Math.round(n))} duration={1.6} /></p>
            <p className="mt-1 text-xs text-ivory/60">{tr("Sum of {n} payments with status Successful only", { n: s.successfulCount })}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic><button type="button" onClick={() => { setPayIntent(true); router.push("/dashboard/payments"); }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-navy shadow-[0_8px_24px_-8px_rgb(212_175_55/0.7)] transition-colors hover:bg-gold-soft"><Plus className="h-4 w-4 shrink-0" aria-hidden />{tr("Pay instalment (simulated)")}</button></Magnetic>
              <Link href="/dashboard/my-chits" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ivory/25 px-5 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10">{tr("My chits")}<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[22rem] lg:grid-cols-1">
            <div className="rounded-2xl border border-ivory/10 bg-ivory/8 p-4 backdrop-blur-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ivory/60"><CalendarClock className="h-3.5 w-3.5 text-gold" aria-hidden />{tr("Instalment due")}</p>
              <p className="mt-1 font-heading text-xl font-extrabold tabular-nums">{s.nextDueDate ? <CountUp value={s.nextDueAmount} format={(n) => formatINR(Math.round(n))} /> : tr("Nothing due")}</p>
              <p className="text-xs text-ivory/60">{s.nextDueDate ? tr(s.nextDueCount > 1 ? "Due {date} · {n} memberships" : "Due {date}", { date: formatDate(s.nextDueDate), n: s.nextDueCount }) : tr("No active membership")}</p>
            </div>
            <div className="rounded-2xl border border-ivory/10 bg-ivory/8 p-4 backdrop-blur-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ivory/60"><PiggyBank className="h-3.5 w-3.5 text-gold" aria-hidden />{tr("Applicable dividends")}</p>
              <p className="mt-1 font-heading text-xl font-extrabold tabular-nums"><CountUp value={s.dividends} format={(n) => formatINR(Math.round(n))} /></p>
              <p className="text-xs text-ivory/60">{tr("Illustrative, demo calculator")}</p>
            </div>
            <div className="col-span-2 flex items-center gap-4 rounded-2xl border border-ivory/10 bg-ivory/8 p-4 backdrop-blur-sm sm:col-span-1">
              <ProgressRing value={avgProgress} size={56} stroke={6} color="var(--gold)" track="rgb(248 246 239 / 0.15)" label={tr("Average {p}% of instalments completed across active tickets", { p: Math.round(avgProgress) })}>
                <span className="text-xs font-bold tabular-nums">{Math.round(avgProgress)}%</span>
              </ProgressRing>
              <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ivory/60">{tr("Instalments completed")}</p><p className="text-xs text-ivory/60">{tr(s.activeCount === 1 ? "Average across {n} active ticket" : "Average across {n} active tickets", { n: s.activeCount })}</p></div>
            </div>
          </div>
        </div>
      </section>

      <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" gap={0.07}>
        <StaggerItem><StatCard label={tr("Active memberships")} value={<CountUp value={s.activeCount} />} icon={<Layers className="h-4 w-4" />} ring={{ value: avgProgress, label: tr("{p}% average instalments completed", { p: Math.round(avgProgress) }) }} hint={tr("{n} more awaiting enrolment or inactive", { n: d.memberships.length - s.activeCount })} /></StaggerItem>
        <StaggerItem><StatCard label={tr("Recorded contributions")} icon={<Wallet className="h-4 w-4" />} value={<CountUp value={s.totalContributions} format={(n) => formatINR(Math.round(n))} />} spark={contribSpark.length > 1 ? contribSpark : undefined} sparkLabel={tr("Cumulative successful contributions by instalment")} hint={tr("Sum of {n} payments with status Successful only", { n: s.successfulCount })} /></StaggerItem>
        <StaggerItem><StatCard label={tr("Instalment due")} accent icon={<CalendarClock className="h-4 w-4" />}
          value={s.nextDueDate ? <CountUp value={s.nextDueAmount} format={(n) => formatINR(Math.round(n))} /> : tr("Nothing due")}
          hint={s.nextDueDate ? tr(s.nextDueCount > 1 ? "Next due date {date} · {n} memberships" : "Next due date {date}", { date: formatDate(s.nextDueDate), n: s.nextDueCount }) : tr("No active membership")} /></StaggerItem>
        <StaggerItem><StatCard label={tr("Applicable dividends")} icon={<PiggyBank className="h-4 w-4" />} value={<CountUp value={s.dividends} format={(n) => formatINR(Math.round(n))} />} spark={divSpark.length > 1 ? divSpark : undefined} sparkLabel={tr("Cumulative illustrative dividends by instalment")} hint={tr("Illustrative, from published auctions via the demo calculator")} /></StaggerItem>
        <StaggerItem><StatCard label={tr("Prize status")} icon={<Trophy className="h-4 w-4" />} value={s.prizeText} hint={tr("Across your active tickets")} /></StaggerItem>
        <StaggerItem><StatCard label={tr("Pending actions")} icon={<BellRing className="h-4 w-4" />} value={<CountUp value={s.pendingActions.length} />} hint={tr(s.reconCount === 1 ? "Unread notifications, KYC and {n} payment under reconciliation" : "Unread notifications, KYC and {n} payments under reconciliation", { n: s.reconCount })} /></StaggerItem>
      </Stagger>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Surface className="lg:col-span-3">
          <CardBody>
            <PanelTitle id="chart-h">{tr("Payments by instalment")}</PanelTitle>
            {d.payments.length === 0 ? <EmptyState title={tr("No payments yet")} text={tr("Payments will appear here once recorded.")} /> : <ContributionsChart payments={d.payments} />}
            <p className="mt-2 text-xs text-muted">{tr("Only Successful payments count towards recorded contributions.")}</p>
          </CardBody>
        </Surface>

        <Surface className="relative overflow-hidden bg-linear-to-br from-white to-emerald-50 lg:col-span-2">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
          <CardBody className="relative">
            <PanelTitle id="auction-h">{tr("Upcoming auction")}</PanelTitle>
            {ua && uaScheme ? (
              <div>
                <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/25 text-gold-antique"><Gavel className="h-5 w-5" aria-hidden /></span><StatusChip status={ua.state} /><span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ivory">{tr("SIMULATED")}</span></div>
                <p className="mt-3 font-heading font-bold text-ink">{tr(uaScheme.name)}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{tr("Instalment {n} · scheduled for", { n: ua.instalmentNo })}</p>
                <p className="font-heading text-xl font-extrabold tabular-nums text-emerald">{formatDateTime(ua.scheduledAt)}</p>
                {uaSteps && <StepTracker steps={uaSteps} label={tr("Auction progress")} compact className="mt-4" />}
                <p className="mt-4 text-sm text-muted">{tr("Max discount {pct} of gross chit {amt}. Only the scheduled time is shown; no countdown is authoritative.", { pct: formatBps(uaScheme.rules.maxDiscountBps), amt: formatINR(uaScheme.rules.grossChit) })}</p>
                <Button href={`/dashboard/auctions/${ua.id}`} className="mt-4" variant={ua.state === "Open" ? "primary" : "secondary"}>{ua.state === "Open" ? tr("Open auction") : tr("View schedule")}</Button>
              </div>
            ) : <EmptyState title={tr("No upcoming auction")} text={tr("Scheduled auctions for your schemes will show here.")} />}
          </CardBody>
        </Surface>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Surface>
          <CardBody>
            <PanelTitle id="pending-h" action={<Link href="/dashboard/notifications" className="text-sm font-semibold text-emerald hover:underline">{tr("All notifications")}</Link>}>{tr("Pending actions")}</PanelTitle>
            {s.pendingActions.length === 0 ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-success"><AnimatedCheck size={22} />{tr("You are all caught up.")}</motion.p>
            ) : <PendingList items={s.pendingActions} />}
          </CardBody>
        </Surface>

        <Surface>
          <CardBody>
            <PanelTitle id="recent-h" action={<Link href="/dashboard/payments" className="text-sm font-semibold text-emerald hover:underline">{tr("All payments")}</Link>}>{tr("Recent payments")}</PanelTitle>
            {recent.length === 0 ? <p className="text-sm text-muted">{tr("No payments recorded.")}</p> : (
              <Stagger gap={0.06}>
                <ul className="divide-y divide-line">
                  {recent.map((p) => (
                    <li key={p.id}><StaggerItem className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald"><Receipt className="h-4 w-4" aria-hidden /></span>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold tabular-nums">{formatINRPrecise(p.amount)} · {tr("Instalment {n}", { n: p.instalmentNo })}</p><p className="text-xs text-muted">{formatDate(p.date)} · {tr(p.method)}</p></div>
                      </div>
                      <StatusChip status={p.status} />
                    </StaggerItem></li>
                  ))}
                </ul>
              </Stagger>
            )}
          </CardBody>
        </Surface>
      </div>

      <section className="mt-8" aria-labelledby="mem-h">
        <PanelTitle id="mem-h" action={<Link href="/dashboard/my-chits" className="text-sm font-semibold text-emerald hover:underline">{tr("View all")}</Link>}>{tr("My memberships")}</PanelTitle>
        {d.memberships.length === 0 ? <EmptyState title={tr("No memberships yet")} text={tr("Enrol in a scheme to see it here.")} action={<Button href="/register">{tr("Get started")}</Button>} /> : (
          <Stagger className="grid gap-4 md:grid-cols-2">
            {d.memberships.map((m) => { const sc = schemeFor(d, m.schemeId); return sc ? <StaggerItem key={m.id}><MembershipCard m={m} s={sc} compact /></StaggerItem> : null; })}
          </Stagger>
        )}
      </section>
    </>
  );
}

export function OverviewView() { return <DataGate>{(d) => <Overview d={d} />}</DataGate>; }
