"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSeasonalAnime } from "@/lib/api/jikan";
import { AnimeCard } from "@/components/anime";
import { CardSkeleton } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SeasonalPage() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12; // 2 rows × 6 columns

  const {
    data: allAnime,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["seasonal-anime-page"],
    queryFn: () => fetchSeasonalAnime(undefined, undefined, 25), // Max limit is 25
    staleTime: 600000,
    gcTime: 1200000,
    retry: 2,
    retryDelay: 1000,
  });

  // Filter anime by type
  const filteredAnime =
    allAnime?.filter((item) => {
      if (filter === "all") return true;
      return item.type?.toLowerCase() === filter;
    }) || [];

  // Paginate filtered results
  const totalPages = Math.ceil(filteredAnime.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedAnime = filteredAnime.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  const filters = [
    { value: "all", label: "All" },
    { value: "tv", label: "TV" },
    { value: "movie", label: "Movie" },
    { value: "ova", label: "OVA" },
    { value: "ona", label: "ONA" },
    { value: "special", label: "Special" },
    { value: "music", label: "Music" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seasonal Anime</h1>
        <p className="text-muted-foreground">
          Anime airing this season ({filteredAnime.length} total)
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Failed to load anime</p>
          <p className="text-sm text-red-500">{String(error)}</p>
        </div>
      ) : paginatedAnime && paginatedAnime.length > 0 ? (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {paginatedAnime.map((item) => (
              <AnimeCard key={item.mal_id} anime={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No anime found for this filter
          </p>
        </div>
      )}
    </div>
  );
}
