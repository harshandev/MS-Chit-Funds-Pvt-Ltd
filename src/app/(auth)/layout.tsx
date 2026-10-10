import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded-md focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <DemoBanner />
      <header className="border-b border-line bg-ivory">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="MS Chit Funds home"><Logo /></Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-emerald"><ArrowLeft className="h-4 w-4" />Back to site</Link>
        </div>
      </header>
      <main id="main" className="flex-1 px-4 py-10 sm:py-16">{children}</main>
    </>
  );
}
