import type { Metadata } from "next";
import { ReconciliationView } from "@/components/admin/ReconciliationView";

export const metadata: Metadata = { title: "Reconciliation | Admin" };

export default function Page() {
  return <ReconciliationView />;
}
