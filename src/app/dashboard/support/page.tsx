import type { Metadata } from "next";
import { SupportView } from "@/components/dashboard/views/SupportView";

export const metadata: Metadata = { title: "Support" };
export default function Page() { return <SupportView />; }
