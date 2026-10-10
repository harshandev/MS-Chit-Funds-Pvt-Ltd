"use client";
import { useLang } from "@/i18n/LanguageProvider";
import { formatLakh, type Paise } from "@/lib/money";

/** formatLakh with Tamil unit words (லட்சம் / கோடி) when Tamil is selected. */
export function useLakh() {
  const { lang } = useLang();
  return (p: Paise) => { const s = formatLakh(p); return lang === "ta" ? s.replace(" lakh", " லட்சம்").replace(" crore", " கோடி") : s; };
}
