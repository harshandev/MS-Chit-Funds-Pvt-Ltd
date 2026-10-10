"use client";
import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { dictionaries, type DictKey, type Lang } from "./dictionaries";
import { createStorageStore } from "@/lib/storageStore";

const store = createStorageStore("local", "lang", "en");
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string }>({ lang: "en", setLang: () => {}, t: (k) => dictionaries.en[k] });
export const useLang = () => useContext(Ctx);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const raw = store.use();
  const lang: Lang = raw === "ta" ? "ta" : "en";
  useEffect(() => { document.documentElement.lang = lang === "ta" ? "ta" : "en-IN"; }, [lang]);
  const setLang = useCallback((l: Lang) => store.set(l), []);
  const t = useCallback((k: DictKey) => dictionaries[lang][k] ?? dictionaries.en[k], [lang]);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
