"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTopAnime, fetchTrendingAnime } from "@/lib/api/jikan";
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

  // Fetch seasonal anime - use trending anime as reliable alternative
  const {
    data: seasonalAnime,
    isLoading: seasonalLoading,
    error: seasonalError,
    refetch: refetchSeasonal,
  } = useQuery({
    queryKey: ["seasonal-anime-homepage"],
    queryFn: async () => {
      // Use trending anime (top airing) as a reliable source for "This Season"
      // The /seasons/now endpoint has been unreliable, so we use top airing anime instead
      return fetchTrendingAnime(20);
    },
    staleTime: 600000,
    gcTime: 1200000,
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
