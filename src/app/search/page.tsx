"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { searchAnime } from "@/lib/api/jikan";
import { AnimeCard } from "@/components/anime";
import { AnimeCardSkeleton } from "@/components/anime/anime-card-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchFilters, DEFAULT_FILTERS } from "@/types/filters";
import { Anime } from "@/types/anime";
import { Filter, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Dynamically import FilterPanel for code splitting
// Requirement 20.6: Load filter panel within 500ms of filter toggle click
const FilterPanel = dynamic(
  () => {
    const startTime = performance.now();
    return import("@/components/filters").then((mod) => {
      const loadTime = performance.now() - startTime;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Performance] FilterPanel loaded in ${loadTime.toFixed(2)}ms`,
        );
      }
      return { default: mod.FilterPanel };
    });
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    ),
  },
);

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(() => {
    // Parse URL params on initial load
    return parseFiltersFromURL(searchParams);
  });
  const [allResults, setAllResults] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const scrollPositionKey = `search-scroll-${filters.query}`;

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(scrollPositionKey);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
    }
  }, []);

  // Save scroll position before navigation
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(scrollPositionKey, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPositionKey]);

  // Fetch initial search results
  const {
    data: searchData,
    isLoading: isInitialLoading,
    error: initialError,
    refetch: refetchInitial,
  } = useQuery({
    queryKey: ["search", filters.query, filters],
    queryFn: async () => {
      // Validate minimum 3 characters
      if (filters.query.length < 3) {
        throw new Error("Enter at least 3 characters");
      }
      return searchAnime(filters.query, { ...filters, page: 1 });
    },
    enabled: filters.query.length >= 3,
  });

  // Update results when initial data changes
  useEffect(() => {
    if (searchData) {
      setAllResults(searchData.data);
      setCurrentPage(1);
      setHasMore(searchData.pagination?.has_next_page || false);
    }
  }, [searchData]);

  // Update URL when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL(filters);
    }, 100);

    return () => clearTimeout(timer);
  }, [filters]);

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
    if (isLoadingMore || !hasMore || filters.query.length < 3) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await searchAnime(filters.query, {
        ...filters,
        page: nextPage,
      });

      setAllResults((prev) => [...prev, ...result.data]);
      setCurrentPage(nextPage);
      setHasMore(result.pagination?.has_next_page || false);
    } catch (error) {
      console.error("Failed to load more results:", error);
      toast.error("Failed to load more results. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, filters, hasMore, isLoadingMore]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setAllResults([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  // Update URL with search parameters
  const updateURL = (filters: SearchFilters) => {
    const params = new URLSearchParams();

    // Add query
    if (filters.query) {
      params.set("q", filters.query);
    }

    // Add filter parameters
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

    // Check URL length (RFC 3986 recommends 2000 character limit)
    const fullURL = `${window.location.pathname}?${queryString}`;
    if (fullURL.length > 2000) {
      toast.error("Too many filters applied. URL exceeds maximum length.");
      return;
    }

    // Update URL without page reload
    router.push(`/search?${queryString}`, { scroll: false });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.type !== null) count++;
    if (filters.status !== null) count++;
    if (filters.season !== null) count++;
    if (filters.minScore !== null || filters.maxScore !== null) count++;
    if (filters.year !== null) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Show validation message for short queries
  if (filters.query.length > 0 && filters.query.length < 3) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            Enter at least 3 characters to search
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <header className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {filters.query
                ? `Search results for "${filters.query}"`
                : "Search Anime"}
            </h1>
            {searchData && (
              <p className="text-muted-foreground mt-1">
                {searchData.pagination?.items.total || 0} results found
              </p>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full"
                    aria-label={`${activeFilterCount} active filters`}
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md overflow-y-auto"
              aria-label="Filter panel"
            >
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                className="mt-6"
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

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
            {(initialError as Error).message || "Failed to load search results"}
          </p>
          <Button onClick={() => refetchInitial()}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!isInitialLoading &&
        !initialError &&
        allResults.length === 0 &&
        filters.query.length >= 3 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No anime found for &quot;{filters.query}&quot;
            </p>
            <p className="text-sm text-muted-foreground">
              Try different keywords or adjust your filters
            </p>
          </div>
        )}

      {/* Results Grid */}
      {!isInitialLoading && allResults.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allResults.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
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
    </article>
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
    // Validate and parse genre IDs
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

// Wrap in Suspense to handle useSearchParams
export default function SearchPage() {
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
      <SearchPageContent />
    </Suspense>
  );
}
