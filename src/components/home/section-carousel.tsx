"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Anime } from "@/types/anime";
import { AnimeCard } from "@/components/anime/anime-card";
import { AnimeCardSkeleton } from "@/components/anime/anime-card-skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface SectionCarouselProps {
  title: string;
  anime: Anime[];
  isLoading?: boolean;
  error?: Error | null;
  onViewAll?: () => void;
  viewAllHref?: string;
  onRetry?: () => void;
  className?: string;
}

export function SectionCarousel({
  title,
  anime,
  isLoading = false,
  error = null,
  onViewAll,
  viewAllHref,
  onRetry,
  className,
}: SectionCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Handle previous slide
  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  // Handle next slide
  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  // Render loading state
  if (isLoading) {
    return (
      <section className={cn("w-full py-8", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h2>
          </div>

          {/* Skeleton Loaders */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimeCardSkeleton count={5} />
          </div>
        </div>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section className={cn("w-full py-8", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h2>
          </div>

          {/* Error Message */}
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-muted-foreground mb-4">
              Failed to load {title}. Please try again.
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Retry
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Render empty state
  if (!anime || anime.length === 0) {
    return (
      <section className={cn("w-full py-8", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h2>
          </div>

          {/* Empty State */}
          <div className="flex items-center justify-center py-12 px-4">
            <p className="text-muted-foreground text-center">
              No content available for this section.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Limit anime to 50 items as per requirements
  const displayAnime = anime.slice(0, 50);

  return (
    <section className={cn("w-full py-8", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h2>

          {/* View All Link */}
          {(onViewAll || viewAllHref) && (
            <>
              {viewAllHref ? (
                <Link
                  href={viewAllHref}
                  className="text-sm sm:text-base font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View All →
                </Link>
              ) : (
                <button
                  onClick={onViewAll}
                  className="text-sm sm:text-base font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View All →
                </button>
              )}
            </>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            disabled={isBeginning}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
              "bg-background/80 backdrop-blur-sm border border-border",
              "flex items-center justify-center",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "hover:bg-background hover:scale-110",
              "disabled:opacity-0 disabled:cursor-not-allowed",
              "-translate-x-1/2",
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            disabled={isEnd}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
              "bg-background/80 backdrop-blur-sm border border-border",
              "flex items-center justify-center",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "hover:bg-background hover:scale-110",
              "disabled:opacity-0 disabled:cursor-not-allowed",
              "translate-x-1/2",
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Swiper Carousel */}
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              // < 640px: 2 slides
              0: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              // 640px - 1023px: 3 slides
              640: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              // 1024px - 1279px: 4 slides
              1024: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
              // >= 1280px: 5 slides
              1280: {
                slidesPerView: 5,
                spaceBetween: 16,
              },
            }}
            speed={450} // Animation duration between 300-600ms
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            className="w-full"
          >
            {displayAnime.map((item, index) => (
              <SwiperSlide key={`${item.mal_id}-${index}`}>
                <AnimeCard
                  anime={item}
                  variant="default"
                  showWatchlistButton={true}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
