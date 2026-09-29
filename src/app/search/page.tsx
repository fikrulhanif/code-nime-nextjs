"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchAnime } from "@/lib/api/anilist";
import { AnimeCard } from "@/components/anime";
import { AnimeCardSkeleton } from "@/components/anime/anime-card-skeleton";
import { Button } from "@/components/ui/button";
import { Anime } from "@/types/anime";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [allResults, setAllResults] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollPositionKey = `search-scroll-${query}`;

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(scrollPositionKey);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
    }
  }, [scrollPositionKey]);

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
    queryKey: ["search", query],
    queryFn: async () => {
      // Validate minimum 3 characters
      if (query.length < 3) {
        throw new Error("Enter at least 3 characters");
      }
      return searchAnime(query, { page: 1 });
    },
    enabled: query.length >= 3,
  });

  // Update results when initial data changes
  useEffect(() => {
    if (searchData) {
      // Remove duplicates based on mal_id
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
  }, [hasMore, isLoadingMore, isInitialLoading, query]);

  // Load more results for infinite scroll
  const loadMoreResults = useCallback(async () => {
    if (isLoadingMore || !hasMore || query.length < 3) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await searchAnime(query, { page: nextPage });

      // Remove duplicates when appending new results
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
  }, [currentPage, query, hasMore, isLoadingMore]);

  // Show validation message for short queries
  if (query.length > 0 && query.length < 3) {
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
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          {query ? `Search results for "${query}"` : "Search Anime"}
        </h1>
        {searchData && (
          <p className="text-muted-foreground mt-1">
            {searchData.pagination?.items.total || 0} results found
          </p>
        )}
        {query && (
          <p className="text-sm text-muted-foreground mt-2">
            Want to filter results?{" "}
            <a
              href={`/filter?q=${encodeURIComponent(query)}`}
              className="text-primary hover:underline"
            >
              Use advanced filters
            </a>
          </p>
        )}
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
        query.length >= 3 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No anime found for &quot;{query}&quot;
            </p>
            <p className="text-sm text-muted-foreground">
              Try different keywords or{" "}
              <a
                href={`/filter?q=${encodeURIComponent(query)}`}
                className="text-primary hover:underline"
              >
                use filters
              </a>
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
    </article>
  );
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
