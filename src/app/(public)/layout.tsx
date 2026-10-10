import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { PageTransition } from "@/components/motion/PageTransition";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[90] focus:rounded-md focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <ScrollProgress />
      <DemoBanner />
      <SiteHeader />
      <main id="main" className="flex-1"><PageTransition>{children}</PageTransition></main>
      <SiteFooter />
    </>
  );
}
