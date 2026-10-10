import type { ReactNode } from "react";

/** Infinite horizontal ticker (pure CSS; pauses on hover; static under reduced motion). */
export function Marquee({ children, className, speed = 40 }: { children: ReactNode; className?: string; speed?: number }) {
  return (
    <div className={`group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] ${className ?? ""}`}>
      {[0, 1].map((i) => (
        <div key={i} aria-hidden={i === 1} className="marquee-track flex shrink-0 items-center gap-10 pr-10 group-hover:[animation-play-state:paused]" style={{ animationDuration: `${speed}s` }}>
          {children}
        </div>
      ))}
    </div>
  );
}
