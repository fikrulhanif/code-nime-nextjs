"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchAnime } from "@/lib/api/jikan";
import { AnimeCard } from "@/components/anime";
import { AnimeCardSkeleton } from "@/components/anime/anime-card-skeleton";
import { FilterPanel } from "@/components/filters";
import { Button } from "@/components/ui/button";
import { SearchFilters, DEFAULT_FILTERS } from "@/types/filters";
import { Anime } from "@/types/anime";
import { AlertCircle, Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

function FilterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Draft filters - what user is currently editing (not yet applied)
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(() => {
    return parseFiltersFromURL(searchParams);
  });

  // Applied filters - what actually triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(() => {
    return parseFiltersFromURL(searchParams);
  });

  const [searchQuery, setSearchQuery] = useState(draftFilters.query);
  const [allResults, setAllResults] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch search results with APPLIED filters only
  const {
    data: searchData,
    isLoading: isInitialLoading,
    error: initialError,
    refetch: refetchInitial,
  } = useQuery({
    queryKey: ["filter-search", appliedFilters],
    queryFn: async () => {
      // If there's a search query, validate minimum 3 characters
      if (appliedFilters.query && appliedFilters.query.length < 3) {
        throw new Error("Enter at least 3 characters to search");
      }
      return searchAnime(appliedFilters.query || "", {
        ...appliedFilters,
        page: 1,
      });
    },
    enabled: !appliedFilters.query || appliedFilters.query.length >= 3,
  });

  // Update results when initial data changes
  useEffect(() => {
    if (searchData) {
      const uniqueData = Array.from(
        new Map(searchData.data.map((item) => [item.mal_id, item])).values(),
      );
      setAllResults(uniqueData);
      setCurrentPage(1);
      setHasMore(searchData.pagination?.has_next_page || false);
    }
  }, [searchData]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isInitialLoading
        ) {
          loadMoreResults();
        }
      },
      { rootMargin: "200px" },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isInitialLoading]);

  // Load more results for infinite scroll
  const loadMoreResults = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await searchAnime(appliedFilters.query || "", {
        ...appliedFilters,
        page: nextPage,
      });

      setAllResults((prev) => {
        const combined = [...prev, ...result.data];
        return Array.from(
          new Map(combined.map((item) => [item.mal_id, item])).values(),
        );
      });
      setCurrentPage(nextPage);
      setHasMore(result.pagination?.has_next_page || false);
    } catch (error) {
      console.error("Failed to load more results:", error);
      toast.error("Failed to load more results. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, appliedFilters, hasMore, isLoadingMore]);

  // Handle filter changes (updates draft only, not applied)
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setDraftFilters(newFilters);
  }, []);

  // Apply filters - copy draft to applied and update URL
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setAllResults([]);
    setCurrentPage(1);
    setHasMore(true);
    updateURL(draftFilters);
  }, [draftFilters]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...draftFilters, query: searchQuery };
    setDraftFilters(newFilters);
    setAppliedFilters(newFilters);
    setAllResults([]);
    setCurrentPage(1);
    setHasMore(true);
    updateURL(newFilters);
  };

  // Reset all filters
  const handleResetAll = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setAllResults([]);
    setCurrentPage(1);
    setHasMore(true);
    updateURL(DEFAULT_FILTERS);
  }, []);

  // Update URL with search parameters
  const updateURL = (filters: SearchFilters) => {
    const params = new URLSearchParams();

    if (filters.query) {
      params.set("q", filters.query);
    }
    if (filters.genres.length > 0) {
      params.set("genres", filters.genres.join(","));
    }
    if (filters.type) {
      params.set("type", filters.type);
    }
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.minScore !== null) {
      params.set("minScore", filters.minScore.toString());
    }
    if (filters.maxScore !== null) {
      params.set("maxScore", filters.maxScore.toString());
    }
    if (filters.year) {
      params.set("year", filters.year.toString());
    }
    if (filters.season) {
      params.set("season", filters.season);
    }

    const queryString = params.toString();
    const fullURL = `${window.location.pathname}?${queryString}`;

    if (fullURL.length > 2000) {
      toast.error("Too many filters applied. URL exceeds maximum length.");
      return;
    }

    router.push(`/filter?${queryString}`, { scroll: false });
  };

  // Get active filter count from DRAFT filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (draftFilters.genres.length > 0) count++;
    if (draftFilters.type !== null) count++;
    if (draftFilters.status !== null) count++;
    if (draftFilters.season !== null) count++;
    if (draftFilters.minScore !== null || draftFilters.maxScore !== null)
      count++;
    if (draftFilters.year !== null) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Check if there are unapplied changes
  const hasUnappliedChanges =
    JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Left Sidebar - Filters */}
        <aside className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Filter Anime</h1>
            <p className="text-muted-foreground">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} selected`
                : "Browse and filter anime"}
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label htmlFor="search-input" className="text-sm font-medium">
              Search Anime
            </label>
            <div className="flex gap-2">
              <Input
                id="search-input"
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Filter Panel */}
          <FilterPanel
            filters={draftFilters}
            onFilterChange={handleFilterChange}
          />

          {/* Apply and Reset Buttons */}
          <div className="space-y-2 pt-4 border-t">
            <Button
              onClick={handleApplyFilters}
              className="w-full"
              disabled={!hasUnappliedChanges}
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleResetAll}
              variant="outline"
              className="w-full"
              disabled={activeFilterCount === 0 && !appliedFilters.query}
            >
              Reset All
            </Button>
          </div>
        </aside>

        {/* Right Content - Results */}
        <main>
          {/* Results Header */}
          {searchData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {appliedFilters.query
                  ? `Results for "${appliedFilters.query}"`
                  : "All Anime"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {searchData.pagination?.items.total || 0} results found
              </p>
            </div>
          )}

          {/* Loading State */}
          {isInitialLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimeCardSkeleton count={12} />
            </div>
          )}

          {/* Error State */}
          {initialError && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg text-destructive">
                {(initialError as Error).message || "Failed to load results"}
              </p>
              <Button onClick={() => refetchInitial()}>Retry</Button>
            </div>
          )}

          {/* Empty State */}
          {!isInitialLoading && !initialError && allResults.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {appliedFilters.query
                  ? `No anime found for "${appliedFilters.query}"`
                  : "No anime found"}
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!isInitialLoading && allResults.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {allResults.map((anime, index) => (
                  <AnimeCard key={anime.mal_id} anime={anime} index={index} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="mt-8 flex justify-center">
                {isLoadingMore && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
                    <AnimeCardSkeleton count={6} />
                  </div>
                )}
                {!hasMore && allResults.length > 0 && (
                  <p className="text-muted-foreground">All results loaded</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Helper function to parse filters from URL
function parseFiltersFromURL(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = { ...DEFAULT_FILTERS };

  const query = searchParams.get("q");
  if (query) {
    filters.query = query;
  }

  const genres = searchParams.get("genres");
  if (genres) {
    const genreIds = genres
      .split(",")
      .map(Number)
      .filter((id) => !isNaN(id));
    filters.genres = genreIds;
  }

  const type = searchParams.get("type");
  if (
    type &&
    ["tv", "movie", "ova", "special", "ona", "music"].includes(type)
  ) {
    filters.type = type as any;
  }

  const status = searchParams.get("status");
  if (status && ["airing", "complete", "upcoming"].includes(status)) {
    filters.status = status as any;
  }

  const minScore = searchParams.get("minScore");
  if (minScore) {
    const score = parseFloat(minScore);
    if (!isNaN(score) && score >= 0 && score <= 10) {
      filters.minScore = score;
    }
  }

  const maxScore = searchParams.get("maxScore");
  if (maxScore) {
    const score = parseFloat(maxScore);
    if (!isNaN(score) && score >= 0 && score <= 10) {
      filters.maxScore = score;
    }
  }

  const year = searchParams.get("year");
  if (year) {
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (!isNaN(yearNum) && yearNum >= 1960 && yearNum <= currentYear + 1) {
      filters.year = yearNum;
    }
  }

  const season = searchParams.get("season");
  if (season && ["winter", "spring", "summer", "fall"].includes(season)) {
    filters.season = season as any;
  }

  return filters;
}

// Wrap in Suspense
export default function FilterPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimeCardSkeleton count={12} />
          </div>
        </div>
      }
    >
      <FilterPageContent />
    </Suspense>
  );
}
