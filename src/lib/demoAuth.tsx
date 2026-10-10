"use client";
/**
 * DEMO-ONLY session. Role lives in sessionStorage purely to exercise route
 * guards and role-based navigation. This is NOT security: a real backend must
 * enforce authentication and authorization server-side.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "customer" | "admin" | null;
const Ctx = createContext<{ role: Role; ready: boolean; signIn: (r: Exclude<Role, null>) => void; signOut: () => void }>({ role: null, ready: false, signIn: () => {}, signOut: () => {} });
export const useDemoAuth = () => useContext(Ctx);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const r = sessionStorage.getItem("demo-role");
      if (r === "customer" || r === "admin") setRole(r);
    } catch {}
    setReady(true);
  }, []);
  const signIn = useCallback((r: Exclude<Role, null>) => { setRole(r); try { sessionStorage.setItem("demo-role", r); } catch {} }, []);
  const signOut = useCallback(() => { setRole(null); try { sessionStorage.removeItem("demo-role"); } catch {} }, []);
  return <Ctx.Provider value={{ role, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}
