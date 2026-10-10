"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, TextAreaField, SelectField } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { DemoNote } from "@/components/ui/misc";
import { mobileSchema } from "./validation";
import { AnimatedCheck } from "./pages/AnimatedCheck";
import { RichT } from "./pages/RichT";
import { useTr } from "@/i18n/LanguageProvider";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  mobile: mobileSchema,
  email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  topic: z.string().min(1, "Choose a topic."),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(1000, "Please keep the message under 1000 characters."),
  consent: z.boolean().refine((v) => v, "Please confirm you agree to be contacted."),
});
type Values = z.infer<typeof schema>;

export function ContactForm() {
  const toast = useToast();
  const tr = useTr();
  const msg = (m?: string) => (m ? tr(m) : undefined);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", email: "", topic: "", message: "", consent: false },
  });
  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 300));
    toast(tr("Message recorded in demo mode — not sent."));
    reset();
    setSent(true);
  });
  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="done" role="status" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center rounded-3xl border border-emerald/20 bg-white p-10 text-center shadow-[var(--shadow-2)]">
          <AnimatedCheck />
          <h2 className="mt-5 font-serif text-3xl text-emerald"><RichT text="Message <i>recorded</i>" accent="italic text-gold-antique" /></h2>
          <p className="mt-2 max-w-sm text-sm text-muted">{tr("Demo mode: your message was validated here but nothing was sent or stored.")}</p>
          <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>{tr("Write another message")}</Button>
        </motion.div>
      ) : (
    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate className="space-y-4 rounded-3xl border border-line/80 bg-white p-5 shadow-[var(--shadow-2)] sm:p-7" aria-label={tr("Contact form")}>
      <DemoNote>{tr("Demo mode: your message is validated here but is not sent or stored.")}</DemoNote>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={tr("Full name")} autoComplete="name" error={msg(errors.name?.message)} {...register("name")} />
        <TextField label={tr("Mobile number")} inputMode="numeric" autoComplete="tel-national" maxLength={10} error={msg(errors.mobile?.message)} {...register("mobile")} />
      </div>
      <TextField label={tr("Email (optional)")} type="email" autoComplete="email" error={msg(errors.email?.message)} {...register("email")} />
      <SelectField label={tr("Topic")} error={msg(errors.topic?.message)} {...register("topic")}>
        <option value="">{tr("Select a topic")}</option>
        {["Understanding a scheme", "Onboarding", "Feedback", "Complaint or grievance", "Something else"].map((o) => <option key={o} value={o}>{tr(o)}</option>)}
      </SelectField>
      <TextAreaField label={tr("Message")} error={msg(errors.message?.message)} {...register("message")} />
      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-emerald" {...register("consent")} />
          {tr("I agree to be contacted about this message.")}
        </label>
        {errors.consent && <p role="alert" className="text-xs font-medium text-danger">{tr(errors.consent.message ?? "")}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="transition-transform active:scale-[0.97]">{isSubmitting ? tr("Recording…") : tr("Send message")}</Button>
    </motion.form>
      )}
    </AnimatePresence>
  );
}
