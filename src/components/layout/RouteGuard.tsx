"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useDemoAuth, type Role } from "@/lib/demoAuth";
import { Skeleton } from "@/components/ui/misc";

export function RouteGuard({ allow, children }: { allow: Exclude<Role, null>; children: ReactNode }) {
  const { role, ready } = useDemoAuth();
  const router = useRouter();
  const path = usePathname();
  const ok = role === allow;
  useEffect(() => {
    if (ready && !ok) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [ready, ok, router, path]);
  if (!ready || !ok) return <div className="p-8"><Skeleton className="h-8 w-64" /><Skeleton className="mt-4 h-40 w-full" /></div>;
  return <>{children}</>;
}
