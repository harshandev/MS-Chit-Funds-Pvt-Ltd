"use client";
import { motion, useReducedMotion } from "motion/react";

/** Gold hairline that draws itself when the footer scrolls into view. */
export function FooterLine() {
  const reduce = useReducedMotion();
  return (
    <motion.div aria-hidden className="h-px origin-left bg-gradient-to-r from-gold via-gold-soft to-transparent" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
  );
}

/** Oversized editorial wordmark that rises into place. */
export function Wordmark({ text }: { text: string }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="select-none overflow-hidden pb-4">
      <motion.p className="whitespace-nowrap font-serif text-[17vw] leading-[0.9] tracking-tight text-ivory/[0.07] sm:text-[12vw] lg:text-[10.5rem]" initial={reduce ? false : { y: "60%", opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        {text}
      </motion.p>
    </div>
  );
}
