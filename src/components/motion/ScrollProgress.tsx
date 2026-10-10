"use client";
import { motion, useScroll, useSpring } from "motion/react";

/** Thin gold reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[80] h-0.5 origin-left bg-gold" style={{ scaleX }} />;
}
