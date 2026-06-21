"use client";

import { useEffect } from "react";
import { useProcessingStore } from "@/lib/store/processing";

/**
 * Syncs the system `prefers-reduced-motion` preference into the Zustand store.
 * Mount once in the root layout. Components read `useProcessingStore().reducedMotion`
 * to freeze Framer Motion animations when the user has requested reduced motion.
 */
export function useReducedMotionSync(): void {
  const setReducedMotion = useProcessingStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent): void => {
      setReducedMotion(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setReducedMotion]);
}
