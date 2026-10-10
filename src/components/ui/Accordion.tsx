"use client";
import * as A from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export function Accordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <A.Root type="single" collapsible className="divide-y divide-line rounded-lg border border-line bg-white">
      {items.map((it, i) => (
        <A.Item key={i} value={`i${i}`}>
          <A.Header>
            <A.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 px-5 text-left font-semibold text-ink">
              {it.q}
              <ChevronDown className="h-5 w-5 shrink-0 text-gold-antique transition-transform group-data-[state=open]:rotate-180" />
            </A.Trigger>
          </A.Header>
          <A.Content className="overflow-hidden px-5 pb-5 text-sm leading-relaxed text-muted">{it.a}</A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
