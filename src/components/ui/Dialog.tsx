"use client";
import * as D from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** "drawer" slides in from the right. */
  variant?: "dialog" | "drawer";
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Dialog({ open, onOpenChange, title, description, children, footer, variant = "dialog" }: Props) {
  const drawer = variant === "drawer";
  const tr = useTr();
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <D.Portal forceMount>
            <D.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-50 bg-navy/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            </D.Overlay>
            <D.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed z-50 flex flex-col bg-white shadow-[var(--shadow-3)] outline-none",
                  drawer ? "right-0 top-0 h-dvh w-full max-w-md" : "inset-0 m-auto h-fit max-h-[90dvh] w-[calc(100vw-2rem)] max-w-lg rounded-2xl",
                )}
                initial={drawer ? { x: "100%" } : { opacity: 0, y: 24, scale: 0.97 }}
                animate={drawer ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
                exit={drawer ? { x: "100%" } : { opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.32, ease }}
              >
                <div className="flex items-start justify-between gap-4 border-b border-line p-5">
                  <div>
                    <D.Title className="text-lg font-bold text-emerald">{tr(title)}</D.Title>
                    <D.Description className={cn("mt-1 text-sm text-muted", !description && "sr-only")}>{tr(description ?? title)}</D.Description>
                  </div>
                  <D.Close className="rounded-lg p-2 text-muted transition-colors hover:bg-ivory hover:text-ink" aria-label={tr("Close")}><X className="h-5 w-5" /></D.Close>
                </div>
                <div className="overflow-y-auto p-5 text-sm">{children}</div>
                {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line p-4">{footer}</div>}
              </motion.div>
            </D.Content>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  );
}

/** Confirmation dialog for sensitive (simulated) actions. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm, danger }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel?: string; onConfirm: () => void; danger?: boolean;
}) {
  const tr = useTr();
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}
      footer={
        <>
          <button className="min-h-10 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-ivory" onClick={() => onOpenChange(false)}>{tr("Cancel")}</button>
          <button className={cn("min-h-10 rounded-lg px-4 text-sm font-semibold text-white transition-transform active:scale-[0.97]", danger ? "bg-danger" : "bg-emerald")} onClick={() => { onConfirm(); onOpenChange(false); }}>{tr(confirmLabel)}</button>
        </>
      }
    />
  );
}
