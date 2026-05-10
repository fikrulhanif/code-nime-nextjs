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
  // Fetch top anime for hero banner - reduced to 5 for faster load
  const { data: heroAnime, isLoading: heroLoading } = useQuery({
    queryKey: ["hero-anime"],
    queryFn: () => fetchTopAnime(5),
    staleTime: 600000,
    gcTime: 1200000,
  });

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

  // Fetch top-rated anime - reduced to 15
  const {
    data: topRatedAnime,
    isLoading: topRatedLoading,
    error: topRatedError,
    refetch: refetchTopRated,
  } = useQuery({
    queryKey: ["top-rated-anime"],
    queryFn: () => fetchTopAnime(15),
    staleTime: 600000,
    gcTime: 1200000,
  });

  // Fetch seasonal anime with fallback - reduced to 15
  const {
    data: seasonalAnime,
    isLoading: seasonalLoading,
    error: seasonalError,
    refetch: refetchSeasonal,
  } = useQuery({
    queryKey: ["seasonal-anime-homepage-v2"],
    queryFn: async () => {
      try {
        const result = await fetchSeasonalAnime(undefined, undefined, 15);
        if (result && result.length > 0) {
          return result;
        }
        return fetchTopAnime(15);
      } catch (error) {
        return fetchTopAnime(15);
      }
    },
    staleTime: 600000, // Increased to 10 minutes
    gcTime: 1200000,
    retry: 1, // Reduced retry attempts
    retryDelay: 2000,
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
