"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Anime } from "@/types/anime";
import { useWatchlistStore } from "@/store/watchlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
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
  showWatchlistButton = false, // Changed default to false
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
        "group relative flex flex-col rounded-lg overflow-hidden cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:scale-105 hover:shadow-xl hover:z-10",
        "bg-card border border-border/50",
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
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-muted">
        <OptimizedImage
          anime={anime}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          showBlurPlaceholder={true}
          className="object-cover"
        />

        {/* Rating Badge */}
        {anime.score && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-black/80 backdrop-blur-sm">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-semibold">
              {anime.score.toFixed(2)}
            </span>
          </div>
        )}

        {/* Type Badge */}
        {anime.type && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-purple-600 text-white text-xs font-semibold uppercase">
            {anime.type}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        {/* Title */}
        <h3
          className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]"
          title={anime.title}
        >
          {anime.title}
        </h3>

        {/* Year */}
        {anime.year && (
          <p className="text-xs text-muted-foreground">{anime.year}</p>
        )}
      </div>
    </div>
  );
}
