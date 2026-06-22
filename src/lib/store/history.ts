"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 50;

export interface HistoryEntry {
  slug: string;
  /** ISO timestamp of last use */
  usedAt: string;
}

interface HistoryState {
  entries: HistoryEntry[];
  recordUse: (slug: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      recordUse: (slug) => {
        const now = new Date().toISOString();
        const existing = get().entries.filter((e) => e.slug !== slug);
        const next = [{ slug, usedAt: now }, ...existing].slice(0, MAX_HISTORY);
        set({ entries: next });
      },
      clearHistory: () => set({ entries: [] }),
    }),
    {
      name: "pdfnest:history:v1",
    }
  )
);
