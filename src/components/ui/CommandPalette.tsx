"use client";
import * as D from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, Search, ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface PaletteItem {
  id: string;
  label: string;
  group: string;
  icon?: LucideIcon;
  hint?: string;
  keywords?: string;
  run: () => void;
}

/** Registers Cmd/Ctrl+K to toggle the palette. */
export function useCommandKey(toggle: () => void) {
  useEffect(() => {
    const h = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); toggle(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggle]);
}

const isMac = () => /Mac|iPhone|iPad/i.test(navigator.platform);
export function ShortcutHint({ className }: { className?: string }) {
  const mac = useSyncExternalStore(() => () => {}, isMac, () => false);
  return <kbd className={cn("rounded-md border px-1.5 py-0.5 font-sans text-[10px] font-semibold", className)}>{mac ? "⌘ K" : "Ctrl K"}</kbd>;
}

function Body({ items, placeholder, accent, onDone }: { items: PaletteItem[]; placeholder: string; accent: "emerald" | "navy"; onDone: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const filtered = useMemo(() => {
    const t = q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((i) => { const h = `${i.label} ${i.group} ${i.keywords ?? ""}`.toLowerCase(); return t.every((x) => h.includes(x)); });
  }, [items, q]);
  const idx = Math.min(active, Math.max(0, filtered.length - 1));
  const groups = useMemo(() => {
    const out: { name: string; rows: PaletteItem[] }[] = [];
    for (const i of filtered) { const g = out.find((x) => x.name === i.group); if (g) g.rows.push(i); else out.push({ name: i.group, rows: [i] }); }
    return out;
  }, [filtered]);
  const run = (i: PaletteItem | undefined) => { if (!i) return; onDone(); i.run(); };
  const optId = (i: PaletteItem) => `${listId}-${i.id}`;
  const cur = filtered[idx];

  useEffect(() => { if (cur) document.getElementById(`${listId}-${cur.id}`)?.scrollIntoView({ block: "nearest" }); }, [cur, listId]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(filtered.length ? (idx + 1) % filtered.length : 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(filtered.length ? (idx - 1 + filtered.length) % filtered.length : 0); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(Math.max(0, filtered.length - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(cur); }
  };
  const act = accent === "navy" ? "text-navy" : "text-emerald";
  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className={cn("h-5 w-5 shrink-0", act)} aria-hidden />
        <input
          autoFocus role="combobox" aria-expanded aria-controls={listId} aria-autocomplete="list" aria-activedescendant={cur ? optId(cur) : undefined} aria-label="Search pages and actions"
          value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey} placeholder={placeholder}
          className="min-h-14 w-full bg-transparent text-base text-ink placeholder:text-muted/70 focus-visible:outline-none!"
        />
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:block">Esc</kbd>
      </div>
      <ul id={listId} role="listbox" aria-label="Results" className="max-h-[min(60dvh,24rem)] overflow-y-auto overscroll-contain p-2">
        {groups.map((g) => (
          <li key={g.name} role="presentation" className="mb-1">
            <p role="presentation" className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{g.name}</p>
            <ul role="group" aria-label={g.name}>
              {g.rows.map((i) => {
                const on = cur?.id === i.id;
                const Icon = i.icon;
                return (
                  <li key={i.id} id={optId(i)} role="option" aria-selected={on} onMouseMove={() => { const n = filtered.indexOf(i); if (n !== idx) setActive(n); }} onClick={() => run(i)}
                    className={cn("relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium", on ? "text-ink" : "text-ink/80")}>
                    {on && <motion.span layoutId={`pal-${listId}`} className={cn("absolute inset-0 rounded-xl", accent === "navy" ? "bg-navy/8" : "bg-emerald-50")} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                    {Icon && <Icon className={cn("relative h-4 w-4 shrink-0", on ? act : "text-muted")} aria-hidden />}
                    <span className="relative min-w-0 flex-1 truncate">{i.label}</span>
                    {i.hint && <span className="relative hidden truncate text-xs text-muted sm:block">{i.hint}</span>}
                    {on && <CornerDownLeft className="relative h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
        {filtered.length === 0 && <li role="presentation" className="px-3 py-10 text-center text-sm text-muted">No pages or actions match “{q}”.</li>}
      </ul>
      <p className="sr-only" role="status" aria-live="polite">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
      <div className="hidden items-center gap-4 border-t border-line bg-ivory/60 px-4 py-2 text-[11px] text-muted sm:flex">
        <span className="inline-flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" aria-hidden />navigate</span>
        <span className="inline-flex items-center gap-1"><CornerDownLeft className="h-3 w-3" aria-hidden />select</span>
        <span className="ml-auto">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>
    </>
  );
}

/** Cmd/Ctrl+K palette: filter-as-you-type, arrow keys + Enter, Esc to close. */
export function CommandPalette({ open, onOpenChange, items, placeholder = "Search pages and actions…", title = "Quick search", accent = "emerald" }: {
  open: boolean; onOpenChange: (o: boolean) => void; items: PaletteItem[]; placeholder?: string; title?: string; accent?: "emerald" | "navy";
}) {
  const reduce = useReducedMotion();
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <D.Portal forceMount>
            <D.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[65] bg-navy/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
            </D.Overlay>
            <div className="pointer-events-none fixed inset-0 z-[66] flex items-start justify-center px-3 pt-[8dvh] sm:pt-[14dvh]">
              <D.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-3)]"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                >
                  <D.Title className="sr-only">{title}</D.Title>
                  <Body items={items} placeholder={placeholder} accent={accent} onDone={() => onOpenChange(false)} />
                </motion.div>
              </D.Content>
            </div>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  );
}
