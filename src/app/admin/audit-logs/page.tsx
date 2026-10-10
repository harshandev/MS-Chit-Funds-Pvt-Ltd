import type { Metadata } from "next";
import { AuditLogsView } from "@/components/admin/AuditLogsView";

export const metadata: Metadata = { title: "Audit logs | Admin" };

export default function Page() {
  return <AuditLogsView />;
}
