"use client";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { formatINR } from "@/lib/money";
import { AsyncView, KpiTile, Panel, PageHeader, SimulatedTag, useLoad } from "./common";
import { useAdminState } from "./AdminState";
import { Skeleton } from "@/components/ui/misc";

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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
    </div>
  );
}

export function OverviewView() {
  const { state, retry } = useLoad(load);
  const { applyLocal } = useAdminState();
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

          return (
            <div className="space-y-5">
              <section aria-label="Key figures" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiTile label="Active schemes" value={String(active)} hint={`${schemes.length} schemes in register`} href="/admin/chits" />
                <KpiTile label="Subscribers" value={String(d.customers.length)} hint={`${d.customers.reduce((s, c) => s + c.memberships, 0)} memberships`} href="/admin/customers" />
                <KpiTile label="Collections recorded" value={formatINR(collected)} hint="Sum of Successful payments (demo)" href="/admin/payments" />
                <KpiTile label="Overdue instalments" value={String(overdue.length)} hint={`${formatINR(overdueAmt)} outstanding`} href="/admin/customers" />
                <KpiTile label="Pending KYC reviews" value={String(kycPending)} hint="Under review / action required" href="/admin/customers" />
                <KpiTile label="Payouts awaiting approval" value={String(payoutsAwaiting)} hint="Awaiting maker or checker" href="/admin/payouts" />
                <KpiTile label="Reconciliation exceptions" value={String(exceptions)} hint={`of ${d.recon.length} rows not matched`} href="/admin/reconciliation" />
                <KpiTile label="Open complaints" value={String(complaints)} hint="Tickets not resolved" href="/admin/support" />
                <KpiTile label="Compliance tasks open" value={String(compOpen)} hint="Not yet 'Evidence attached'" href="/admin/compliance" />
              </section>

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
                          <Bar dataKey="rupees" name="Collected" fill="var(--emerald)" radius={[3, 3, 0, 0]} />
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
                          <Pie data={mix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="var(--white)">
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
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
