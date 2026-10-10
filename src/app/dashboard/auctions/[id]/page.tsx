import type { Metadata } from "next";
import { auctions } from "@/data/demo";
import { AuctionDetailView } from "@/components/dashboard/views/AuctionDetailView";

export const metadata: Metadata = { title: "Auction details" };
export function generateStaticParams() { return auctions.map((a) => ({ id: a.id })); }

export default async function Page({ params }: PageProps<"/dashboard/auctions/[id]">) {
  const { id } = await params;
  return <AuctionDetailView id={id} />;
}
