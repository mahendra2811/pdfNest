"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavouritesState {
  favourites: string[]; // tool slugs
  toggleFavourite: (slug: string) => void;
  isFavourite: (slug: string) => boolean;
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      favourites: [],
      toggleFavourite: (slug) => {
        const current = get().favourites;
        const next = current.includes(slug)
          ? current.filter((s) => s !== slug)
          : [...current, slug];
        set({ favourites: next });
      },
      isFavourite: (slug) => get().favourites.includes(slug),
    }),
    {
      name: "pdfnest:favourites:v1",
    }
  )
);
