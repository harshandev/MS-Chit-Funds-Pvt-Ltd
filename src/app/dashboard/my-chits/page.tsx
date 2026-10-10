import type { Metadata } from "next";
import { MyChitsView } from "@/components/dashboard/views/MyChitsView";

export const metadata: Metadata = { title: "My Chits" };
export default function Page() { return <MyChitsView />; }
