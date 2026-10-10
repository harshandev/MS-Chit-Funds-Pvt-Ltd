"use client";
import { Fragment, type ReactNode } from "react";
import { useTr } from "@/i18n/LanguageProvider";

/**
 * Translate a sentence that contains inline markup. The English `text` is the key.
 *  - `<i>word</i>`  -> accent span (serif italic gold by default; override with `accent`)
 *  - `<b>word</b>`  -> bold span (`bold` class)
 *  - `{name}`       -> element from `parts` (e.g. a Link; translate its label with <T>)
 *  - `{n}`          -> plain value from `vars`
 */
export function RichT({ text, parts = {}, vars, accent = "font-serif font-normal italic text-gold-antique", bold = "font-bold text-emerald" }: {
  text: string; parts?: Record<string, ReactNode>; vars?: Record<string, string | number>; accent?: string; bold?: string;
}) {
  const tr = useTr();
  const tv = vars && Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, typeof v === "string" ? tr(v) : v]));
  const out = tr(text, tv).split(/(<i>.*?<\/i>|<b>.*?<\/b>|\{\w+\})/g);
  return (
    <>
      {out.map((seg, i) => {
        if (seg.startsWith("<i>")) return <span key={i} className={accent}>{seg.slice(3, -4)}</span>;
        if (seg.startsWith("<b>")) return <strong key={i} className={bold}>{seg.slice(3, -4)}</strong>;
        const m = /^\{(\w+)\}$/.exec(seg);
        return <Fragment key={i}>{m && m[1] in parts ? parts[m[1]] : seg}</Fragment>;
      })}
    </>
  );
}
