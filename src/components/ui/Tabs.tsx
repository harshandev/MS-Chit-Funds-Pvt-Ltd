"use client";
import * as T from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { useTr } from "@/i18n/LanguageProvider";

export function Tabs({ tabs, defaultValue }: { tabs: { value: string; label: string; content: ReactNode }[]; defaultValue?: string }) {
  const tr = useTr();
  return (
    <T.Root defaultValue={defaultValue ?? tabs[0].value}>
      <T.List className="-mx-1 flex gap-1 overflow-x-auto border-b border-line px-1" aria-label={tr("Sections")}>
        {tabs.map((t) => (
          <T.Trigger key={t.value} value={t.value} className="min-h-11 whitespace-nowrap rounded-t-lg border-b-2 border-transparent px-4 text-sm font-semibold text-muted transition-colors hover:bg-emerald-50/60 hover:text-emerald data-[state=active]:border-gold data-[state=active]:text-emerald">{t.label}</T.Trigger>
        ))}
      </T.List>
      {tabs.map((t) => <T.Content key={t.value} value={t.value} className="pt-5">{t.content}</T.Content>)}
    </T.Root>
  );
}
