"use client";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { DataGate, PageHeader } from "../ui";
import { schemeFor } from "../DashboardData";
import { MembershipCard } from "../MembershipCard";

export function MyChitsView() {
  return (
    <>
      <PageHeader title="My chits" intro="Your memberships, instalment progress and upcoming obligations. Future obligation is the remaining instalments × the scheme instalment (illustrative, before any dividend)." />
      <DataGate>{(d) => d.memberships.length === 0 ? (
        <EmptyState title="You have no memberships yet" text="Once you enrol in a scheme, your tickets will appear here." action={<Button href="/register">Start enrolment</Button>} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {d.memberships.map((m) => { const s = schemeFor(d, m.schemeId); return s ? <li key={m.id} className="flex"><div className="flex-1"><MembershipCard m={m} s={s} /></div></li> : null; })}
        </ul>
      )}</DataGate>
    </>
  );
}
