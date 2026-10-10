"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { SuccessNote } from "@/components/ui/fx";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField, TextAreaField } from "@/components/ui/fields";
import { EmptyState, DemoNote } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import type { SupportTicket } from "@/data/types";
import { DataGate, PageHeader, PanelTitle, Surface } from "../ui";
import { schemeFor, useDashboard, type Snapshot } from "../DashboardData";
import { formatDateTime } from "../format";

const categories = ["Payments", "Auctions", "Documents", "KYC and profile", "Scheme terms", "Other"] as const;
const schema = z.object({
  category: z.enum(categories, { error: "Choose a category." }),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters.").max(100, "Keep the subject under 100 characters."),
  description: z.string().trim().min(20, "Please describe the issue in at least 20 characters.").max(1000, "Keep the description under 1000 characters."),
  chit: z.string(),
  reference: z.string().trim().max(40, "Reference is too long.").regex(/^[A-Za-z0-9-]*$/, "Use letters, numbers and hyphens only."),
});
type Form = z.infer<typeof schema>;

function TicketCard({ t, d }: { t: SupportTicket; d: Snapshot }) {
  const [open, setOpen] = useState(false);
  const mem = t.chitRef ? d.memberships.find((m) => m.id === t.chitRef) : undefined;
  const sc = mem ? schemeFor(d, mem.schemeId) : undefined;
  const panel = `hist-${t.id}`;
  return (
    <Surface>
      <CardBody>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted">{t.id} · {t.category}</p>
            <h3 className="mt-1 text-sm font-bold text-ink">{t.subject}</h3>
            {sc && <p className="text-xs text-muted">{sc.name}</p>}
          </div>
          <StatusBadge status={t.status} />
        </div>
        <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)} className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-emerald hover:underline">
          {open ? "Hide" : "Show"} response history ({t.history.length})<ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div id={panel} key="h" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <ol className="mt-2 space-y-3 border-l-2 border-gold/50 pl-4">
                {t.history.map((h, i) => (
                  <li key={i}><p className="text-xs text-muted"><strong className="text-ink">{h.by}</strong> · <time dateTime={h.at}>{formatDateTime(h.at)}</time></p><p className="text-sm">{h.text}</p></li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Surface>
  );
}

function Support({ d }: { d: Snapshot }) {
  const { addTicket, nextTicketNo } = useDashboard();
  const toast = useToast();
  const [created, setCreated] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { category: undefined, subject: "", description: "", chit: "", reference: "" } });

  function submit(v: Form) {
    const no = nextTicketNo();
    const ref = v.reference ? ` (Reference: ${v.reference})` : "";
    addTicket({ id: no, subject: v.subject, category: v.category, status: "Open", chitRef: v.chit || undefined, history: [{ at: new Date().toISOString(), by: "Customer", text: `${v.description}${ref}` }] });
    toast(`Ticket ${no} created (demo). No message was sent to a real support team.`);
    setCreated(no);
    reset();
  }

  return (
    <>
      <PageHeader title="Support" intro="Raise a complaint or query and track its progress." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Surface className="lg:col-span-2 lg:self-start">
          <CardBody>
            <PanelTitle>Raise a ticket</PanelTitle>
            <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
              <SelectField label="Category" error={errors.category?.message} {...register("category")}>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </SelectField>
              <TextField label="Subject" error={errors.subject?.message} {...register("subject")} />
              <TextAreaField label="Description" error={errors.description?.message} hint="Do not include passwords, OTPs, PAN or Aadhaar numbers." {...register("description")} />
              <SelectField label="Relevant chit (optional)" {...register("chit")}>
                <option value="">Not specific to one chit</option>
                {d.memberships.map((m) => <option key={m.id} value={m.id}>{schemeFor(d, m.schemeId)?.name} · ticket {m.ticketNo}</option>)}
              </SelectField>
              <TextField label="Payment or auction reference (optional)" placeholder="e.g. DEMO-PAY-0006" error={errors.reference?.message} {...register("reference")} />
              <Button type="submit">Submit ticket</Button>
            </form>
            {created && <div className="mt-4"><SuccessNote><p className="font-semibold">Ticket {created} created (demo)</p><p className="text-muted">No message was sent to a real support team.</p></SuccessNote></div>}
            <div className="mt-4"><DemoNote>Demo only: tickets are stored in this browser session and are not sent anywhere.</DemoNote></div>
          </CardBody>
        </Surface>
        <section className="lg:col-span-3" aria-labelledby="tix">
          <PanelTitle id="tix">Your tickets ({d.tickets.length})</PanelTitle>
          {d.tickets.length === 0 ? <EmptyState title="No tickets" text="Tickets you raise will appear here." /> : <Stagger className="space-y-3">{d.tickets.map((t) => <StaggerItem key={t.id}><TicketCard t={t} d={d} /></StaggerItem>)}</Stagger>}
        </section>
      </div>
    </>
  );
}

export function SupportView() { return <DataGate>{(d) => <Support d={d} />}</DataGate>; }
