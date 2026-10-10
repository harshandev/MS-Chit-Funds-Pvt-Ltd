"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { demoMode } from "@/config/company";
import { useDemoAuth, type Role } from "@/lib/demoAuth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { Card, CardBody } from "@/components/ui/Card";
import { mobileSchema } from "../validation";

type DemoRole = Exclude<Role, null>;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 5;

/** Only same-origin absolute paths; blocks `//host` and `/\host` tricks. */
function safeNext(raw: string | null, role: DemoRole): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (role === "customer" && raw.startsWith("/admin")) return null;
  if (role === "admin" && raw.startsWith("/dashboard")) return null;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useDemoAuth();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<DemoRole>("customer");
  const [error, setError] = useState<string | undefined>();
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const r = mobileSchema.safeParse(mobile);
    if (!r.success) { setError(r.error.issues[0].message); return; }
    setError(undefined); setOtp(""); setAttempts(0); setTimer(RESEND_SECONDS); setStep("otp");
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit OTP."); return; }
    if (attempts >= MAX_ATTEMPTS) { setError("Too many attempts. Please resend the OTP."); return; }
    if (otp !== demoMode.devOtp) {
      setAttempts((a) => a + 1);
      setError("That OTP is incorrect. Please try again.");
      return;
    }
    signIn(role);
    router.push(safeNext(params.get("next"), role) ?? (role === "admin" ? "/admin" : "/dashboard"));
  };

  const resend = () => { setOtp(""); setAttempts(0); setError(undefined); setTimer(RESEND_SECONDS); };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold text-emerald">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Demo sign-in with a mobile number and one-time password. No password, PAN or Aadhaar is ever requested.</p>
      <Card className="mt-6"><CardBody>
        {step === "mobile" ? (
          <form onSubmit={sendOtp} noValidate className="space-y-5">
            <TextField label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} hint="10-digit Indian mobile number" error={error} />
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-ink">Continue as</legend>
              <div className="grid grid-cols-2 gap-3">
                {([["customer", "Customer demo"], ["admin", "Admin demo"]] as const).map(([v, l]) => (
                  <label key={v} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold ${role === v ? "border-emerald bg-emerald-50 text-emerald" : "border-line text-ink"}`}>
                    <input type="radio" name="role" value={v} checked={role === v} onChange={() => setRole(v)} className="accent-emerald" />{l}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">Demo-only role choice, used to preview the customer dashboard or admin console. Real roles will be assigned by the company, never self-selected.</p>
            </fieldset>
            <Button type="submit" className="w-full">Send OTP</Button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate className="space-y-5">
            <p className="text-sm text-muted">Enter the OTP for mobile ending in <span className="font-semibold text-ink">{mobile.slice(-4)}</span>. <button type="button" onClick={() => { setStep("mobile"); setError(undefined); }} className="font-semibold text-emerald underline">Change number</button></p>
            <div role="note" className="rounded-md border border-gold bg-gold/15 px-4 py-3 text-sm font-bold text-ink">DEMO ONLY: development OTP is {demoMode.devOtp}</div>
            <TextField label="6-digit OTP" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} error={error} />
            <Button type="submit" className="w-full">Verify and continue</Button>
            <div className="text-center text-sm">
              {timer > 0 ? <p className="text-muted" aria-live="polite">Resend OTP in {timer}s</p> : <button type="button" onClick={resend} className="min-h-11 font-semibold text-emerald underline">Resend OTP</button>}
            </div>
          </form>
        )}
      </CardBody></Card>
    </div>
  );
}
