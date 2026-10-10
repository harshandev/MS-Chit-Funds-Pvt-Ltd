import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/marketing/auth/LoginForm";
import { Skeleton } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Demo sign-in with a mobile number and a development OTP.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <Suspense fallback={<div className="mx-auto max-w-md"><Skeleton className="h-96 w-full" /></div>}><LoginForm /></Suspense>;
}
