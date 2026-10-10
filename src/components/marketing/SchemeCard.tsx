import Link from "next/link";
import { ArrowRight, CalendarClock, FileText, Users, Wallet } from "lucide-react";
import type { Scheme } from "@/data/types";
import { formatINR, formatLakh } from "@/lib/money";
import { StatusBadge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function Stat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted"><Icon className="h-3 w-3 text-gold-antique" aria-hidden />{label}</dt>
      <dd className="mt-0.5 truncate font-bold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function SchemeCard({ scheme, layout = "card" }: { scheme: Scheme; layout?: "card" | "list" }) {
  const r = scheme.rules;
  const list = layout === "list";
  const active = scheme.status === "Active";
  return (
    <article className={cn("group/card relative flex w-full overflow-hidden rounded-2xl border border-line/80 bg-white p-5 shadow-[0_1px_2px_rgb(24_37_31/0.04),0_12px_30px_-16px_rgb(24_37_31/0.16)] transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold-antique/60 hover:shadow-[var(--shadow-3)] sm:p-6", list ? "flex-col gap-5 lg:flex-row lg:items-center" : "flex-col")}>
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", active ? "from-emerald via-gold to-emerald" : "from-line via-gold/50 to-line")} />
      <div className={cn(list && "lg:w-2/5")}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={scheme.status} />
          <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-ink">Illustrative demo scheme</span>
        </div>
        <h3 className="mt-4 font-serif text-3xl text-emerald">{formatLakh(r.grossChit)} <span className="italic text-gold-antique">chit</span></h3>
        <p className="text-sm font-semibold text-ink">{scheme.name}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{scheme.summary}</p>
      </div>
      <dl className={cn("grid grid-cols-3 gap-3 rounded-xl bg-ivory p-3.5 text-sm", list ? "lg:flex-1" : "mt-5")}>
        <Stat icon={Wallet} label="Instalment" value={`${formatINR(r.instalment)}/mo`} />
        <Stat icon={CalendarClock} label="Duration" value={`${r.instalments} mo`} />
        <Stat icon={Users} label="Tickets" value={String(r.tickets)} />
      </dl>
      <div className={cn("flex flex-col", list ? "lg:w-1/4" : "mt-4 flex-1")}>
        <p className="text-sm text-muted">{scheme.commencementNote}</p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link href={`/chit-plans/${scheme.id}`} className={buttonClass("primary", "md", "group/btn transition-transform active:scale-[0.98]")}>View details <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" /></Link>
          <Link href={`/chit-plans/${scheme.id}#terms`} className={buttonClass("ghost", "sm")}><FileText className="h-4 w-4" />Scheme terms</Link>
        </div>
      </div>
    </article>
  );
}
