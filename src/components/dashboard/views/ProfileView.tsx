"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { DemoNote } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import type { VerificationStatus } from "@/data/types";
import { DataGate, DefList, PageHeader, PanelTitle } from "../ui";
import { useDashboard, type Snapshot } from "../DashboardData";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the nominee's full name.").max(80, "Name is too long.").regex(/^[\p{L} .'-]+$/u, "Use letters only."),
  relationship: z.string().trim().min(2, "Enter the relationship.").max(40, "Relationship is too long."),
});
type Form = z.infer<typeof schema>;

function StatusCard({ title, status, why, next }: { title: string; status: VerificationStatus; why: string; next: string }) {
  return (
    <Card><CardBody>
      <div className="flex items-start justify-between gap-3"><h2 className="font-bold text-emerald">{title}</h2><StatusBadge status={status} /></div>
      <p className="mt-2 text-sm text-muted"><strong className="text-ink">Why it is needed: </strong>{why}</p>
      <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-[#6b5400]">Integration required: {next}</p>
    </CardBody></Card>
  );
}

function NomineeForm() {
  const { nominee, saveNominee } = useDashboard();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: nominee?.name ?? "", relationship: nominee?.relationship === "Not recorded" ? "" : nominee?.relationship ?? "" } });
  return (
    <form noValidate onSubmit={handleSubmit((v) => { saveNominee(v); toast("Nominee saved locally (demo). It is not verified."); })} className="space-y-4">
      <TextField label="Nominee full name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <TextField label="Relationship to you" autoComplete="off" error={errors.relationship?.message} {...register("relationship")} />
      <Button type="submit">Save nominee</Button>
    </form>
  );
}

function Profile({ d }: { d: Snapshot }) {
  const { nominee } = useDashboard();
  const c = d.customer;
  const agreement = d.documents.find((x) => x.category === "Agreement");
  const checklist: { label: string; status: string; why: string }[] = [
    { label: "Identity verification (KYC)", status: c.kyc, why: "Required by regulation to confirm who you are before payouts." },
    { label: "Bank account verification", status: c.bank, why: "Confirms prize and refund payouts go to an account in your name." },
    { label: "Nominee declaration", status: nominee ? "Under review" : "Not started", why: "Records who may be contacted if something happens to you." },
    { label: "Signed chit agreement", status: agreement?.fileUrl ? "Verified" : "Pending", why: "The legal contract between you and the company." },
  ];
  const done = checklist.filter((x) => x.status === "Verified").length;
  return (
    <>
      <PageHeader title="Profile and verification" intro="Your details, verification status and nominee. This demo never collects PAN, Aadhaar, ID numbers or bank credentials." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardBody>
          <PanelTitle>Personal information</PanelTitle>
          <DefList rows={[{ label: "Name", value: c.name }, { label: "Mobile", value: c.mobile }, { label: "Email", value: c.email }, { label: "Memberships", value: d.memberships.length }]} />
          <p className="mt-3 text-xs text-muted">Contact details are masked demo values. Changing them requires a verified backend flow.</p>
        </CardBody></Card>
        <Card><CardBody>
          <PanelTitle>Document checklist</PanelTitle>
          <p className="mb-3 text-sm text-muted" aria-live="polite">{done} of {checklist.length} verified</p>
          <ul className="space-y-4">
            {checklist.map((x) => (
              <li key={x.label} className="flex items-start gap-3">
                {x.status === "Verified" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />}
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{x.label}</p><StatusBadge status={x.status} /></div><p className="text-xs text-muted">{x.why}</p></div>
              </li>
            ))}
          </ul>
        </CardBody></Card>
        <StatusCard title="KYC status" status={c.kyc} why="Chit participation needs verified identity to meet KYC and anti-money-laundering obligations." next="A certified KYC provider or Aadhaar/PAN verification service must be connected before this can be completed. Nothing is collected here." />
        <StatusCard title="Bank verification" status={c.bank} why="Payouts and refunds can only go to a verified account in your name." next="A penny-drop or bank-statement verification service must be connected. No bank details are collected here." />
        <Card className="lg:col-span-2"><CardBody>
          <PanelTitle action={nominee ? <StatusBadge status="Under review" /> : <StatusBadge status="Not started" />}>Nominee</PanelTitle>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm text-muted">A nominee is the person you name to receive communications and entitlements on your behalf. {nominee ? <>Current: <strong className="text-ink">{nominee.name}</strong>{nominee.relationship !== "Not recorded" && <> ({nominee.relationship})</>}.</> : "No nominee recorded."}</p>
              <DemoNote>Edits are local to this browser session and unverified. A real nominee record needs identity documents collected through a secure backend.</DemoNote>
            </div>
            <NomineeForm key={`${nominee?.name ?? ""}|${nominee?.relationship ?? ""}`} />
          </div>
        </CardBody></Card>
      </div>
    </>
  );
}

export function ProfileView() { return <DataGate>{(d) => <Profile d={d} />}</DataGate>; }
