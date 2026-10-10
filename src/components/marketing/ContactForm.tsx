"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, TextAreaField, SelectField } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { DemoNote } from "@/components/ui/misc";
import { mobileSchema } from "./validation";

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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", email: "", topic: "", message: "", consent: false },
  });
  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 300));
    toast("Message recorded in demo mode — not sent.");
    reset();
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-label="Contact form">
      <DemoNote>Demo mode: your message is validated here but is not sent or stored.</DemoNote>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <TextField label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} error={errors.mobile?.message} {...register("mobile")} />
      </div>
      <TextField label="Email (optional)" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <SelectField label="Topic" error={errors.topic?.message} {...register("topic")}>
        <option value="">Select a topic</option>
        <option>Understanding a scheme</option>
        <option>Onboarding</option>
        <option>Feedback</option>
        <option>Complaint or grievance</option>
        <option>Something else</option>
      </SelectField>
      <TextAreaField label="Message" error={errors.message?.message} {...register("message")} />
      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-emerald" {...register("consent")} />
          I agree to be contacted about this message.
        </label>
        {errors.consent && <p role="alert" className="text-xs font-medium text-danger">{errors.consent.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Recording…" : "Send message"}</Button>
    </form>
  );
}
