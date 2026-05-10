"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchTopAnime,
  fetchTrendingAnime,
  fetchSeasonalAnime,
} from "@/lib/api/jikan";
import { HeroBanner, SectionCarousel } from "@/components/home";
import { HeroSkeleton } from "@/components/loading";

export default function Home() {
  // Fetch top anime for hero banner
  const { data: heroAnime, isLoading: heroLoading } = useQuery({
    queryKey: ["hero-anime"],
    queryFn: () => fetchTopAnime(10),
    staleTime: 600000,
    gcTime: 1200000,
  });

  // Fetch trending anime (top airing)
  const {
    data: trendingAnime,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ["trending-anime"],
    queryFn: () => fetchTrendingAnime(20),
    staleTime: 600000,
    gcTime: 1200000,
  });

  // Fetch top-rated anime
  const {
    data: topRatedAnime,
    isLoading: topRatedLoading,
    error: topRatedError,
    refetch: refetchTopRated,
  } = useQuery({
    queryKey: ["top-rated-anime"],
    queryFn: () => fetchTopAnime(20),
    staleTime: 600000,
    gcTime: 1200000,
  });

  // Fetch seasonal anime with fallback
  const {
    data: seasonalAnime,
    isLoading: seasonalLoading,
    error: seasonalError,
    refetch: refetchSeasonal,
  } = useQuery({
    queryKey: ["seasonal-anime-homepage-v2"], // Changed key to force refresh
    queryFn: async () => {
      console.log("Homepage: Fetching seasonal anime...");
      try {
        // Try to fetch seasonal anime first
        const result = await fetchSeasonalAnime(undefined, undefined, 20);
        console.log(
          "Homepage: Seasonal anime result:",
          result?.length || 0,
          "items",
        );

        // If we got data, return it
        if (result && result.length > 0) {
          return result;
        }

        // If no data, fallback to top anime (different from trending)
        console.log("Homepage: Seasonal empty, using top anime as fallback");
        const fallback = await fetchTopAnime(20);
        console.log(
          "Homepage: Fallback result:",
          fallback?.length || 0,
          "items",
        );
        return fallback;
      } catch (error) {
        console.error("Homepage: Seasonal anime error:", error);
        // On error, use top anime as fallback
        return fetchTopAnime(20);
      }
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
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
        error={trendingError as Error | null}
        onRetry={() => refetchTrending()}
      />

      {/* Top Rated Anime Section */}
      <SectionCarousel
        title="Top Rated"
        anime={topRatedAnime || []}
        isLoading={topRatedLoading}
        error={topRatedError as Error | null}
        onRetry={() => refetchTopRated()}
      />

      {/* Seasonal Anime Section */}
      <SectionCarousel
        title="This Season"
        anime={seasonalAnime || []}
        isLoading={seasonalLoading}
        error={seasonalError as Error | null}
        onRetry={() => refetchSeasonal()}
      />
    </div>
  );
}
