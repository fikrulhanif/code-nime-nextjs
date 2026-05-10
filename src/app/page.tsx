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

  // Fetch seasonal anime - independent query with retry
  const {
    data: seasonalAnime,
    isLoading: seasonalLoading,
    error: seasonalError,
    refetch: refetchSeasonal,
  } = useQuery({
    queryKey: ["seasonal-anime-homepage"],
    queryFn: async () => {
      console.log("Homepage: Fetching seasonal anime...");
      const result = await fetchSeasonalAnime(undefined, undefined, 20);
      console.log("Homepage: Seasonal anime result:", result);
      return result;
    },
    staleTime: 600000,
    gcTime: 1200000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Debug logging
  console.log("Homepage seasonal state:", {
    isLoading: seasonalLoading,
    hasData: !!seasonalAnime,
    dataLength: seasonalAnime?.length,
    error: seasonalError,
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
