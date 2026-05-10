"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Anime } from "@/types/anime";
import { useWatchlistStore } from "@/store/watchlist";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface AnimeCardProps {
  anime: Anime;
  variant?: "default" | "compact" | "detailed";
  showWatchlistButton?: boolean;
  onCardClick?: (animeId: number) => void;
  className?: string;
  index?: number;
}

// Memoize component to prevent unnecessary re-renders
export const AnimeCard = memo(function AnimeCard({
  anime,
  variant = "default",
  showWatchlistButton = false,
  onCardClick,
  className,
  index = 0,
}: AnimeCardProps) {
  const router = useRouter();
  const { isInWatchlist } = useWatchlistStore();
  const [isInList, setIsInList] = useState(false);

  // Check if anime is in watchlist
  useEffect(() => {
    setIsInList(isInWatchlist(anime.mal_id));
  }, [anime.mal_id, isInWatchlist]);

  // Handle card click navigation
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(anime.mal_id);
    } else {
      router.push(`/anime/${anime.mal_id}`);
    }
  };

  // Reduced animation - only fade in, no stagger for better performance
  const shouldAnimate = index < 12; // Only animate first 12 cards

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        delay: shouldAnimate ? index * 0.03 : 0,
      }}
      onClick={handleCardClick}
      className={cn(
        "relative flex flex-col rounded-lg overflow-hidden cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 hover:z-10",
        "bg-card border border-border/50",
        "will-change-transform",
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
          className="object-cover transition-transform duration-300 hover:scale-110"
          priority={index < 6}
        />

        {/* Simple shine effect - only CSS, no group dependency */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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
    </motion.div>
  );
});
