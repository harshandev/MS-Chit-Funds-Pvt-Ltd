"use client";
import { useTr } from "./LanguageProvider";

/** Translate a static string from a server component: <T>Explore plans</T>. Children must be a plain string. */
export function T({ children, vars }: { children: string; vars?: Record<string, string | number> }) {
  const tr = useTr();
  return <>{tr(children, vars)}</>;
}
