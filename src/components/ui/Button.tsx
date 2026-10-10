import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const styles: Record<Variant, string> = {
  primary: "bg-emerald text-ivory hover:bg-emerald-700",
  secondary: "border border-emerald text-emerald hover:bg-emerald-50",
  gold: "bg-gold text-navy hover:bg-gold-antique",
  ghost: "text-emerald hover:bg-emerald-50",
  danger: "bg-danger text-white hover:opacity-90",
};
const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
};
const base = "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, styles[variant], sizes[size], extra);
}

type Props = { variant?: Variant; size?: Size; href?: string; children: ReactNode; className?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ variant, size, href, children, className, ...rest }: Props) {
  if (href) return <Link href={href} className={buttonClass(variant, size, className)}>{children}</Link>;
  return <button className={buttonClass(variant, size, className)} {...rest}>{children}</button>;
}
