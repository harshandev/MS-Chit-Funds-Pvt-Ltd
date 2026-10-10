import type { Metadata } from "next";
import { PayoutsView } from "@/components/admin/PayoutsView";

export const metadata: Metadata = { title: "Payouts | Admin" };

export default function Page() {
  return <PayoutsView />;
}
