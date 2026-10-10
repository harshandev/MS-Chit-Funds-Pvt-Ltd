"use client";
import { useState } from "react";
import { adminService } from "@/services";
import { adminExtraService } from "@/services/adminExtra";
import { EmptyState } from "@/components/ui/misc";
import { AdminTable, AsyncView, FilterBar, FilterSearch, FilterSelect, PageHeader, StatusPill, allOption, fmtDate, useLoad } from "./common";

async function load() {
  const [docs, schemes, customers] = await Promise.all([adminExtraService.documents(), adminExtraService.schemes(), adminService.customers()]);
  return { docs, schemes, customers };
}

export function DocumentsView() {
  const { state, retry } = useLoad(load);
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  return (
    <>
      <PageHeader title="Document register" description="Every document the company must hold, by scheme and by customer. No files are stored in this demo: entries marked Not uploaded or Received (demo) have no real file behind them." />
      <AsyncView state={state} retry={retry}>
        {({ docs, schemes, customers }) => {
          const refName = (scopeKind: string, ref: string) => (scopeKind === "Scheme" ? schemes.find((s) => s.id === ref)?.name : customers.find((c) => c.id === ref)?.name) ?? ref;
          const rows = docs.filter((d) => (scope === "all" || d.scope === scope) && (status === "all" || d.status === status) && `${d.type} ${refName(d.scope, d.ref)} ${d.note}`.toLowerCase().includes(q.trim().toLowerCase()));
          const statuses = [...new Set(docs.map((d) => d.status))];
          return (
            <>
              <FilterBar count={rows.length} total={docs.length}>
                <FilterSearch label="Search documents" value={q} onChange={setQ} placeholder="Type, scheme or customer…" />
                <FilterSelect label="Belongs to" value={scope} onChange={setScope} options={[allOption("Schemes and customers"), { value: "Scheme", label: "Schemes" }, { value: "Customer", label: "Customers" }]} />
                <FilterSelect label="Status" value={status} onChange={setStatus} options={[allOption("All statuses"), ...statuses.map((s) => ({ value: s, label: s }))]} />
              </FilterBar>
              <AdminTable caption="Document register" rows={rows} rowKey={(d) => d.id} empty={<EmptyState title="No documents match" text="Adjust the filters." />}
                columns={[
                  { key: "t", header: "Document type", render: (d) => <strong>{d.type}</strong> },
                  { key: "s", header: "Scheme / customer", render: (d) => <span>{refName(d.scope, d.ref)}<span className="block text-xs text-muted">{d.scope}</span></span> },
                  { key: "st", header: "Status", render: (d) => <StatusPill status={d.status} /> },
                  { key: "e", header: "Expiry", render: (d) => fmtDate(d.expiry) },
                  { key: "f", header: "File", render: () => <span className="text-xs text-muted">No file stored</span> },
                  { key: "n", header: "Note", render: (d) => <span className="text-xs text-muted">{d.note}</span> },
                ]} />
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
