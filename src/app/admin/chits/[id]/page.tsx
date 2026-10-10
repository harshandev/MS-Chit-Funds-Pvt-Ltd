import type { Metadata } from "next";
import { ChitDetailView } from "@/components/admin/ChitDetailView";
import { allAdminSchemes } from "@/services/adminExtra";

export const metadata: Metadata = { title: "Scheme detail | Admin" };

export function generateStaticParams() {
  return allAdminSchemes().map((s) => ({ id: s.id }));
}

export default async function Page(props: PageProps<"/admin/chits/[id]">) {
  const { id } = await props.params;
  return <ChitDetailView id={id} />;
}
