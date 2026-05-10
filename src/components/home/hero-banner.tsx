"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Play, Plus, Check } from "lucide-react";
import { Anime } from "@/types/anime";
import { useWatchlistStore } from "@/store/watchlist";
import { useUIStore } from "@/store/ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface HeroBannerProps {
  anime: Anime[];
  autoplayDelay?: number;
  className?: string;
}

export function HeroBanner({
  anime,
  autoplayDelay = 5000,
  className = "",
}: HeroBannerProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!swiperRef.current) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        swiperRef.current.slidePrev();
        pauseAutoplayTemporarily();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        swiperRef.current.slideNext();
        pauseAutoplayTemporarily();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Pause autoplay for 10 seconds after manual navigation
  const pauseAutoplayTemporarily = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.stop();
      setIsAutoplayPaused(true);

      // Clear existing timeout
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }

      // Resume after 10 seconds
      autoplayTimeoutRef.current = setTimeout(() => {
        if (swiperRef.current?.autoplay) {
          swiperRef.current.autoplay.start();
          setIsAutoplayPaused(false);
        }
      }, 10000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  if (!anime || anime.length === 0 || !mounted) {
    return (
      <div className="relative w-full min-h-[400px] h-[70vh] bg-gradient-to-br from-purple-900 via-blue-900 to-black animate-pulse" />
    );
  }

  return (
    <div
      className={`relative w-full min-h-[400px] h-[70vh] ${className}`}
      role="region"
      aria-label="Featured anime carousel"
    >
      <Swiper
        modules={[Autoplay, Navigation, Keyboard]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        navigation={false}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        className="w-full h-full"
      >
        {anime.map((item) => (
          <SwiperSlide key={item.mal_id}>
            <HeroSlide
              anime={item}
              isActive={activeIndex === anime.indexOf(item)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide indicators */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"
        role="group"
        aria-label="Slide navigation"
      >
        {anime.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              swiperRef.current?.slideToLoop(index);
              pauseAutoplayTemporarily();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                swiperRef.current?.slideToLoop(index);
                pauseAutoplayTemporarily();
              }
            }}
            className={`h-1 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              index === activeIndex
                ? "w-8 bg-white"
                : "w-4 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? "true" : "false"}
            tabIndex={0}
          />
        ))}
      </div>
    </div>
  );
}

interface HeroSlideProps {
  anime: Anime;
  isActive: boolean;
}

function HeroSlide({ anime, isActive }: HeroSlideProps) {
  const { addToWatchlist, isInWatchlist } = useWatchlistStore();
  const { openTrailerModal } = useUIStore();
  const inWatchlist = isInWatchlist(anime.mal_id);

  const handleWatchTrailer = () => {
    // Check if trailer is available
    if (anime.trailer?.embed_url || anime.trailer?.url) {
      const trailerUrl = anime.trailer.embed_url || anime.trailer.url || "";
      openTrailerModal(trailerUrl, anime.title);
    } else {
      toast.info("Trailer not available for this anime");
    }
  };

  const handleAddToWatchlist = () => {
    if (inWatchlist) {
      toast.info("Already in watchlist");
    } else {
      addToWatchlist(anime);
    }
  };

  // Truncate synopsis to 300 characters
  const truncatedSynopsis = anime.synopsis
    ? anime.synopsis.length > 300
      ? anime.synopsis.substring(0, 300) + "..."
      : anime.synopsis
    : "No synopsis available.";

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string | null): string | null => {
    if (!url) return null;

    // Handle embed URLs (including youtube-nocookie.com)
    if (
      url.includes("youtube.com/embed/") ||
      url.includes("youtube-nocookie.com/embed/")
    ) {
      const match = url.match(/\/embed\/([^?&]+)/);
      return match ? match[1] : null;
    }

    // Handle watch URLs
    if (url.includes("youtube.com/watch")) {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : null;
    }

    // Handle short URLs
    if (url.includes("youtu.be/")) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      return match ? match[1] : null;
    }

    return null;
  };

  // Get backdrop image (use YouTube thumbnail for best quality)
  const getBackdropUrl = (): string => {
    // Try to get YouTube ID from url or embed_url
    const trailerUrl = anime.trailer?.url || anime.trailer?.embed_url || null;
    const youtubeId = getYouTubeId(trailerUrl);

    if (youtubeId) {
      // Use YouTube maxresdefault thumbnail (1920x1080)
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    // Fallback to anime image (will be blurry for landscape)
    return (
      anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ""
    );
  };

  const backdropUrl = getBackdropUrl();

  return (
    <div className="relative w-full h-full">
      {/* Backdrop Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {backdropUrl ? (
          <OptimizedImage
            src={backdropUrl}
            alt={anime.title}
            fill
            priority={isActive} // Requirement 20.2: Priority loading for LCP
            className="object-cover object-center"
            sizes="100vw"
            quality={95}
            showBlurPlaceholder={true}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-black" />
        )}
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content with Glassmorphism */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Glassmorphism container */}
            <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {anime.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm sm:text-base">
                {anime.score && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-sm">
                    <span className="text-yellow-400 font-semibold">★</span>
                    <span className="text-white font-medium">
                      {anime.score.toFixed(2)}
                    </span>
                  </div>
                )}
                {anime.type && (
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
                    <span className="text-purple-300 font-medium uppercase">
                      {anime.type}
                    </span>
                  </div>
                )}
                {anime.status && (
                  <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm">
                    <span className="text-blue-300 font-medium capitalize">
                      {anime.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-6 line-clamp-4">
                {truncatedSynopsis}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleWatchTrailer}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-semibold shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Trailer
                </Button>
                <Button
                  onClick={handleAddToWatchlist}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm font-semibold shadow-lg"
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
