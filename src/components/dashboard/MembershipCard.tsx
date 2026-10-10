"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { formatINR } from "@/lib/money";
import type { Membership, Scheme } from "@/data/types";
import { useTr } from "@/i18n/LanguageProvider";
import { useDates } from "./format";
import { isLiable } from "./summary";
import { StatusChip, Surface } from "./ui";

export function membershipMetrics(m: Membership, s: Scheme) {
  const liable = isLiable(m);
  const remaining = Math.max(0, s.rules.instalments - m.currentInstalment);
  return { liable, remaining, future: remaining * s.rules.instalment, nextAmount: s.rules.instalment, progress: Math.min(100, Math.round((m.currentInstalment / s.rules.instalments) * 100)) };
}

/** Ticket-style membership card: coloured header, perforated divider, progress ring stub. */
export function MembershipCard({ m, s, compact }: { m: Membership; s: Scheme; compact?: boolean }) {
  const k = membershipMetrics(m, s);
  const reduce = useReducedMotion();
  const tr = useTr();
  const { formatDate } = useDates();
  return (
    <motion.div whileHover={reduce ? undefined : { y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="h-full">
      <Surface hover className="relative flex h-full flex-col overflow-hidden">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald to-emerald-700 p-5 text-ivory">
          <div aria-hidden className="aurora pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{tr("Chit ticket")}</p>
              <h3 className="mt-1 font-heading text-base font-bold leading-snug">{tr(s.name)}</h3>
              <p className="mt-0.5 text-sm text-ivory/70">{tr("Ticket no. {n}", { n: m.ticketNo })}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white p-0.5"><StatusChip status={m.status} /></span>
          </div>
        </div>
        <div aria-hidden className="relative h-0 border-t-2 border-dashed border-line">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-line/80 bg-ivory" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-line/80 bg-ivory" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={k.progress} size={72} stroke={7} label={tr("{p}% of instalments completed ({n} of {m})", { p: k.progress, n: m.currentInstalment, m: s.rules.instalments })}>
              <span className="text-sm font-extrabold tabular-nums text-emerald">{k.progress}%</span>
            </ProgressRing>
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-ink">{tr("Instalment {n} of {m}", { n: m.currentInstalment, m: s.rules.instalments })}</p>
              <p className="text-xs text-muted">{tr("{n} remaining", { n: k.remaining })}</p>
            </div>
          </div>
          {k.liable ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted">{tr("Next payment")}</dt><dd className="font-semibold tabular-nums">{formatINR(k.nextAmount)}</dd><dd className="text-xs text-muted">{tr("due {date}", { date: formatDate(m.nextDue) })}</dd></div>
              {!compact && <div><dt className="text-xs text-muted">{tr("Future obligation")}</dt><dd className="font-semibold tabular-nums">{formatINR(k.future)}</dd><dd className="text-xs text-muted">{k.remaining} × {formatINR(s.rules.instalment)}</dd></div>}
            </dl>
          ) : (
            <p className="mt-4 rounded-xl bg-gold/10 px-3 py-2 text-xs text-warning">{tr("No payments are due yet. Complete onboarding to activate this ticket.")}</p>
          )}
          <Link href={`/dashboard/my-chits/${m.id}`} className="group mt-5 inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-emerald">
            <span className="underline-offset-4 group-hover:underline">{tr("View details")}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </Surface>
    </motion.div>
  );
}
