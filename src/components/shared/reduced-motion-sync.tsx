"use client";

import { useReducedMotionSync } from "@/hooks/use-reduced-motion";

/** Mount once in root layout to sync prefers-reduced-motion into the Zustand store. */
export function ReducedMotionSync(): null {
  useReducedMotionSync();
  return null;
}
