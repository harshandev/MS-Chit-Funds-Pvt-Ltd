import type { Metadata } from "next";
import { ChitsView } from "@/components/admin/ChitsView";

export const metadata: Metadata = { title: "Chit schemes | Admin" };

export default function Page() {
  return <ChitsView />;
}
