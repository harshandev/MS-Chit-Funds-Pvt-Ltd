"use client";
import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { formatINR } from "@/lib/money";
import { AsyncView, KpiTile, Panel, PageHeader, SimulatedTag, useLoad, type KpiDelta } from "./common";
import { RequestTracker } from "./ApprovalTracker";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { useAdminState } from "./AdminState";
import { ShimmerBlock } from "@/components/ui/fx";

async function load() {
  const [schemes, customers, payments, recon, tickets, compliance, basePayouts] = await Promise.all([
    adminExtraService.schemes(), adminService.customers(), adminExtraService.payments(), adminService.recon(),
    adminExtraService.tickets(), adminService.compliance(), adminService.payouts(),
  ]);
  const payouts = await adminExtraService.payouts(basePayouts);
  return { schemes, customers, payments, recon, tickets, compliance, payouts };
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const reconColours: Record<string, string> = {
  Matched: "var(--emerald)", "Amount mismatch": "var(--danger)", "Missing in bank": "var(--warning)", "Missing in ledger": "var(--gold-antique)", "Missing in gateway": "var(--navy)",
};

function OverviewSkeleton() {
  return (
    <div role="status" aria-label="Loading overview" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <ShimmerBlock key={i} className="h-28" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><ShimmerBlock className="h-72" /><ShimmerBlock className="h-72" /></div>
    </div>
  );
}

export function OverviewView() {
  const { state, retry } = useLoad(load);
  const { applyLocal, requests } = useAdminState();
  const reduce = useReducedMotion();
  return (
    <>
      <PageHeader title="Operations overview" description="All figures are computed from illustrative demo data and local session state. Nothing here reflects real money or real schemes." actions={<SimulatedTag label="Demo data" />} />
      <AsyncView state={state} retry={retry} skeleton={<OverviewSkeleton />}>
        {(d) => {
          const schemes = applyLocal(d.schemes);
          const active = schemes.filter((s) => s.status === "Active").length;
          const collected = d.payments.filter((p) => p.status === "Successful").reduce((s, p) => s + p.amount, 0);
          const overdue = d.customers.filter((c) => c.outstanding > 0);
          const overdueAmt = overdue.reduce((s, c) => s + c.outstanding, 0);
          const kycPending = d.customers.filter((c) => c.kyc === "Under review" || c.kyc === "Action required").length;
          const payoutsAwaiting = d.payouts.filter((p) => p.status === "Awaiting maker" || p.status === "Awaiting checker").length;
          const exceptions = d.recon.filter((r) => r.status !== "Matched").length;
          const complaints = d.tickets.filter((t) => t.status !== "Resolved").length;
          const compOpen = d.compliance.filter((t) => t.status !== "Evidence attached").length;

          const byMonth = new Map<string, number>();
          d.payments.filter((p) => p.status === "Successful").forEach((p) => byMonth.set(p.date.slice(0, 7), (byMonth.get(p.date.slice(0, 7)) ?? 0) + p.amount));
          const monthly = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ month: `${monthNames[Number(k.slice(5)) - 1]} ${k.slice(2, 4)}`, rupees: v / 100 }));
          const mix = Object.entries(d.recon.reduce<Record<string, number>>((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }));

          const last = monthly[monthly.length - 1], prev = monthly[monthly.length - 2];
          const momDelta: KpiDelta | undefined = last && prev && prev.rupees > 0
            ? (() => { const pct = ((last.rupees - prev.rupees) / prev.rupees) * 100; return { text: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% MoM`, tone: pct > 0 ? "up" : pct < 0 ? "down" : "flat", arrow: pct !== 0 } as KpiDelta; })()
            : undefined;
          const openRequests = requests.filter((r) => r.state === "Pending approval");

          return (
            <div className="space-y-5">
              <Stagger gap={0.05} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StaggerItem><KpiTile label="Active schemes" value={String(active)} count={active} hint={`${schemes.length} schemes in register`} delta={{ text: `${schemes.length - active} not active`, tone: "flat" }} href="/admin/chits" /></StaggerItem>
                <StaggerItem><KpiTile label="Subscribers" value={String(d.customers.length)} count={d.customers.length} hint={`${d.customers.reduce((s, c) => s + c.memberships, 0)} memberships`} href="/admin/customers" /></StaggerItem>
                <StaggerItem><KpiTile label="Collections recorded" value={formatINR(collected)} count={collected} format={(n) => formatINR(Math.round(n))} hint="Sum of Successful payments (demo)" delta={momDelta} spark={monthly.length > 1 ? monthly.map((m) => m.rupees) : undefined} sparkLabel="Successful collections by month" href="/admin/payments" /></StaggerItem>
                <StaggerItem><KpiTile label="Overdue instalments" value={String(overdue.length)} count={overdue.length} hint={`${formatINR(overdueAmt)} outstanding`} delta={overdue.length ? { text: "Follow up", tone: "warn" } : { text: "Clear", tone: "ok" }} href="/admin/customers" /></StaggerItem>
                <StaggerItem><KpiTile label="Pending KYC reviews" value={String(kycPending)} count={kycPending} hint="Under review / action required" delta={kycPending ? { text: "Needs review", tone: "warn" } : { text: "Clear", tone: "ok" }} href="/admin/customers" /></StaggerItem>
                <StaggerItem><KpiTile label="Payouts awaiting approval" value={String(payoutsAwaiting)} count={payoutsAwaiting} hint="Awaiting maker or checker" delta={payoutsAwaiting ? { text: "Maker-checker", tone: "warn" } : { text: "Clear", tone: "ok" }} href="/admin/payouts" /></StaggerItem>
                <StaggerItem><KpiTile label="Reconciliation exceptions" value={String(exceptions)} count={exceptions} hint={`of ${d.recon.length} rows not matched`} delta={{ text: `${d.recon.length ? Math.round((exceptions / d.recon.length) * 100) : 0}% of rows`, tone: exceptions ? "warn" : "ok" }} href="/admin/reconciliation" /></StaggerItem>
                <StaggerItem><KpiTile label="Open complaints" value={String(complaints)} count={complaints} hint="Tickets not resolved" delta={complaints ? { text: "Open", tone: "warn" } : { text: "Clear", tone: "ok" }} href="/admin/support" /></StaggerItem>
                <StaggerItem><KpiTile label="Compliance tasks open" value={String(compOpen)} count={compOpen} hint="Not yet 'Evidence attached'" delta={compOpen ? { text: "Evidence due", tone: "warn" } : { text: "Clear", tone: "ok" }} href="/admin/compliance" /></StaggerItem>
              </Stagger>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Collections by month (successful payments, demo)">
                  <figure>
                    <div role="img" aria-label={`Bar chart of successful collections by month: ${monthly.map((m) => `${m.month} ${formatINR(m.rupees * 100)}`).join(", ")}.`} className="h-64">
                      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 256 }}>
                        <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="var(--line)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} stroke="var(--line)" />
                          <YAxis tick={{ fill: "var(--ink-muted)", fontSize: 12 }} stroke="var(--line)" tickFormatter={(v: number) => `₹${v / 1000}k`} width={48} />
                          <Tooltip formatter={(v) => formatINR(Number(v) * 100)} cursor={{ fill: "var(--emerald-50)" }} />
                          <Bar dataKey="rupees" name="Collected" fill="var(--emerald)" radius={[6, 6, 0, 0]} isAnimationActive={!reduce} animationDuration={900} animationEasing="ease-out" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <figcaption className="sr-only">Data table alternative follows.</figcaption>
                    <table className="sr-only"><caption>Collections by month</caption><thead><tr><th>Month</th><th>Collected</th></tr></thead>
                      <tbody>{monthly.map((m) => <tr key={m.month}><td>{m.month}</td><td>{formatINR(m.rupees * 100)}</td></tr>)}</tbody></table>
                  </figure>
                </Panel>
                <Panel title="Reconciliation status mix">
                  <figure>
                    <div role="img" aria-label={`Donut chart of reconciliation rows by status: ${mix.map((m) => `${m.name} ${m.value}`).join(", ")}.`} className="h-64">
                      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 256 }}>
                        <PieChart>
                          <Pie data={mix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="var(--white)" isAnimationActive={!reduce} animationDuration={1000} animationEasing="ease-out">
                            {mix.map((m) => <Cell key={m.name} fill={reconColours[m.name] ?? "var(--gold)"} />)}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <figcaption className="sr-only">Data table alternative follows.</figcaption>
                    <table className="sr-only"><caption>Reconciliation status counts</caption><thead><tr><th>Status</th><th>Rows</th></tr></thead>
                      <tbody>{mix.map((m) => <tr key={m.name}><td>{m.name}</td><td>{m.value}</td></tr>)}</tbody></table>
                  </figure>
                </Panel>
              </div>

              <Panel title="Open approvals (maker-checker, simulated)" actions={<SimulatedTag />}>
                {openRequests.length === 0 ? <p className="text-xs text-muted">No scheme requests are waiting for a checker.</p> : (
                  <ul className="divide-y divide-line/70">
                    {openRequests.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="min-w-0 text-[13px]"><strong className="text-navy">{schemes.find((x) => x.id === r.schemeId)?.name ?? r.schemeId}</strong><span className="block text-xs text-muted">{r.from} → {r.to} · raised by {r.raisedBy}</span></span>
                        <RequestTracker request={r} />
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
