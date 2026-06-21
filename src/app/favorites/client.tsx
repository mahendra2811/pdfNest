"use client";

import Link from "next/link";
import { Heart, FileText, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFavouritesStore } from "@/lib/store/favourites";
import { TOOL_MAP } from "@/lib/constants/tools";

const GRADIENTS: Record<string, string> = {
  manipulate: "from-red-500 to-red-600",
  security: "from-rose-500 to-rose-700",
  "forms-metadata": "from-orange-500 to-red-500",
  "pdf-to-other": "from-red-500 to-pink-600",
  "other-to-pdf": "from-pink-500 to-red-500",
};

export function FavoritesPageClient(): React.ReactElement {
  const { favourites } = useFavouritesStore();
  const tools = favourites.map((slug) => TOOL_MAP.get(slug)).filter(Boolean);

  if (tools.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Heart className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No favorites yet</h1>
        <p className="text-muted-foreground mb-6">
          Save your most-used PDF tools here for quick access.
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Browse all tools <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => {
          if (!tool) return null;
          const Icon = (
            LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
          )[tool.icon];
          const gradient = GRADIENTS[tool.category] ?? "from-red-500 to-rose-600";
          return (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <Card className="group hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                      gradient
                    )}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4 text-white" />
                    ) : (
                      <FileText className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
