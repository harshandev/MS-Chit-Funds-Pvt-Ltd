import type { Metadata, Viewport } from "next";
import { Inter, Manrope, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { company } from "@/config/company";
import { ToastProvider } from "@/components/ui/Toast";
import { DemoAuthProvider } from "@/lib/demoAuth";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${company.displayName} — ${company.tagline}`, template: `%s | ${company.shortName}` },
  description: "Transparent scheme information, understandable chit calculations and a clear digital experience. Demo build — all data is illustrative.",
  openGraph: { title: company.displayName, description: company.tagline, type: "website", locale: "en_IN", siteName: company.displayName },
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#064E3B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${manrope.variable} ${dmSerif.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <LanguageProvider><DemoAuthProvider><ToastProvider>{children}</ToastProvider></DemoAuthProvider></LanguageProvider>
      </body>
    </html>
  );
}
