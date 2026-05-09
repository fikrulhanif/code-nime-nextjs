// Watchlist store with localStorage persistence

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Anime } from "@/types/anime";
import { WatchlistItem, WatchlistState } from "@/types/watchlist";
import { toast } from "sonner";

const STORAGE_KEY = "codenime_watchlist";

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWatchlist: (anime: Anime) => {
        const { items, isInWatchlist } = get();

        // Check for duplicates
        if (isInWatchlist(anime.mal_id)) {
          toast.info("Already in watchlist");
          return;
        }

        const newItem: WatchlistItem = {
          anime,
          addedAt: new Date().toISOString(),
        };

        try {
          set({ items: [...items, newItem] });
          toast.success("Added to watchlist");
        } catch (error) {
          // Handle localStorage quota exceeded
          if (error instanceof Error && error.name === "QuotaExceededError") {
            toast.error("Watchlist storage full");
          } else {
            toast.error("Failed to save to watchlist");
          }
          console.error("Failed to add to watchlist:", error);
        }
      },

      removeFromWatchlist: (animeId: number) => {
        const { items } = get();

        try {
          set({
            items: items.filter((item) => item.anime.mal_id !== animeId),
          });
          toast.info("Removed from watchlist");
        } catch (error) {
          toast.error("Failed to remove from watchlist");
          console.error("Failed to remove from watchlist:", error);
        }
      },

      isInWatchlist: (animeId: number) => {
        const { items } = get();
        return items.some((item) => item.anime.mal_id === animeId);
      },

      clearWatchlist: () => {
        try {
          set({ items: [] });
          toast.info("Watchlist cleared");
        } catch (error) {
          toast.error("Failed to clear watchlist");
          console.error("Failed to clear watchlist:", error);
        }
      },

      getWatchlistCount: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        // Custom storage implementation with error handling and SSR support
        if (typeof window === "undefined") {
          // Return no-op storage for SSR
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }

        return {
          getItem: (name: string) => {
            try {
              const value = localStorage.getItem(name);
              return value;
            } catch (error) {
              console.error("Failed to read from localStorage:", error);
              return null;
            }
          },
          setItem: (name: string, value: string) => {
            try {
              localStorage.setItem(name, value);
            } catch (error) {
              if (
                error instanceof Error &&
                error.name === "QuotaExceededError"
              ) {
                console.error("localStorage quota exceeded");
                throw error;
              }
              console.error("Failed to write to localStorage:", error);
              throw error;
            }
          },
          removeItem: (name: string) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error("Failed to remove from localStorage:", error);
            }
          },
        };
      }),
      // Handle corrupted data
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate watchlist:", error);
          // Clear corrupted data
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            console.error("Failed to clear corrupted data:", e);
          }
        }
      },
    },
  ),
);
