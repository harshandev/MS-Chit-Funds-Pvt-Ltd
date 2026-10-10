import type { Metadata } from "next";
import { ProfileView } from "@/components/dashboard/views/ProfileView";

export const metadata: Metadata = { title: "Profile and KYC" };
export default function Page() { return <ProfileView />; }
