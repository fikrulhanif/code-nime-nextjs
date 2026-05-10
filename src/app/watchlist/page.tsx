"use client";

import { useState, useMemo } from "react";
import { useWatchlistStore } from "@/store/watchlist";
import { AnimeCard } from "@/components/anime/anime-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WatchlistSortOption } from "@/types/watchlist";
import { Trash2, ListX } from "lucide-react";

export default function WatchlistPage() {
  const { items, clearWatchlist, getWatchlistCount } = useWatchlistStore();
  const [sortBy, setSortBy] = useState<WatchlistSortOption>("dateAdded");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const count = getWatchlistCount();

  // Sort watchlist items based on selected option
  const sortedItems = useMemo(() => {
    const itemsCopy = [...items];

    switch (sortBy) {
      case "dateAdded":
        // Date added descending (newest first)
        return itemsCopy.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        );

      case "title":
        // Title ascending (A-Z)
        return itemsCopy.sort((a, b) =>
          a.anime.title.localeCompare(b.anime.title),
        );

      case "score":
        // Score descending (highest first)
        return itemsCopy.sort((a, b) => {
          const scoreA = a.anime.score ?? 0;
          const scoreB = b.anime.score ?? 0;
          return scoreB - scoreA;
        });

      case "type":
        // Type alphabetical
        return itemsCopy.sort((a, b) => {
          const typeA = a.anime.type ?? "";
          const typeB = b.anime.type ?? "";
          return typeA.localeCompare(typeB);
        });

      default:
        return itemsCopy;
    }
  }, [items, sortBy]);

  // Handle clear all with confirmation
  const handleClearAll = () => {
    clearWatchlist();
    setShowClearDialog(false);
  };

  // Empty state
  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ListX className="size-24 text-muted-foreground/50 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Your watchlist is empty</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start adding anime to your watchlist to keep track of what you want
            to watch!
          </p>
          <Button asChild>
            <a href="/">Browse Anime</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with count, sort, and clear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">
            {count} {count === 1 ? "anime" : "anime"} in your watchlist
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm font-medium">
              Sort by:
            </label>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as WatchlistSortOption)}
            >
              <SelectTrigger id="sort-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added (Newest)</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="score">Score (Highest)</SelectItem>
                <SelectItem value="type">Type (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear All button */}
          <Button
            variant="destructive"
            onClick={() => setShowClearDialog(true)}
            className="min-h-[44px] touch-manipulation"
            aria-label="Clear all items from watchlist"
          >
            <Trash2 className="size-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Watchlist grid - Requirement 19.2, 19.3, 19.4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sortedItems.map((item, index) => (
          <AnimeCard
            key={item.anime.mal_id}
            anime={item.anime}
            variant="default"
            showWatchlistButton={true}
            index={index}
          />
        ))}
      </div>

      {/* Clear confirmation dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Watchlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all {count} anime from your
              watchlist? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="min-h-[44px] touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              className="min-h-[44px] touch-manipulation"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
