import type { Metadata } from "next";
import { SupportView } from "@/components/admin/SupportView";

export const metadata: Metadata = { title: "Support | Admin" };

export default function Page() {
  return <SupportView />;
}
