"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTopAnime } from "@/lib/api/jikan";
import { HeroBanner } from "@/components/home";
import { HeroSkeleton } from "@/components/loading";

export default function Home() {
  // Fetch top anime for hero banner
  const { data: heroAnime, isLoading } = useQuery({
    queryKey: ["hero-anime"],
    queryFn: () => fetchTopAnime(10),
  });

  return (
    <div className="flex flex-col">
      {/* Hero Banner Section */}
      {isLoading ? (
        <HeroSkeleton />
      ) : heroAnime && heroAnime.length > 0 ? (
        <HeroBanner anime={heroAnime} />
      ) : null}

      {/* Placeholder for other sections */}
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          More sections coming soon...
        </p>
      </div>
    </div>
  );
}
