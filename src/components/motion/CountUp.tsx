"use client";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Animates a number up to `value` when scrolled into view. `format` renders each frame. */
export function CountUp({ value, format = (n: number) => String(Math.round(n)), duration = 1.4, className }: { value: number; format?: (n: number) => string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setN });
    return () => c.stop();
  }, [inView, value, duration, reduce]);
  return <span ref={ref} className={className}>{format(reduce ? value : n)}</span>;
}

/** Smoothly tweens between changing values (e.g. calculator output). */
export function AnimatedNumber({ value, format = (n: number) => String(Math.round(n)), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) return;
    const c = animate(from.current, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { from.current = v; setN(v); } });
    return () => c.stop();
  }, [value, reduce]);
  return <span className={className}>{format(reduce ? value : n)}</span>;
}
