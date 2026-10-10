"use client";
import * as D from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Edge-docked sheet with a spring slide and swipe-to-dismiss. Focus-trapped and keyboard dismissible via Radix. */
export function SideSheet({ open, onOpenChange, title, description, side = "left", children, className, closeClassName }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; side?: "left" | "right"; children: ReactNode; className?: string; closeClassName?: string;
}) {
  const reduce = useReducedMotion();
  const dir = side === "left" ? -1 : 1;
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
                className={cn("fixed top-0 z-50 flex h-dvh w-80 max-w-[88vw] flex-col shadow-[var(--shadow-3)]", side === "left" ? "left-0" : "right-0", className)}
                initial={reduce ? { opacity: 0 } : { x: `${dir * 100}%` }}
                animate={reduce ? { opacity: 1 } : { x: 0 }}
                exit={reduce ? { opacity: 0 } : { x: `${dir * 100}%` }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                drag={reduce ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: side === "left" ? 0.4 : 0, right: side === "right" ? 0.4 : 0 }}
                onDragEnd={(_, info) => { if (info.offset.x * dir > 80 || info.velocity.x * dir > 500) onOpenChange(false); }}
              >
                <D.Title className="sr-only">{title}</D.Title>
                <D.Description className="sr-only">{description}</D.Description>
                <D.Close className={cn("absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full", closeClassName)} aria-label="Close menu"><X className="h-5 w-5" /></D.Close>
                {children}
              </motion.div>
            </D.Content>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  );
}
