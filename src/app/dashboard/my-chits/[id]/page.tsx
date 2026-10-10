import type { Metadata } from "next";
import { memberships } from "@/data/demo";
import { ChitDetailView } from "@/components/dashboard/views/ChitDetailView";

export const metadata: Metadata = { title: "Chit details" };
export function generateStaticParams() { return memberships.map((m) => ({ id: m.id })); }

export default async function Page({ params }: PageProps<"/dashboard/my-chits/[id]">) {
  const { id } = await params;
  return <ChitDetailView id={id} />;
}
