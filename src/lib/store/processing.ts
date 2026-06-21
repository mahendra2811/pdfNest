"use client";

import { create } from "zustand";
import type { ProcessingState } from "@/lib/types/tools";

interface ProcessingStore {
  /** Global freeze flag — when true, all Framer Motion animations are disabled */
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;

  /** Per-tool processing state keyed by tool slug */
  states: Record<string, ProcessingState>;
  setState: (slug: string, state: ProcessingState) => void;
  getState: (slug: string) => ProcessingState;
  resetState: (slug: string) => void;
}

const DEFAULT_STATE: ProcessingState = { status: "idle" };

export const useProcessingStore = create<ProcessingStore>()((set, get) => ({
  reducedMotion: false,
  setReducedMotion: (val) => set({ reducedMotion: val }),

  states: {},
  setState: (slug, state) =>
    set((s) => ({ states: { ...s.states, [slug]: state } })),
  getState: (slug) => get().states[slug] ?? DEFAULT_STATE,
  resetState: (slug) =>
    set((s) => ({ states: { ...s.states, [slug]: DEFAULT_STATE } })),
}));
