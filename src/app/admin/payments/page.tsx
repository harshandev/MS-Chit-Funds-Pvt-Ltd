import type { Metadata } from "next";
import { PaymentsView } from "@/components/admin/PaymentsView";

export const metadata: Metadata = { title: "Payments | Admin" };

export default function Page() {
  return <PaymentsView />;
}
