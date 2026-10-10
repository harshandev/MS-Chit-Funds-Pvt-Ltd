import type { Metadata } from "next";
import { DocumentsView } from "@/components/admin/DocumentsView";

export const metadata: Metadata = { title: "Documents | Admin" };

export default function Page() {
  return <DocumentsView />;
}
