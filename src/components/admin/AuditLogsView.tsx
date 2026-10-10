"use client";
import { useState } from "react";
import { adminService } from "@/services";
import type { AuditLog } from "@/data/types";
import { EmptyState } from "@/components/ui/misc";
import { useAdminState } from "./AdminState";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, PageHeader, SimulatedTag, allOption, fmtDateTime, useLoad } from "./common";

type Row = AuditLog & { source: "seed" | "session" };

export function AuditLogsView() {
  const { state, retry } = useLoad(adminService.audit);
  const { audit } = useAdminState();
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("all");
  const [source, setSource] = useState("all");
  return (
    <>
      <PageHeader title="Audit logs" description="Who did what, to which record, and why. Entries from this session are merged with the demo history." />
      <p role="note" className="mb-4 rounded-md border border-navy/20 bg-navy/5 px-3 py-2 text-xs text-navy">
        <strong>Production requirement:</strong> audit logs must be append-only and tamper-evident (for example hash-chained or written to write-once storage), written and enforced server-side from the authenticated identity, and never editable from the browser. The entries below are demonstration data plus actions you took in this browser session (cleared on reload).
      </p>
      <AsyncView state={state} retry={retry}>
        {(seed) => {
          const all: Row[] = [...audit, ...seed.map((s): Row => ({ ...s, source: "seed" }))].sort((a, b) => b.at.localeCompare(a.at));
          const actors = [...new Set(all.map((r) => r.actor))];
          const rows = all.filter((r) => (actor === "all" || r.actor === actor) && (source === "all" || r.source === source) &&
            `${r.action} ${r.entity} ${r.reason} ${r.previous ?? ""} ${r.next ?? ""} ${r.approvalRef ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
          return (
            <>
              <FilterBar count={rows.length} total={all.length}>
                <FilterSearch label="Search logs" value={q} onChange={setQ} placeholder="Action, entity, reason, approval ref…" />
                <FilterSelect label="Actor" value={actor} onChange={setActor} options={[allOption("All actors"), ...actors.map((a) => ({ value: a, label: a }))]} />
                <FilterSelect label="Source" value={source} onChange={setSource} options={[allOption("All"), { value: "session", label: "This session" }, { value: "seed", label: "Demo history" }]} />
              </FilterBar>
              <AdminTable caption="Audit log entries" rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="No entries match" text="Perform an action in the console or clear the filters." />}
                columns={[
                  { key: "at", header: "Timestamp", render: (r) => <span className="whitespace-nowrap">{fmtDateTime(r.at)}</span> },
                  { key: "ac", header: "Actor", render: (r) => <span className="break-all">{r.actor}</span> },
                  { key: "act", header: "Action", render: (r) => <span className="inline-flex flex-wrap items-center gap-1.5">{r.action}{r.source === "session" && <SimulatedTag label="This session" />}</span> },
                  { key: "en", header: "Entity", render: (r) => <span className="font-mono text-xs">{r.entity}</span> },
                  { key: "pr", header: "Previous", render: (r) => r.previous ?? "—" },
                  { key: "nx", header: "New", render: (r) => r.next ?? "—" },
                  { key: "re", header: "Reason", render: (r) => <span className="text-xs">{r.reason || "—"}</span> },
                  { key: "ap", header: "Approval ref", render: (r) => <span className="font-mono text-xs">{r.approvalRef ?? "—"}</span> },
                ]} />
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
