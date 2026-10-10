"use client";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { useTr } from "@/i18n/LanguageProvider";

/** Touch-friendly range slider with filled track, large thumb and visible focus ring. */
export function RangeSlider({ label, value, min, max, step = 1, onChange, display, hint, className, tone = "emerald", hideLabel }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
  display?: string; hint?: string; className?: string; tone?: "emerald" | "gold"; hideLabel?: boolean;
}) {
  const tr = useTr();
  const id = useId();
  const clamped = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  const pct = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  const fill = tone === "gold" ? "var(--gold-antique)" : "var(--emerald)";
  return (
    <div className={className}>
      <div className={cn("flex items-baseline justify-between gap-3", hideLabel && "sr-only")}>
        <label htmlFor={id} className="text-sm font-semibold text-ink">{tr(label)}</label>
        {display && <output htmlFor={id} className="text-sm font-bold tabular-nums text-emerald">{display}</output>}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, ${fill} ${pct}%, var(--line) ${pct}%)` }}
        className={cn(
          "mt-3 block h-2 w-full cursor-pointer appearance-none rounded-full focus:outline-none",
          "[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[5px] [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgb(24_37_31/0.25)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[5px] [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:bg-white",
          tone === "gold" ? "[&::-webkit-slider-thumb]:border-gold-antique [&::-moz-range-thumb]:border-gold-antique" : "[&::-webkit-slider-thumb]:border-emerald [&::-moz-range-thumb]:border-emerald",
          "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-gold/40",
        )}
      />
      {hint && <p className="mt-2 text-xs text-muted">{tr(hint)}</p>}
    </div>
  );
}
