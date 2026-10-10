"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Logo />
      <h1 className="mt-10 text-3xl font-extrabold text-emerald">Something went wrong.</h1>
      <p className="mt-3 max-w-md text-muted">An unexpected error occurred. You can try again, or return to the home page.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/" className={buttonClass("secondary")}>Go home</Link>
      </div>
    </main>
  );
}
