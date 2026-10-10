"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plug } from "lucide-react";
import { schemes } from "@/data/demo";
import type { VerificationStatus } from "@/data/types";
import { formatINR, formatLakh } from "@/lib/money";
import { cn } from "@/lib/cn";
import { StatusBadge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { TextField, SelectField } from "@/components/ui/fields";
import { Card, CardBody } from "@/components/ui/Card";
import { DemoNote } from "@/components/ui/misc";
import { emailSchema, mobileSchema } from "../validation";

interface Profile { name: string; mobile: string; email: string; city: string }
interface Nominee { name: string; relationship: string }
type Errors = Record<string, string | undefined>;

const steps = [
  { title: "Profile", why: "We need to know who is applying so that records, statements and communication reach the right person." },
  { title: "Identity (KYC) verification", why: "Regulated financial participation generally requires verifying identity. It protects you and the scheme from impersonation and misuse." },
  { title: "Bank verification", why: "Confirming a bank account in your name helps ensure instalments and any payouts involve only accounts you control." },
  { title: "Nominee", why: "A nominee is the person you name to be contacted about your participation if something happens to you. Providing one is optional here." },
  { title: "Document checklist", why: "Knowing what you will need in advance avoids delays. Nothing is uploaded in this demo." },
  { title: "Scheme selection", why: "Only schemes that are approved and active can be joined. Other schemes are listed for information." },
  { title: "Agreement review", why: "You should read the full agreement before agreeing to anything. It sets out your rights and obligations." },
  { title: "E-signature", why: "Your signature is what makes an agreement binding, so it needs a compliant, verifiable signing process." },
  { title: "Application status", why: "A summary of where your application stands and what happens next." },
] as const;

const statusInfo: [VerificationStatus, string][] = [
  ["Not started", "You have not begun this check yet."],
  ["In progress", "You have begun and have steps left to complete."],
  ["Action required", "We need something more from you, such as a clearer document."],
  ["Under review", "Submitted and awaiting review by the verification team."],
  ["Verified", "The check is complete."],
  ["Rejected", "The check could not be accepted. Reasons would be explained."],
  ["Failed", "A technical problem interrupted the check; you can try again."],
];

const checklist = [
  "A recent photograph (if required for the scheme)",
  "Proof of identity, as accepted under the verification process",
  "Proof of address, as accepted under the verification process",
  "Bank account details and proof of the account in your name",
  "Details of your nominee, if you choose to add one",
  "Any additional documents the scheme agreement requires (e.g., security documents)",
];

function VerifyCard({ title, status, text }: { title: string; status: VerificationStatus; text: string }) {
  return (
    <div className="rounded-lg border border-line bg-ivory p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-emerald">{title}</h3><StatusBadge status={status} /></div>
      <p className="mt-2 text-sm text-muted">{text}</p>
      <p className="mt-3 flex items-start gap-2 rounded-md border border-dashed border-gold-antique/60 bg-gold/10 p-3 text-sm text-ink"><Plug className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span><strong>Integration required.</strong> A verified service must be connected before this step can run. This demo does not collect or check any identity or bank documents.</span></p>
    </div>
  );
}

export function RegisterWizard() {
  const params = useSearchParams();
  const requested = params.get("scheme");
  const active = useMemo(() => schemes.filter((s) => s.status === "Active"), []);
  const requestedScheme = schemes.find((s) => s.id === requested);

  const [i, setI] = useState(0);
  const [profile, setProfile] = useState<Profile>({ name: "", mobile: "", email: "", city: "" });
  const [nominee, setNominee] = useState<Nominee>({ name: "", relationship: "" });
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [schemeId, setSchemeId] = useState<string | null>(requestedScheme?.status === "Active" ? requestedScheme.id : null);
  const [errors, setErrors] = useState<Errors>({});
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { heading.current?.focus(); }, [i]);

  function validate(step: number): Errors {
    const e: Errors = {};
    if (step === 0) {
      if (profile.name.trim().length < 2) e.name = "Enter your full name.";
      const m = mobileSchema.safeParse(profile.mobile); if (!m.success) e.mobile = m.error.issues[0].message;
      const em = emailSchema.safeParse(profile.email.trim()); if (!em.success) e.email = em.error.issues[0].message;
      if (profile.city.trim().length < 2) e.city = "Enter your city or town.";
    }
    if (step === 3 && nominee.name.trim() && !nominee.relationship) e.relationship = "Select your relationship to the nominee.";
    if (step === 3 && !nominee.name.trim() && nominee.relationship) e.nomineeName = "Enter the nominee's name or clear the relationship.";
    if (step === 5 && !schemeId) e.scheme = "Select an active scheme to continue.";
    return e;
  }
  const next = () => { const e = validate(i); setErrors(e); if (Object.keys(e).length === 0) setI((n) => Math.min(n + 1, steps.length - 1)); };
  const back = () => { setErrors({}); setI((n) => Math.max(0, n - 1)); };
  const chosen = schemes.find((s) => s.id === schemeId);
  const setP = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setProfile((p) => ({ ...p, [k]: k === "mobile" ? e.target.value.replace(/\D/g, "") : e.target.value }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold text-emerald">Start onboarding</h1>
      <p className="mt-2 text-sm text-muted">A demo walkthrough of the steps involved. Nothing is submitted, stored or signed.</p>

      <nav aria-label="Progress" className="mt-6">
        <p className="text-sm font-semibold text-ink">Step {i + 1} of {steps.length}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} aria-label="Onboarding progress"><div className="h-full bg-emerald transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
        <ol className="mt-3 hidden flex-wrap gap-2 text-xs md:flex">
          {steps.map((s, n) => (
            <li key={s.title} aria-current={n === i ? "step" : undefined} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1", n === i ? "bg-emerald text-ivory" : n < i ? "bg-emerald-50 text-emerald" : "bg-line/60 text-muted")}>
              {n < i && <Check className="h-3 w-3" aria-hidden />}{s.title}
            </li>
          ))}
        </ol>
      </nav>

      <Card className="mt-6"><CardBody>
        <h2 ref={heading} tabIndex={-1} className="text-xl font-bold text-emerald outline-none">{steps[i].title}</h2>
        <p className="mt-2 rounded-md bg-emerald-50 p-3 text-sm text-ink"><span className="font-semibold">Why this step: </span>{steps[i].why}</p>
        <div className="mt-5 space-y-4">
          {i === 0 && (
            <>
              <TextField label="Full name" autoComplete="name" value={profile.name} onChange={setP("name")} error={errors.name} />
              <TextField label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={profile.mobile} onChange={setP("mobile")} error={errors.mobile} />
              <TextField label="Email" type="email" autoComplete="email" value={profile.email} onChange={setP("email")} error={errors.email} />
              <TextField label="City or town" autoComplete="address-level2" value={profile.city} onChange={setP("city")} error={errors.city} />
              <p className="text-xs text-muted">Please do not enter PAN, Aadhaar or any password. They are never requested here.</p>
            </>
          )}
          {i === 1 && (
            <>
              <VerifyCard title="KYC status" status="Not started" text="Identity verification will be completed through a verified service. You will be guided through it, and you will see your status here." />
              <div>
                <h3 className="text-sm font-bold text-ink">What each status means</h3>
                <ul className="mt-2 space-y-2">{statusInfo.map(([s, d]) => <li key={s} className="flex flex-wrap items-center gap-2 text-sm"><StatusBadge status={s} /><span className="text-muted">{d}</span></li>)}</ul>
              </div>
            </>
          )}
          {i === 2 && <VerifyCard title="Bank verification status" status="Not started" text="Bank account verification will be completed through a verified service. The same statuses as KYC apply." />}
          {i === 3 && (
            <>
              <TextField label="Nominee name (optional)" value={nominee.name} onChange={(e) => setNominee((n) => ({ ...n, name: e.target.value }))} error={errors.nomineeName} />
              <SelectField label="Relationship (required if a nominee is named)" value={nominee.relationship} onChange={(e) => setNominee((n) => ({ ...n, relationship: e.target.value }))} error={errors.relationship}>
                <option value="">Select relationship</option>
                {["Spouse", "Parent", "Child", "Sibling", "Other family member", "Other"].map((r) => <option key={r}>{r}</option>)}
              </SelectField>
              <p className="text-xs text-muted">Nomination rules will be defined by the approved scheme agreement.</p>
            </>
          )}
          {i === 4 && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">Tick what you have ready (for your own reference)</legend>
              <ul className="space-y-1">
                {checklist.map((c) => (
                  <li key={c}><label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={!!docs[c]} onChange={(e) => setDocs((d) => ({ ...d, [c]: e.target.checked }))} className="mt-0.5 h-5 w-5 accent-emerald" />{c}</label></li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">The exact list will depend on the scheme and verification requirements. No uploads happen in this demo.</p>
            </fieldset>
          )}
          {i === 5 && (
            <fieldset>
              <legend className="sr-only">Choose a scheme</legend>
              {requestedScheme && requestedScheme.status !== "Active" && <p role="alert" className="mb-3 rounded-md bg-warning/10 p-3 text-sm">{requestedScheme.name} is {requestedScheme.status} and cannot be joined. Only active schemes can be selected.</p>}
              <DemoNote>Illustrative demo schemes only.</DemoNote>
              <ul className="mt-3 space-y-3">
                {schemes.map((s) => {
                  const ok = s.status === "Active";
                  return (
                    <li key={s.id}>
                      <label className={cn("flex min-h-11 items-start gap-3 rounded-lg border p-4", ok ? "cursor-pointer" : "cursor-not-allowed bg-ivory opacity-80", schemeId === s.id ? "border-emerald bg-emerald-50" : "border-line")}>
                        <input type="radio" name="scheme" disabled={!ok} checked={schemeId === s.id} onChange={() => setSchemeId(s.id)} className="mt-1 h-5 w-5 accent-emerald" />
                        <span className="text-sm">
                          <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">{s.name} <StatusBadge status={s.status} /></span>
                          <span className="mt-1 block text-muted">{formatLakh(s.rules.grossChit)} · {formatINR(s.rules.instalment)}/month · {s.rules.instalments} months</span>
                          {!ok && <span className="mt-1 block text-muted">Not selectable: this scheme is {s.status.toLowerCase()} and has not commenced.</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {active.length === 0 && <p className="mt-3 text-sm text-muted">No scheme is active right now.</p>}
              {errors.scheme && <p role="alert" className="mt-2 text-xs font-medium text-danger">{errors.scheme}</p>}
            </fieldset>
          )}
          {i === 6 && (
            <>
              <div className="rounded-md border border-dashed border-gold-antique/60 bg-gold/10 p-4 text-sm">
                <p className="font-semibold text-ink">Pending legal approval — to be supplied</p>
                <p className="mt-1 text-muted">The scheme agreement{chosen ? ` for ${chosen.name}` : ""} has not been approved or published, so there is nothing to read or accept yet. No terms are stated here.</p>
              </div>
              <label className="flex min-h-11 items-start gap-3 text-sm text-muted"><input type="checkbox" disabled className="mt-0.5 h-5 w-5" />I have read and understood the scheme agreement</label>
              <p className="text-xs text-muted">This confirmation is disabled because there is no real agreement document to review. It becomes available once an approved agreement is provided.</p>
            </>
          )}
          {i === 7 && (
            <>
              <Button disabled className="w-full sm:w-auto">E-signature integration pending</Button>
              <p className="text-sm text-muted">Signing requires an approved agreement and a compliant e-signature service. This demo never simulates a legal signature.</p>
            </>
          )}
          {i === 8 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3"><StatusBadge status="Under review" /><span className="text-sm font-semibold text-ink">Under review (demo)</span></div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wider text-muted">Name</dt><dd className="font-semibold">{profile.name}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted">Mobile</dt><dd className="font-semibold">{"XXXXXX" + profile.mobile.slice(-4)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted">City</dt><dd className="font-semibold">{profile.city}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted">Scheme</dt><dd className="font-semibold">{chosen?.name ?? "-"}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted">KYC / Bank</dt><dd className="font-semibold">Integration required</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted">Agreement / Signature</dt><dd className="font-semibold">Pending</dd></div>
              </dl>
              <p className="rounded-md bg-ivory p-3 text-sm text-muted">This is a demo summary. No application has been submitted, no data has been stored, and nothing here is an approval. A real application would remain pending until verification, agreement and signature steps are completed.</p>
              <div className="flex flex-wrap gap-3"><Link href="/" className={buttonClass("secondary")}>Return home</Link><Link href="/chit-plans" className={buttonClass("ghost")}>Explore plans</Link></div>
            </div>
          )}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={back} disabled={i === 0}><ArrowLeft className="h-4 w-4" />Back</Button>
          {i < steps.length - 1 && <Button onClick={next}>{i === 7 ? "Continue" : "Next"}<ArrowRight className="h-4 w-4" /></Button>}
        </div>
      </CardBody></Card>
    </div>
  );
}
