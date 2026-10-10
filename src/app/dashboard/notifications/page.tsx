import type { Metadata } from "next";
import { NotificationsView } from "@/components/dashboard/views/NotificationsView";

export const metadata: Metadata = { title: "Notifications" };
export default function Page() { return <NotificationsView />; }
