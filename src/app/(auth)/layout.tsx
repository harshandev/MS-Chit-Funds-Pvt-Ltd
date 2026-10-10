import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { AuthBrandPanel } from "@/components/marketing/auth/AuthBrandPanel";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded-md focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <DemoBanner />
      <div className="grid flex-1 lg:grid-cols-[5fr_6fr]">
        <AuthBrandPanel />
        <div className="flex flex-col bg-ivory px-4 py-6 sm:px-10 lg:py-10">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-1 rounded-lg text-sm font-semibold text-emerald transition-colors hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Back to site</Link>
          <main id="main" className="flex flex-1 items-center justify-center py-6">{children}</main>
        </div>
      </div>
    </>
  );
}
