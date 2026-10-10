import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { Scheme } from "@/data/types";
import { formatINR, formatLakh } from "@/lib/money";
import { StatusBadge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 font-bold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function SchemeCard({ scheme, layout = "card" }: { scheme: Scheme; layout?: "card" | "list" }) {
  const r = scheme.rules;
  const list = layout === "list";
  return (
    <article className={cn("flex rounded-lg border border-line bg-white p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)] sm:p-6", list ? "flex-col gap-5 lg:flex-row lg:items-center" : "flex-col")}>
      <div className={cn(list && "lg:w-2/5")}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={scheme.status} />
          <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-ink">Illustrative demo scheme</span>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-emerald">{formatLakh(r.grossChit)} chit</h3>
        <p className="text-sm font-semibold text-ink">{scheme.name}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{scheme.summary}</p>
      </div>
      <dl className={cn("grid grid-cols-3 gap-4 border-y border-line py-4 text-sm", list ? "lg:flex-1 lg:border-y-0 lg:border-x lg:px-5 lg:py-0" : "mt-5")}>
        <Stat label="Instalment" value={`${formatINR(r.instalment)}/mo`} />
        <Stat label="Duration" value={`${r.instalments} months`} />
        <Stat label="Tickets" value={String(r.tickets)} />
      </dl>
      <div className={cn("flex flex-col", list ? "lg:w-1/4" : "mt-4 flex-1")}>
        <p className="text-sm text-muted">{scheme.commencementNote}</p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link href={`/chit-plans/${scheme.id}`} className={buttonClass("primary")}>View details <ArrowRight className="h-4 w-4" /></Link>
          <Link href={`/chit-plans/${scheme.id}#terms`} className={buttonClass("ghost", "sm")}><FileText className="h-4 w-4" />Scheme terms</Link>
        </div>
      </div>
    </article>
  );
}
