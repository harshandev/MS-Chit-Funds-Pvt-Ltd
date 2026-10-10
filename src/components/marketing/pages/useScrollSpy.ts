"use client";
import { useEffect, useState } from "react";

/** Returns the id of the last section whose top has passed `offset` px from the viewport top. */
export function useScrollSpy(ids: readonly string[], offset = 150): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    const list = key.split("|").filter(Boolean);
    let raf = 0;
    const compute = () => {
      raf = 0;
      let cur = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) cur = id;
      }
      // At the very bottom, the last section wins even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = list[list.length - 1];
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    raf = requestAnimationFrame(compute);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [key, offset]);
  return active;
}
