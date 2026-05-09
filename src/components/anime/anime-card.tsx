"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Anime } from "@/types/anime";
import { useWatchlistStore } from "@/store/watchlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";

interface AnimeCardProps {
  anime: Anime;
  variant?: "default" | "compact" | "detailed";
  showWatchlistButton?: boolean;
  onCardClick?: (animeId: number) => void;
  className?: string;
}

export function AnimeCard({
  anime,
  variant = "default",
  showWatchlistButton = true,
  onCardClick,
  className,
}: AnimeCardProps) {
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useWatchlistStore();
  const [isInList, setIsInList] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Check if anime is in watchlist
  useEffect(() => {
    setIsInList(isInWatchlist(anime.mal_id));
  }, [anime.mal_id, isInWatchlist]);

  // Detect touch capability
  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      );
    };
    setIsTouchDevice(checkTouchDevice());
  }, []);

  // Format score with 2 decimal places or show N/A
  const formatScore = (score: number | null): string => {
    if (score === null || score === undefined) {
      return "N/A";
    }
    return `${score.toFixed(2)}/10.00`;
  };

  // Get poster image URL with fallback
  const getPosterUrl = (): string => {
    return (
      anime.images?.jpg?.image_url ||
      anime.images?.webp?.image_url ||
      "/placeholder-anime.jpg"
    );
  };

  // Handle card click navigation
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(anime.mal_id);
    } else {
      router.push(`/anime/${anime.mal_id}`);
    }
  };

  // Handle watchlist toggle with optimistic UI update
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Optimistic UI update
    setIsInList(!isInList);

    // Perform actual operation
    if (isInList) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist(anime);
    }
  };

  // Handle touch events for touch devices
  const handleTouchStart = () => {
    if (isTouchDevice) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (isTouchDevice) {
      setIsPressed(false);
    }
  };

  // Variant-specific dimensions
  const dimensions = {
    default: "w-[280px] h-[420px]",
    compact: "w-[200px] h-[300px]",
    detailed: "w-[320px] h-[480px]",
  };

  const posterHeights = {
    default: "h-[320px]",
    compact: "h-[220px]",
    detailed: "h-[360px]",
  };

  // Truncate synopsis for detailed variant
  const truncateSynopsis = (text: string | null, maxLength: number): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border border-border/50 bg-card p-3 cursor-pointer overflow-hidden",
        "transition-all duration-200 ease-out",
        // Hover effects for non-touch devices
        !isTouchDevice &&
          "hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-purple-500/50",
        // Touch effects for touch devices
        isTouchDevice &&
          isPressed &&
          "scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)] border-purple-500/50",
        dimensions[variant],
        className,
      )}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${anime.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Poster Image */}
      <div
        className={cn(
          "relative w-full rounded-md overflow-hidden bg-muted",
          posterHeights[variant],
        )}
      >
        <Image
          src={getPosterUrl()}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to a solid color background if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>

      {/* Title */}
      <div className="flex-1 space-y-2">
        <h3
          className="font-medium text-sm leading-tight line-clamp-2"
          title={anime.title}
        >
          {anime.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatScore(anime.score)}
            </Badge>
            <span className="capitalize">{anime.type || "N/A"}</span>
          </div>
          <span className="capitalize text-xs">{anime.status || "N/A"}</span>
        </div>

        {/* Synopsis for detailed variant */}
        {variant === "detailed" && anime.synopsis && (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {truncateSynopsis(anime.synopsis, 150)}
          </p>
        )}
      </div>

      {/* Watchlist Button */}
      {showWatchlistButton && (
        <Button
          onClick={handleWatchlistToggle}
          variant={isInList ? "secondary" : "default"}
          size="sm"
          className="w-full min-h-[44px] touch-manipulation"
          aria-label={
            isInList
              ? `Remove ${anime.title} from watchlist`
              : `Add ${anime.title} to watchlist`
          }
        >
          {isInList ? (
            <>
              <Check className="size-4" />
              Remove from Watchlist
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Add to Watchlist
            </>
          )}
        </Button>
      )}
    </div>
  );
}
