"use client";
import { useAnimationControls, useReducedMotion, motion } from "motion/react";
import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const LEN = 6;

/** Six single-digit boxes: auto-advance, paste, backspace and arrow navigation, shake on error. */
export function OtpInput({ value, onChange, onComplete, shakeKey = 0, invalid, success, disabled, label = "6-digit one-time password", autoFocus }: {
  value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; shakeKey?: number; invalid?: boolean; success?: boolean; disabled?: boolean; label?: string; autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (shakeKey > 0) refs.current[0]?.focus();
    if (shakeKey > 0 && !reduce) controls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.45 } });
  }, [shakeKey, reduce, controls]);

  const focus = (i: number) => { const el = refs.current[Math.max(0, Math.min(LEN - 1, i))]; el?.focus(); el?.select(); };
  const commit = (next: string, focusAt: number) => {
    const v = next.slice(0, LEN);
    onChange(v);
    if (v.length === LEN) onComplete?.(v); else focus(focusAt);
  };

  const onInput = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) { onChange(value.slice(0, i) + value.slice(i + 1)); return; }
    const at = Math.min(i, value.length);
    if (digits.length > 1 && !value[i]) { commit((value.slice(0, at) + digits).slice(0, LEN), at + digits.length); return; }
    const d = digits.length > 1 ? digits.slice(-1) : digits;
    commit((value.slice(0, at) + d + value.slice(at + 1)).slice(0, LEN), at + 1);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) { e.preventDefault(); onChange(value.slice(0, i - 1) + value.slice(i)); focus(i - 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focus(i - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); focus(i + 1); }
  };
  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    commit((value.slice(0, i) + digits).slice(0, LEN), i + digits.length);
  };

  return (
    <motion.div animate={controls} role="group" aria-label={label} className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length: LEN }, (_, i) => (
        <div key={i} className="relative">
          <input
            ref={(el) => { refs.current[i] = el; }}
            value={value[i] ?? ""}
            onChange={(e) => onInput(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={(e) => onPaste(i, e)}
            onFocus={(e) => e.target.select()}
            autoFocus={autoFocus && i === 0}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${LEN}`}
            aria-invalid={invalid || undefined}
            disabled={disabled || success}
            maxLength={i === 0 ? LEN : 2}
            className={cn(
              "h-14 w-11 rounded-xl border-2 bg-white text-center text-2xl font-extrabold tabular-nums text-emerald shadow-[var(--shadow-1)] transition-[border-color,box-shadow,transform] duration-200 focus:-translate-y-0.5 focus:outline-none focus:ring-4 sm:h-16 sm:w-14",
              success ? "border-emerald bg-emerald-50" : invalid ? "border-danger focus:ring-danger/15" : value[i] ? "border-emerald/60 focus:border-emerald focus:ring-emerald/15" : "border-line focus:border-emerald focus:ring-emerald/15",
            )}
          />
          {success && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: i * 0.06, stiffness: 500, damping: 18 }} aria-hidden className="pointer-events-none absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald text-ivory"><Check className="h-3 w-3" strokeWidth={4} /></motion.span>}
        </div>
      ))}
    </motion.div>
  );
}
