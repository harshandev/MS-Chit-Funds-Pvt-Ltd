import type { Metadata } from "next";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: { default: "My Dashboard", template: "%s | MS Chit Funds" } };

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <RouteGuard allow="customer">
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
