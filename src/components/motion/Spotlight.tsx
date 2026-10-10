"use client";
import { useRef, type ReactNode } from "react";

/** Container with a cursor-following soft spotlight (CSS vars; no re-renders). */
export function Spotlight({ children, className, color = "212 175 55" }: { children: ReactNode; className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`relative ${className ?? ""}`}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [div:hover>&]:opacity-100" style={{ background: `radial-gradient(500px circle at var(--mx,50%) var(--my,50%), rgb(${color} / 0.14), transparent 60%)` }} />
      {children}
    </div>
  );
}
