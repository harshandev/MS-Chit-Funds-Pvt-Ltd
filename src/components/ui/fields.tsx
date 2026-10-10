"use client";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";

const control = "w-full min-h-11 rounded-lg border border-line bg-white px-3.5 text-sm text-ink shadow-[var(--shadow-1)] transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70 hover:border-ink/25 focus:border-emerald focus:outline-none focus:ring-4 focus:ring-emerald/10 disabled:bg-ivory";

function Wrap({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <AnimatePresence initial={false}>
        {error && <motion.p key={error} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-1 text-xs font-medium text-danger">{error}</motion.p>}
      </AnimatePresence>
    </div>
  );
}

type Common = { label: string; hint?: string; error?: string };

export const TextField = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(function TextField({ label, hint, error, className, ...p }, ref) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <input ref={ref} id={id} aria-invalid={!!error} className={cn(control, error && "border-danger focus:border-danger focus:ring-danger/10", className)} {...p} />
    </Wrap>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, Common & SelectHTMLAttributes<HTMLSelectElement>>(function SelectField({ label, hint, error, className, children, ...p }, ref) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <select ref={ref} id={id} aria-invalid={!!error} className={cn(control, error && "border-danger", className)} {...p}>{children}</select>
    </Wrap>
  );
});

export const TextAreaField = forwardRef<HTMLTextAreaElement, Common & TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextAreaField({ label, hint, error, className, ...p }, ref) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <textarea ref={ref} id={id} aria-invalid={!!error} className={cn(control, "min-h-28 py-2", error && "border-danger", className)} {...p} />
    </Wrap>
  );
});
