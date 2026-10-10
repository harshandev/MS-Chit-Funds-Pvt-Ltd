"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Circle } from "lucide-react";
import { AnimatedCheck, SuccessNote } from "@/components/ui/fx";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { DemoNote } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import type { VerificationStatus } from "@/data/types";
import { useTr } from "@/i18n/LanguageProvider";
import { DataGate, DefList, PageHeader, PanelTitle, Surface } from "../ui";
import { useDashboard, type Snapshot } from "../DashboardData";

type Tr = (en: string, vars?: Record<string, string | number>) => string;
const makeSchema = (tr: Tr) => z.object({
  name: z.string().trim().min(2, tr("Enter the nominee's full name.")).max(80, tr("Name is too long.")).regex(/^[\p{L}\p{M} .'-]+$/u, tr("Use letters only.")),
  relationship: z.string().trim().min(2, tr("Enter the relationship.")).max(40, tr("Relationship is too long.")),
});
type Form = z.infer<ReturnType<typeof makeSchema>>;

function StatusCard({ title, status, why, next }: { title: string; status: VerificationStatus; why: string; next: string }) {
  const tr = useTr();
  return (
    <Surface><CardBody>
      <div className="flex items-start justify-between gap-3"><h2 className="font-bold text-emerald">{title}</h2><StatusBadge status={status} /></div>
      <p className="mt-2 text-sm text-muted"><strong className="text-ink">{tr("Why it is needed:")} </strong>{why}</p>
      <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-[#6b5400]">{tr("Integration required: {next}", { next })}</p>
    </CardBody></Surface>
  );
}

function NomineeForm({ onSaved }: { onSaved: () => void }) {
  const { nominee, saveNominee } = useDashboard();
  const toast = useToast();
  const tr = useTr();
  const schema = makeSchema(tr);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: nominee?.name ?? "", relationship: nominee?.relationship === "Not recorded" ? "" : nominee?.relationship ?? "" } });
  return (
    <form noValidate onSubmit={handleSubmit((v) => { saveNominee(v); onSaved(); toast(tr("Nominee saved locally (demo). It is not verified.")); })} className="space-y-4">
      <TextField label={tr("Nominee full name")} autoComplete="off" error={errors.name?.message} {...register("name")} />
      <TextField label={tr("Relationship to you")} autoComplete="off" error={errors.relationship?.message} {...register("relationship")} />
      <Button type="submit">{tr("Save nominee")}</Button>
    </form>
  );
}

function Profile({ d }: { d: Snapshot }) {
  const tr = useTr();
  const { nominee } = useDashboard();
  const [saved, setSaved] = useState(false);
  const c = d.customer;
  const agreement = d.documents.find((x) => x.category === "Agreement");
  const checklist: { label: string; status: string; why: string }[] = [
    { label: tr("Identity verification (KYC)"), status: c.kyc, why: tr("Required by regulation to confirm who you are before payouts.") },
    { label: tr("Bank account verification"), status: c.bank, why: tr("Confirms prize and refund payouts go to an account in your name.") },
    { label: tr("Nominee declaration"), status: nominee ? "Under review" : "Not started", why: tr("Records who may be contacted if something happens to you.") },
    { label: tr("Signed chit agreement"), status: agreement?.fileUrl ? "Verified" : "Pending", why: tr("The legal contract between you and the company.") },
  ];
  const done = checklist.filter((x) => x.status === "Verified").length;
  return (
    <>
      <PageHeader title={tr("Profile and verification")} intro={tr("Your details, verification status and nominee. This demo never collects PAN, Aadhaar, ID numbers or bank credentials.")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface><CardBody>
          <PanelTitle>{tr("Personal information")}</PanelTitle>
          <DefList rows={[{ label: tr("Name"), value: c.name }, { label: tr("Mobile"), value: c.mobile }, { label: tr("Email"), value: c.email }, { label: tr("Memberships"), value: d.memberships.length }]} />
          <p className="mt-3 text-xs text-muted">{tr("Contact details are masked demo values. Changing them requires a verified backend flow.")}</p>
        </CardBody></Surface>
        <Surface><CardBody>
          <PanelTitle>{tr("Document checklist")}</PanelTitle>
          <div className="mb-4 flex items-center gap-3"><ProgressRing value={(done / checklist.length) * 100} size={48} stroke={5} label={tr("{n} of {m} verified", { n: done, m: checklist.length })}><span className="text-[11px] font-bold tabular-nums text-emerald">{done}/{checklist.length}</span></ProgressRing><p className="text-sm text-muted" aria-live="polite">{tr("{n} of {m} verified", { n: done, m: checklist.length })}</p></div>
          <ul className="space-y-4">
            {checklist.map((x) => (
              <li key={x.label} className="flex items-start gap-3">
                {x.status === "Verified" ? <AnimatedCheck size={20} className="mt-0.5 shrink-0 text-success" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />}
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{x.label}</p><StatusBadge status={x.status} /></div><p className="text-xs text-muted">{x.why}</p></div>
              </li>
            ))}
          </ul>
        </CardBody></Surface>
        <StatusCard title={tr("KYC status")} status={c.kyc} why={tr("Chit participation needs verified identity to meet KYC and anti-money-laundering obligations.")} next={tr("A certified KYC provider or Aadhaar/PAN verification service must be connected before this can be completed. Nothing is collected here.")} />
        <StatusCard title={tr("Bank verification")} status={c.bank} why={tr("Payouts and refunds can only go to a verified account in your name.")} next={tr("A penny-drop or bank-statement verification service must be connected. No bank details are collected here.")} />
        <Surface className="lg:col-span-2"><CardBody>
          <PanelTitle action={nominee ? <StatusBadge status="Under review" /> : <StatusBadge status="Not started" />}>{tr("Nominee")}</PanelTitle>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm text-muted">{tr("A nominee is the person you name to receive communications and entitlements on your behalf.")} {nominee ? <>{tr("Current:")} <strong className="text-ink">{nominee.name}</strong>{nominee.relationship !== "Not recorded" && <> ({nominee.relationship})</>}.</> : tr("No nominee recorded.")}</p>
              <DemoNote>{tr("Edits are local to this browser session and unverified. A real nominee record needs identity documents collected through a secure backend.")}</DemoNote>
            </div>
            <div className="space-y-3"><NomineeForm key={`${nominee?.name ?? ""}|${nominee?.relationship ?? ""}`} onSaved={() => setSaved(true)} />{saved && <SuccessNote>{tr("Nominee saved locally (demo). It is not verified.")}</SuccessNote>}</div>
          </div>
        </CardBody></Surface>
      </div>
    </>
  );
}

export function ProfileView() { return <DataGate>{(d) => <Profile d={d} />}</DataGate>; }
