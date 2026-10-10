"use client";
import { useLang } from "@/i18n/LanguageProvider";
import { DraftBanner } from "../shared";

/** Tamil-only notice shown above untranslated legal text. */
export function LegalNotice() {
  const { lang, tr } = useLang();
  if (lang !== "ta") return null;
  return (
    <div className="mb-6" lang="ta">
      <DraftBanner>{tr("The legally binding text of this page is in English. A reviewed Tamil version will follow. The English text below is the only version that applies.")}</DraftBanner>
    </div>
  );
}
