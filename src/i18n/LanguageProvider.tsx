"use client";
import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { dictionaries, type DictKey, type Lang } from "./dictionaries";
import { taMap } from "./ta";
import { createStorageStore } from "@/lib/storageStore";

const store = createStorageStore("local", "lang", "en");

interface Value {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Keyed lookup for the small core dictionary (nav, hero). */
  t: (k: DictKey) => string;
  /**
   * Translate by English source string. Falls back to the English text when
   * no translation exists, so untranslated strings never break the UI.
   * Supports {placeholders}: tr("Page {n} of {m}", { n: 1, m: 4 }).
   */
  tr: (en: string, vars?: Record<string, string | number>) => string;
}
const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : s);
const Ctx = createContext<Value>({ lang: "en", setLang: () => {}, t: (k) => dictionaries.en[k], tr: (en, v) => fill(en, v) });
export const useLang = () => useContext(Ctx);
/** Shorthand hook: const tr = useTr(); tr("Hello") */
export const useTr = () => useContext(Ctx).tr;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const raw = store.use();
  const lang: Lang = raw === "ta" ? "ta" : "en";
  useEffect(() => { document.documentElement.lang = lang === "ta" ? "ta" : "en-IN"; }, [lang]);
  const setLang = useCallback((l: Lang) => store.set(l), []);
  const t = useCallback((k: DictKey) => dictionaries[lang][k] ?? dictionaries.en[k], [lang]);
  const tr = useCallback((en: string, vars?: Record<string, string | number>) => fill(lang === "ta" ? taMap[en] ?? en : en, vars), [lang]);
  return <Ctx.Provider value={{ lang, setLang, t, tr }}>{children}</Ctx.Provider>;
}
