"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField } from "@/components/ui/fields";
import { useToast } from "@/components/ui/Toast";
import { DemoNote } from "@/components/ui/misc";
import type { Scheme } from "@/data/types";
import { formatLakh } from "@/lib/money";
import { mobileSchema } from "./validation";

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", email: "", message: "", consent: false },
  });
  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 300));
    toast("Enquiry recorded in demo mode — not sent.");
    onDone();
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" id="enquiry-form">
      <DemoNote>Demo mode: this enquiry is validated here but is not sent or stored.</DemoNote>
      <p className="text-sm text-muted">Regarding: {scheme.name} ({formatLakh(scheme.rules.grossChit)})</p>
      <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <TextField label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} hint="10-digit Indian mobile number" error={errors.mobile?.message} {...register("mobile")} />
      <TextField label="Email (optional)" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TextAreaField label="Your question (optional)" error={errors.message?.message} {...register("message")} />
      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-emerald" {...register("consent")} />
          I agree to be contacted about this enquiry.
        </label>
        {errors.consent && <p role="alert" className="text-xs font-medium text-danger">{errors.consent.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Recording…" : "Submit enquiry"}</Button>
    </form>
  );
}

export function EnquiryDialog({ scheme, open, onOpenChange }: { scheme: Scheme; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Enquire about this scheme" description="Tell us how to reach you and what you would like to know.">
      <EnquiryForm scheme={scheme} onDone={() => onOpenChange(false)} />
    </Dialog>
  );
}

/** Persistent sticky call-to-action bar for a scheme page. */
export function SchemeStickyCta({ scheme }: { scheme: Scheme }) {
  const [open, setOpen] = useState(false);
  const active = scheme.status === "Active";
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur" role="region" aria-label="Scheme actions">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="hidden text-sm text-muted sm:block">{active ? "Illustrative demo scheme: onboarding is a demo walkthrough." : `Status: ${scheme.status}. Onboarding is not open for this scheme.`}</p>
          <div className="flex w-full gap-3 sm:w-auto">
            {active && <Button href={`/register?scheme=${encodeURIComponent(scheme.id)}`} variant="secondary" className="flex-1 sm:flex-none">Start onboarding</Button>}
            <Button onClick={() => setOpen(true)} className="flex-1 sm:flex-none"><MessageCircle className="h-4 w-4" />Enquire about this scheme</Button>
          </div>
        </div>
      </div>
      <EnquiryDialog scheme={scheme} open={open} onOpenChange={setOpen} />
    </>
  );
}
