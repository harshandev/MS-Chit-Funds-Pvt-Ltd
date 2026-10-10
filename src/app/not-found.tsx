import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Logo />
      <p className="mt-10 font-serif text-6xl text-gold-antique">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-emerald">We could not find that page.</h1>
      <p className="mt-3 max-w-md text-muted">The link may be out of date or the page may have moved. These pages might help.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("primary")}>Go home</Link>
        <Link href="/chit-plans" className={buttonClass("secondary")}>Explore chit plans</Link>
        <Link href="/contact" className={buttonClass("ghost")}>Contact us</Link>
      </div>
    </main>
  );
}
