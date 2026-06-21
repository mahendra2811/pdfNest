"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavouritesStore } from "@/lib/store/favourites";

interface FavouriteButtonProps {
  slug: string;
  toolName: string;
  className?: string;
}

export function FavouriteButton({ slug, toolName, className }: FavouriteButtonProps): React.ReactElement {
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const faved = isFavourite(slug);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleFavourite(slug)}
      aria-label={faved ? `Remove ${toolName} from favorites` : `Add ${toolName} to favorites`}
      className={cn("h-9 w-9", className)}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          faved ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
