"use client";
import * as T from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";

export function InfoTip({ text }: { text: string }) {
  return (
    <T.Provider delayDuration={100}>
      <T.Root>
        <T.Trigger asChild><button type="button" aria-label="More information" className="inline-flex align-middle text-muted"><Info className="h-4 w-4" /></button></T.Trigger>
        <T.Portal><T.Content sideOffset={6} className="z-50 max-w-xs rounded-md bg-navy px-3 py-2 text-xs text-ivory">{text}</T.Content></T.Portal>
      </T.Root>
    </T.Provider>
  );
}
