// Filter type definitions for anime search and discovery

import { AnimeType, AnimeStatus, Season } from "./anime";

export type SortOption = "score" | "popularity" | "favorites" | "title";

export interface AnimeFilters {
  genres: number[]; // Genre mal_ids
  type: AnimeType | null;
  status: AnimeStatus | null;
  minScore: number | null;
  maxScore: number | null;
  year: number | null;
  season: Season | null;
  sortBy: SortOption;
  orderBy: "asc" | "desc";
  page: number;
  limit: number;
}

export interface SearchFilters extends AnimeFilters {
  query: string;
}

export interface FilterState {
  filters: SearchFilters;
  updateFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => void;
  resetFilters: () => void;
  getActiveFilterCount: () => number;
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  genres: [],
  type: null,
  status: null,
  minScore: null,
  maxScore: null,
  year: null,
  season: null,
  sortBy: "score",
  orderBy: "desc",
  page: 1,
  limit: 25,
};
