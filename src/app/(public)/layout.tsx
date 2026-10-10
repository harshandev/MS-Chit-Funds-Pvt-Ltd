import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded-md focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <DemoBanner />
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
