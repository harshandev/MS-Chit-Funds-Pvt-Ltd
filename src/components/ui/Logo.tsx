import { cn } from "@/lib/cn";
import { company } from "@/config/company";

/** Provisional original mark: MS monogram in a ring. Replace with the official logo when supplied. */
export function LogoMark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const ring = tone === "light" ? "var(--emerald)" : "var(--gold)";
  const text = tone === "light" ? "var(--emerald)" : "var(--ivory)";
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9 shrink-0", className)} role="img" aria-label={`${company.shortName} logo`}>
      <circle cx="24" cy="24" r="22" fill="none" stroke={ring} strokeWidth="2" />
      <circle cx="24" cy="24" r="17.5" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 3" />
      <text x="24" y="29.5" textAnchor="middle" fontFamily="var(--font-manrope), sans-serif" fontWeight="800" fontSize="17" fill={text} letterSpacing="-1">MS</text>
    </svg>
  );
}

export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap", className)}>
      <LogoMark tone={tone} />
      <span className="leading-tight">
        <span className={cn("block font-heading text-[17px] font-extrabold tracking-tight", tone === "light" ? "text-emerald" : "text-ivory")}>MS Chit Funds</span>
        <span className={cn("block text-[10px] font-semibold uppercase tracking-[0.18em]", tone === "light" ? "text-gold-antique" : "text-gold")}>Pvt. Ltd.</span>
      </span>
    </span>
  );
}
