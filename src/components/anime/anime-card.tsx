"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  index?: number; // For staggered animation
}

export function AnimeCard({
  anime,
  variant = "default",
  showWatchlistButton = false,
  onCardClick,
  className,
  index = 0,
}: AnimeCardProps) {
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useWatchlistStore();
  const [isInList, setIsInList] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Parallax tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animation for smooth tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouchDevice) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseXPos = (e.clientX - centerX) / (rect.width / 2);
    const mouseYPos = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05, // Staggered animation
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "group relative flex flex-col rounded-lg overflow-hidden cursor-pointer",
        "transition-shadow duration-200 ease-out",
        "hover:shadow-[0_20px_50px_rgba(168,85,247,0.3)] hover:z-10",
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
      <motion.div
        className="relative w-full aspect-[2/3] overflow-hidden bg-muted"
        style={{
          transform: "translateZ(20px)",
        }}
      >
        <OptimizedImage
          anime={anime}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          showBlurPlaceholder={true}
          className="object-cover"
        />

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            transform: "translateZ(30px)",
          }}
        />

        {/* Rating Badge */}
        {anime.score && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-black/80 backdrop-blur-sm"
            style={{
              transform: "translateZ(40px)",
            }}
          >
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-semibold">
              {anime.score.toFixed(2)}
            </span>
          </motion.div>
        )}

        {/* Type Badge */}
        {anime.type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + 0.3 }}
            className="absolute top-2 right-2 px-2 py-1 rounded bg-purple-600 text-white text-xs font-semibold uppercase"
            style={{
              transform: "translateZ(40px)",
            }}
          >
            {anime.type}
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.2 }}
        className="p-3 flex flex-col gap-2"
        style={{
          transform: "translateZ(30px)",
        }}
      >
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
      </motion.div>
    </motion.div>
  );
}
