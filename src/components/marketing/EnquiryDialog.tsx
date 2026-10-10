"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { DemoNote } from "@/components/ui/misc";
import type { Scheme } from "@/data/types";
import { mobileSchema } from "./validation";
import { useLakh } from "./pages/useLakh";
import { useTr } from "@/i18n/LanguageProvider";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  mobile: mobileSchema,
  email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  message: z.string().trim().max(500, "Please keep the message under 500 characters."),
  consent: z.boolean().refine((v) => v, "Please confirm you agree to be contacted."),
});
type Values = z.infer<typeof schema>;

export function EnquiryForm({ scheme, onDone }: { scheme: Scheme; onDone: () => void }) {
  const toast = useToast();
  const tr = useTr();
  const lakh = useLakh();
  const msg = (m?: string) => (m ? tr(m) : undefined);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", email: "", message: "", consent: false },
  });
  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 300));
    toast(tr("Enquiry recorded in demo mode — not sent."));
    onDone();
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" id="enquiry-form">
      <DemoNote>{tr("Demo mode: this enquiry is validated here but is not sent or stored.")}</DemoNote>
      <p className="text-sm text-muted">{tr("Regarding: {name} ({amount})", { name: tr(scheme.name), amount: lakh(scheme.rules.grossChit) })}</p>
      <TextField label={tr("Full name")} autoComplete="name" error={msg(errors.name?.message)} {...register("name")} />
      <TextField label={tr("Mobile number")} inputMode="numeric" autoComplete="tel-national" maxLength={10} hint={tr("10-digit Indian mobile number")} error={msg(errors.mobile?.message)} {...register("mobile")} />
      <TextField label={tr("Email (optional)")} type="email" autoComplete="email" error={msg(errors.email?.message)} {...register("email")} />
      <TextAreaField label={tr("Your question (optional)")} error={msg(errors.message?.message)} {...register("message")} />
      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-emerald" {...register("consent")} />
          {tr("I agree to be contacted about this enquiry.")}
        </label>
        {errors.consent && <p role="alert" className="text-xs font-medium text-danger">{tr(errors.consent.message ?? "")}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? tr("Recording…") : tr("Submit enquiry")}</Button>
    </form>
  );
}

export function EnquiryDialog({ scheme, open, onOpenChange }: { scheme: Scheme; open: boolean; onOpenChange: (o: boolean) => void }) {
  const tr = useTr();
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={tr("Enquire about this scheme")} description={tr("Tell us how to reach you and what you would like to know.")}>
      <EnquiryForm scheme={scheme} onDone={() => onOpenChange(false)} />
    </Dialog>
  );
}

/** Persistent sticky call-to-action bar for a scheme page. */
export function SchemeStickyCta({ scheme }: { scheme: Scheme }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const tr = useTr();
  const active = scheme.status === "Active";
  return (
    <>
      <motion.div initial={reduce ? false : { y: 90 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.6 }} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/90 shadow-[0_-8px_30px_-12px_rgb(24_37_31/0.2)] backdrop-blur-md" role="region" aria-label={tr("Scheme actions")}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="hidden text-sm text-muted sm:block">{active ? tr("Illustrative demo scheme: onboarding is a demo walkthrough.") : tr("Status: {status}. Onboarding is not open for this scheme.", { status: tr(scheme.status) })}</p>
          <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
            {active && <Button href={`/register?scheme=${encodeURIComponent(scheme.id)}`} variant="secondary" className="min-w-0 flex-1 !whitespace-normal py-1.5 text-center leading-tight sm:flex-none">{tr("Start onboarding")}</Button>}
            <Button onClick={() => setOpen(true)} className="min-w-0 flex-1 !whitespace-normal py-1.5 text-center leading-tight transition-transform active:scale-[0.97] sm:flex-none"><MessageCircle className="h-4 w-4" />{tr("Enquire about this scheme")}</Button>
          </div>
        </div>
      </motion.div>
      <EnquiryDialog scheme={scheme} open={open} onOpenChange={setOpen} />
    </>
  );
}
