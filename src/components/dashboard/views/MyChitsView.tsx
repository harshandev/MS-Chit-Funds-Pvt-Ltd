"use client";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { useTr } from "@/i18n/LanguageProvider";
import { DataGate, PageHeader } from "../ui";
import { schemeFor } from "../DashboardData";
import { MembershipCard } from "../MembershipCard";

export function MyChitsView() {
  const tr = useTr();
  return (
    <>
      <PageHeader title={tr("My chits")} intro={tr("Your memberships, instalment progress and upcoming obligations. Future obligation is the remaining instalments × the scheme instalment (illustrative, before any dividend).")} />
      <DataGate>{(d) => d.memberships.length === 0 ? (
        <EmptyState title={tr("You have no memberships yet")} text={tr("Once you enrol in a scheme, your tickets will appear here.")} action={<Button href="/register">{tr("Start enrolment")}</Button>} />
      ) : (
        <Stagger className="grid gap-5 md:grid-cols-2">
          {d.memberships.map((m) => { const s = schemeFor(d, m.schemeId); return s ? <StaggerItem key={m.id}><MembershipCard m={m} s={s} /></StaggerItem> : null; })}
        </Stagger>
      )}</DataGate>
    </>
  );
}
