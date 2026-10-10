import { RouteGuard } from "@/components/layout/RouteGuard";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RouteGuard allow="admin">
      <AdminShell>{children}</AdminShell>
    </RouteGuard>
  );
}
