"use client";
import { useSyncExternalStore } from "react";

/** Hydration-safe string store backed by web storage (server snapshot = fallback). */
export function createStorageStore(kind: "local" | "session", key: string, fallback: string | null) {
  const listeners = new Set<() => void>();
  const area = () => { try { return kind === "local" ? localStorage : sessionStorage; } catch { return null; } };
  const memory: { v: string | null } = { v: null };
  const read = () => { try { return area()?.getItem(key) ?? memory.v ?? fallback; } catch { return memory.v ?? fallback; } };
  return {
    use: () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, read, () => fallback),
    set(v: string | null) {
      memory.v = v;
      try { if (v === null) area()?.removeItem(key); else area()?.setItem(key, v); } catch {}
      listeners.forEach((l) => l());
    },
  };
}
