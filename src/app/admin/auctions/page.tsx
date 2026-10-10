import type { Metadata } from "next";
import { AuctionsView } from "@/components/admin/AuctionsView";

export const metadata: Metadata = { title: "Auctions | Admin" };

export default function Page() {
  return <AuctionsView />;
}
