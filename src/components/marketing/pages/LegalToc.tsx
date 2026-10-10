"use client";
import { SectionNav } from "./SectionNav";
import { useScrollSpy } from "./useScrollSpy";

export function LegalToc({ items }: { items: { id: string; label: string }[] }) {
  const active = useScrollSpy(items.map((i) => i.id), 140);
  return <SectionNav items={items} active={active} uid="legal" title="Contents" />;
}
