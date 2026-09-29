"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  fetchTopAnime,
  fetchTrendingAnime,
  fetchSeasonalAnime,
} from "@/lib/api/anilist";
import { HeroBanner, SectionCarousel } from "@/components/home";
import { HeroSkeleton } from "@/components/loading";

export default function Home() {
  const [enableSeasonal, setEnableSeasonal] = useState(false);

  // Fetch top anime ONCE for both hero and top rated section - optimized to reduce API calls
  const { data: topAnimeData, isLoading: topAnimeLoading } = useQuery({
    queryKey: ["top-anime-combined"],
    queryFn: () => fetchTopAnime(15), // Fetch 15 items, use first 5 for hero
    staleTime: 600000,
    gcTime: 1200000,
  });

  // Split data for hero (first 5) and top rated (all 15)
  const heroAnime = topAnimeData?.slice(0, 5);
  const topRatedAnime = topAnimeData;
  const heroLoading = topAnimeLoading;
  const topRatedLoading = topAnimeLoading;

  // Fetch trending anime - reduced to 15
  const {
    data: trendingAnime,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ["trending-anime"],
    queryFn: () => fetchTrendingAnime(15),
    staleTime: 600000,
    gcTime: 1200000,
  });

  // Enable seasonal query after top anime is loaded (avoid rate limit)
  useEffect(() => {
    if (topAnimeData && topAnimeData.length > 0) {
      const timer = setTimeout(() => {
        setEnableSeasonal(true);
      }, 1000); // 1 second delay after top anime loads

      return () => clearTimeout(timer);
    }
  }, [topAnimeData]);

  // Fetch seasonal anime with fallback - reduced to 15
  // This query is delayed to avoid rate limiting conflicts
  const {
    data: seasonalAnime,
    isLoading: seasonalLoading,
    error: seasonalError,
    refetch: refetchSeasonal,
  } = useQuery({
    queryKey: ["seasonal-anime-homepage-v4"],
    queryFn: async () => {
      console.log("Fetching seasonal anime...");
      try {
        const result = await fetchSeasonalAnime(undefined, undefined, 15);
        console.log("Seasonal anime result:", result?.length || 0, "items");

        // Check if result is valid and has data
        if (result && Array.isArray(result) && result.length > 0) {
          return result;
        }

        // If empty or invalid, use fallback
        console.log("Seasonal anime empty, using fallback (top anime)");

        // Try to use already fetched topRatedAnime first to avoid extra API call
        if (topRatedAnime && topRatedAnime.length > 0) {
          console.log("Using cached top rated anime as fallback");
          return topRatedAnime;
        }

        const fallback = await fetchTopAnime(15);
        console.log("Fallback result:", fallback?.length || 0, "items");
        return fallback;
      } catch (error) {
        console.error("Seasonal anime error, using fallback:", error);

        // Try to use already fetched topRatedAnime first
        if (topRatedAnime && topRatedAnime.length > 0) {
          console.log("Using cached top rated anime as fallback (error case)");
          return topRatedAnime;
        }

        const fallback = await fetchTopAnime(15);
        return fallback;
      }
    },
    enabled: enableSeasonal, // Only run after delay
    placeholderData: topRatedAnime, // Use top rated as placeholder while loading
    staleTime: 600000, // 10 minutes
    gcTime: 1200000, // 20 minutes
    retry: 3, // Increased retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return (
    <div className="flex flex-col">
      {/* Hero Banner Section */}
      {heroLoading ? (
        <HeroSkeleton />
      ) : heroAnime && heroAnime.length > 0 ? (
        <HeroBanner anime={heroAnime} />
      ) : null}

      {/* Trending Anime Section */}
      <SectionCarousel
        title="Trending Now"
        anime={trendingAnime || []}
        isLoading={trendingLoading}
        error={(trendingAnime && trendingAnime.length > 0) ? null : (trendingError as Error | null)}
        onRetry={() => refetchTrending()}
      />

      {/* Top Rated Anime Section */}
      <SectionCarousel
        title="Top Rated"
        anime={topRatedAnime || []}
        isLoading={topRatedLoading}
        error={null}
        onRetry={() => window.location.reload()}
      />

      {/* Seasonal Anime Section */}
      <SectionCarousel
        title="This Season"
        anime={seasonalAnime || []}
        isLoading={seasonalLoading}
        error={(seasonalAnime && seasonalAnime.length > 0) ? null : (seasonalError as Error | null)}
        onRetry={() => refetchSeasonal()}
      />
    </div>
  );
}
