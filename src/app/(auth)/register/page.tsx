import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterWizard } from "@/components/marketing/auth/RegisterWizard";
import { Skeleton } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Start Onboarding",
  description: "A demo walkthrough of the onboarding steps: profile, verification, nominee, documents, scheme selection and agreement review.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <Suspense fallback={<div className="mx-auto max-w-3xl"><Skeleton className="h-96 w-full" /></div>}><RegisterWizard /></Suspense>;
}
