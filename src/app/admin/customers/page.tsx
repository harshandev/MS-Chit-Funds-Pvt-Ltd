import type { Metadata } from "next";
import { CustomersView } from "@/components/admin/CustomersView";

export const metadata: Metadata = { title: "Customers | Admin" };

export default function Page() {
  return <CustomersView />;
}
