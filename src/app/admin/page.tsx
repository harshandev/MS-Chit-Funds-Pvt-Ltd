import type { Metadata } from "next";
import { OverviewView } from "@/components/admin/OverviewView";

export const metadata: Metadata = { title: "Overview | Admin" };

export default function Page() {
  return <OverviewView />;
}
