"use client";
/**
 * DEMO-ONLY "acting as" switch for exercising maker-checker flows.
 * This is NOT access control. A real system derives the actor and their
 * permissions from the authenticated session on the server and records the
 * identity of both maker and checker.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

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

/** Segmented switch used in the top bar. */
export function ActingAsSwitch() {
  const { role, setRole } = useActingAs();
  return (
    <fieldset className="flex items-center gap-1 text-xs">
      <legend className="sr-only">Demo: act as maker or checker</legend>
      <span aria-hidden className="mr-1 hidden text-muted xl:inline">Acting as</span>
      {(["Maker", "Checker"] as const).map((r) => (
        <label key={r} className="cursor-pointer">
          <input type="radio" name="acting-as" value={r} checked={role === r} onChange={() => setRole(r)} className="peer sr-only" />
          <span className="inline-flex min-h-8 items-center rounded-md border border-line px-2.5 font-semibold text-muted peer-checked:border-navy peer-checked:bg-navy peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-antique">{r}</span>
        </label>
      ))}
    </fieldset>
  );
}
