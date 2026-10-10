import { demoMode } from "@/config/company";
export function DemoBanner() {
  if (!demoMode.enabled) return null;
  return (
    <div role="note" className="relative z-40 bg-gold px-4 py-1.5 text-center text-xs font-bold tracking-wide text-navy">
      <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-navy align-middle" />{demoMode.banner}
    </div>
  );
}
