"use client";
/**
 * DEMO-ONLY "acting as" switch for exercising maker-checker flows.
 * This is NOT access control. A real system derives the actor and their
 * permissions from the authenticated session on the server and records the
 * identity of both maker and checker.
 */
import { createContext, useContext, useId, useMemo, useState, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Pencil, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export type ActingRole = "Maker" | "Checker";

interface Value {
  role: ActingRole;
  setRole: (r: ActingRole) => void;
  /** Demo identity used in audit entries. */
  actor: string;
  isMaker: boolean;
  isChecker: boolean;
}

export const actorFor = (r: ActingRole): string => (r === "Maker" ? "demo.maker@mschit.test" : "demo.checker@mschit.test");

const Ctx = createContext<Value>({ role: "Maker", setRole: () => {}, actor: actorFor("Maker"), isMaker: true, isChecker: false });
export const useActingAs = () => useContext(Ctx);

export function ActingAsProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<ActingRole>("Maker");
  const value = useMemo<Value>(() => ({ role, setRole, actor: actorFor(role), isMaker: role === "Maker", isChecker: role === "Checker" }), [role]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Segmented switch with a sliding pill. Native radios stay in the DOM for keyboard and screen-reader use. */
export function ActingAsSwitch() {
  const { role, setRole } = useActingAs();
  const gid = useId();
  return (
    <fieldset className="flex items-center gap-2 text-xs">
      <legend className="sr-only">Demo: act as maker or checker</legend>
      <span aria-hidden className="hidden text-[11px] font-bold uppercase tracking-wide text-muted xl:inline">Acting as</span>
      <LayoutGroup id={gid}>
        <div className="relative flex rounded-full border border-line bg-navy/5 p-0.5">
          {(["Maker", "Checker"] as const).map((r) => {
            const on = role === r;
            const Icon = r === "Maker" ? Pencil : ShieldCheck;
            return (
              <label key={r} className="relative cursor-pointer">
                <input type="radio" name="acting-as" value={r} checked={on} onChange={() => setRole(r)} className="peer sr-only" />
                <span className={cn("relative inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 font-semibold transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-antique", on ? "text-ivory" : "text-muted hover:text-ink")}>
                  {on && <motion.span layoutId="acting-pill" className="absolute inset-0 rounded-full bg-navy shadow-[0_4px_12px_-4px_rgb(11_31_58/0.6)]" transition={{ type: "spring", stiffness: 450, damping: 34 }} />}
                  <Icon className="relative h-3.5 w-3.5" aria-hidden /><span className="relative">{r}</span>
                </span>
              </label>
            );
          })}
        </div>
      </LayoutGroup>
    </fieldset>
  );
}
