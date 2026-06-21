import type { Metadata } from "next";
import { FavoritesPageClient } from "./client";

export const metadata: Metadata = {
  title: "Favorites — pdfNest",
  description: "Your saved favorite PDF tools on pdfNest.",
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
