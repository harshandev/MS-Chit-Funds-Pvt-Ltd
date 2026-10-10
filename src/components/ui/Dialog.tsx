"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

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

export function Dialog({ open, onOpenChange, title, description, children, footer, variant = "dialog" }: Props) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-navy/50" />
        <D.Content
          className={cn(
            "fixed z-50 flex max-h-[90dvh] flex-col bg-white shadow-[var(--shadow-3)]",
            variant === "dialog"
              ? "left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg"
              : "right-0 top-0 h-dvh max-h-none w-full max-w-md",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line p-5">
            <div>
              <D.Title className="text-lg font-bold text-emerald">{title}</D.Title>
              <D.Description className={cn("mt-1 text-sm text-muted", !description && "sr-only")}>{description ?? title}</D.Description>
            </div>
            <D.Close className="rounded-md p-2 text-muted hover:bg-ivory" aria-label="Close"><X className="h-5 w-5" /></D.Close>
          </div>
          <div className="overflow-y-auto p-5 text-sm">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line p-4">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/** Confirmation dialog for sensitive (simulated) actions. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm, danger }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel?: string; onConfirm: () => void; danger?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}
      footer={
        <>
          <button className="min-h-10 rounded-md px-4 text-sm font-semibold text-muted hover:bg-ivory" onClick={() => onOpenChange(false)}>Cancel</button>
          <button className={cn("min-h-10 rounded-md px-4 text-sm font-semibold text-white", danger ? "bg-danger" : "bg-emerald")} onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</button>
        </>
      }
    />
  );
}
