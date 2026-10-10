import { demoMode } from "@/config/company";
export function DemoBanner() {
  if (!demoMode.enabled) return null;
  return <div role="note" className="bg-gold px-4 py-1.5 text-center text-xs font-bold tracking-wide text-navy">{demoMode.banner}</div>;
}
