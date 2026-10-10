"use client";
/**
 * DEMO-ONLY session. Role lives in sessionStorage purely to exercise route
 * guards and role-based navigation. This is NOT security: a real backend must
 * enforce authentication and authorization server-side.
 */
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { createStorageStore } from "./storageStore";

export type Role = "customer" | "admin" | null;
const store = createStorageStore("session", "demo-role", null);
const Ctx = createContext<{ role: Role; ready: boolean; signIn: (r: Exclude<Role, null>) => void; signOut: () => void }>({ role: null, ready: false, signIn: () => {}, signOut: () => {} });
export const useDemoAuth = () => useContext(Ctx);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const raw = store.use();
  // false during server render and hydration, true once the client snapshot is readable.
  const ready = useSyncExternalStore(() => () => {}, () => true, () => false);
  const role: Role = raw === "customer" || raw === "admin" ? raw : null;
  const value = useMemo(() => ({ role, ready, signIn: (r: Exclude<Role, null>) => store.set(r), signOut: () => store.set(null) }), [role, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
