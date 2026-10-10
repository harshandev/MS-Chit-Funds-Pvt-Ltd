"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useTr } from "@/i18n/LanguageProvider";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type T = { id: number; text: string; tone: "ok" | "error" };
const Ctx = createContext<(text: string, tone?: T["tone"]) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const tr = useTr();
  const push = useCallback((text: string, tone: T["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:items-end" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="rise pointer-events-auto flex max-w-md items-start gap-3 rounded-md bg-navy px-4 py-3 text-sm text-ivory shadow-[var(--shadow-3)]">
            {t.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />}
            {tr(t.text)}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
