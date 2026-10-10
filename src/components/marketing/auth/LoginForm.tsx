"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShieldCheck, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { demoMode } from "@/config/company";
import { useDemoAuth, type Role } from "@/lib/demoAuth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { mobileSchema } from "../validation";
import { AnimatedCheck } from "../pages/AnimatedCheck";
import { OtpInput } from "./OtpInput";

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
  const [shake, setShake] = useState(0);
  const [done, setDone] = useState(false);

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

  const check = (code: string) => {
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit OTP."); setShake((n) => n + 1); return; }
    if (attempts >= MAX_ATTEMPTS) { setError("Too many attempts. Please resend the OTP."); setShake((n) => n + 1); return; }
    if (code !== demoMode.devOtp) {
      setAttempts((a) => a + 1);
      setError(attempts + 1 >= MAX_ATTEMPTS ? "Too many attempts. Please resend the OTP." : "That OTP is incorrect. Please try again.");
      setShake((n) => n + 1);
      setOtp("");
      return;
    }
    setError(undefined);
    setDone(true);
    signIn(role);
    const dest = safeNext(params.get("next"), role) ?? (role === "admin" ? "/admin" : "/dashboard");
    setTimeout(() => router.push(dest), 1100);
  };
  const verify = (e: React.FormEvent) => { e.preventDefault(); check(otp); };

  const resend = () => { setOtp(""); setAttempts(0); setError(undefined); setTimer(RESEND_SECONDS); };
  const slide = { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -28 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-4xl font-extrabold text-emerald">Sign <span className="font-serif font-normal italic text-gold-antique">in</span></h1>
      <p className="mt-2 text-sm text-muted">Demo sign-in with a mobile number and one-time password. No password, PAN or Aadhaar is ever requested.</p>
      <div className="mt-6 overflow-hidden rounded-3xl border border-line/80 bg-white p-6 shadow-[var(--shadow-3)] sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" role="status" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center">
              <AnimatedCheck size={84} />
              <h2 className="mt-5 font-serif text-3xl text-emerald">Signed in <span className="italic text-gold-antique">(demo)</span></h2>
              <p className="mt-2 text-sm text-muted">Taking you to the {role === "admin" ? "admin console" : "dashboard"}…</p>
            </motion.div>
          ) : step === "mobile" ? (
            <motion.form key="mobile" {...slide} onSubmit={sendOtp} noValidate className="space-y-5">
              <TextField label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} hint="10-digit Indian mobile number" error={error} />
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Continue as</legend>
                <div className="grid grid-cols-2 gap-3">
                  {([["customer", "Customer demo"], ["admin", "Admin demo"]] as const).map(([v, l]) => (
                    <label key={v} className={`relative flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors focus-within:ring-4 focus-within:ring-gold/40 ${role === v ? "border-emerald text-emerald" : "border-line text-ink hover:border-gold-antique"}`}>
                      {role === v && <motion.span layoutId="role-pill" aria-hidden className="absolute inset-0 rounded-xl bg-emerald-50" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                      <input type="radio" name="role" value={v} checked={role === v} onChange={() => setRole(v)} className="relative accent-emerald" /><span className="relative">{l}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">Demo-only role choice, used to preview the customer dashboard or admin console. Real roles will be assigned by the company, never self-selected.</p>
              </fieldset>
              <Button type="submit" size="lg" className="w-full transition-transform active:scale-[0.98]"><Smartphone className="h-4 w-4" />Send OTP</Button>
            </motion.form>
          ) : (
            <motion.form key="otp" {...slide} onSubmit={verify} noValidate className="space-y-5">
              <p className="text-sm text-muted">Enter the OTP for mobile ending in <span className="font-semibold text-ink">{mobile.slice(-4)}</span>. <button type="button" onClick={() => { setStep("mobile"); setError(undefined); }} className="font-semibold text-emerald underline">Change number</button></p>
              <div role="note" className="flex items-center gap-2 rounded-xl border border-gold bg-gold/15 px-4 py-3 text-sm font-bold text-ink"><ShieldCheck className="h-4 w-4 shrink-0 text-gold-antique" aria-hidden />DEMO ONLY: development OTP is {demoMode.devOtp}</div>
              <div>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); if (error) setError(undefined); }} onComplete={check} shakeKey={shake} invalid={!!error} disabled={attempts >= MAX_ATTEMPTS} success={done} autoFocus />
                <AnimatePresence initial={false}>
                  {error && <motion.p key={error} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-center text-sm font-medium text-danger">{error}</motion.p>}
                </AnimatePresence>
              </div>
              <Button type="submit" size="lg" className="w-full transition-transform active:scale-[0.98]">Verify and continue</Button>
              <div className="text-center text-sm">
                {timer > 0 ? <p className="text-muted" aria-live="polite">Resend OTP in {timer}s</p> : <button type="button" onClick={resend} className="min-h-11 font-semibold text-emerald underline">Resend OTP</button>}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
