"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type DictKey, type Lang } from "./dictionaries";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string }>({ lang: "en", setLang: () => {}, t: (k) => dictionaries.en[k] });
export const useLang = () => useContext(Ctx);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ta" || saved === "en") setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang === "ta" ? "ta" : "en-IN"; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  }, []);
  const t = useCallback((k: DictKey) => dictionaries[lang][k] ?? dictionaries.en[k], [lang]);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
