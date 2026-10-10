import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/money";
import type { Membership, Scheme } from "@/data/types";
import { formatDate } from "./format";
import { isLiable } from "./summary";

export function membershipMetrics(m: Membership, s: Scheme) {
  const liable = isLiable(m);
  const remaining = Math.max(0, s.rules.instalments - m.currentInstalment);
  return { liable, remaining, future: remaining * s.rules.instalment, nextAmount: s.rules.instalment, progress: Math.min(100, Math.round((m.currentInstalment / s.rules.instalments) * 100)) };
}

export function MembershipCard({ m, s, compact }: { m: Membership; s: Scheme; compact?: boolean }) {
  const k = membershipMetrics(m, s);
  return (
    <Card className="flex flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-emerald">{s.name}</h3>
            <p className="mt-0.5 text-sm text-muted">Ticket no. {m.ticketNo}</p>
          </div>
          <StatusBadge status={m.status} />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted">
            <span>Instalment {m.currentInstalment} of {s.rules.instalments}</span><span>{k.progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Instalments completed" aria-valuemin={0} aria-valuemax={s.rules.instalments} aria-valuenow={m.currentInstalment}>
            <div className="h-full rounded-full bg-emerald" style={{ width: `${k.progress}%` }} />
          </div>
        </div>
        {k.liable ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-muted">Next payment</dt><dd className="font-semibold">{formatINR(k.nextAmount)}</dd><dd className="text-xs text-muted">due {formatDate(m.nextDue)}</dd></div>
            {!compact && <div><dt className="text-xs text-muted">Future obligation</dt><dd className="font-semibold">{formatINR(k.future)}</dd><dd className="text-xs text-muted">{k.remaining} × {formatINR(s.rules.instalment)}</dd></div>}
          </dl>
        ) : (
          <p className="mt-4 rounded-md bg-gold/10 px-3 py-2 text-xs text-[#6b5400]">No payments are due yet. Complete onboarding to activate this ticket.</p>
        )}
        <Link href={`/dashboard/my-chits/${m.id}`} className="mt-5 inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-emerald hover:underline">
          View details<ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </CardBody>
    </Card>
  );
}
