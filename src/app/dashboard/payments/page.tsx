import type { Metadata } from "next";
import { PaymentsView } from "@/components/dashboard/views/PaymentsView";

export const metadata: Metadata = { title: "Payments" };
export default function Page() { return <PaymentsView />; }
