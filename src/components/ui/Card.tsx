import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line/80 bg-white shadow-[0_1px_2px_rgb(24_37_31/0.04),0_10px_28px_-14px_rgb(24_37_31/0.14)]", className)} {...p} />;
}
export function CardBody({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...p} />;
}
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-xs font-bold uppercase tracking-[0.2em] text-gold-antique", className)}>{children}</p>;
}
export function SectionHeading({ eyebrow, title, intro, className }: { eyebrow?: string; title: string; intro?: string; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2 text-3xl font-extrabold text-emerald sm:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-base leading-relaxed text-muted">{intro}</p>}
    </div>
  );
}
