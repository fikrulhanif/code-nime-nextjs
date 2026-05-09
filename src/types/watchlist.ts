// Watchlist type definitions

import { Anime } from "./anime";

export type WatchlistSortOption = "dateAdded" | "title" | "score" | "type";

export interface WatchlistItem {
  anime: Anime;
  addedAt: string; // ISO 8601 timestamp
  notes?: string;
}

export interface WatchlistState {
  items: WatchlistItem[];
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (animeId: number) => void;
  isInWatchlist: (animeId: number) => boolean;
  clearWatchlist: () => void;
  getWatchlistCount: () => number;
}
