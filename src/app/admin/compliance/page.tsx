import type { Metadata } from "next";
import { ComplianceView } from "@/components/admin/ComplianceView";

export const metadata: Metadata = { title: "Compliance | Admin" };

export default function Page() {
  return <ComplianceView />;
}
