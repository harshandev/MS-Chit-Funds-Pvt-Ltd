"use client";
import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };

/**
 * Runs an async loader on mount and on retry. `load` must be referentially
 * stable (a module-level function or a useCallback result).
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; state: AsyncState<T> } | null>(null);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => { if (!cancelled) setResult({ attempt, state: { status: "ready", data } }); },
      (e: unknown) => { if (!cancelled) setResult({ attempt, state: { status: "error", error: e instanceof Error ? e.message : "Unable to load data." } }); },
    );
    return () => { cancelled = true; };
  }, [load, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const state: AsyncState<T> = result && result.attempt === attempt ? result.state : { status: "loading" };
  return { ...state, retry };
}
