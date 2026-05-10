// Jikan API service functions

import { makeRequest } from "./client";
import {
  Anime,
  AnimeDetail,
  Character,
  Genre,
  Season,
  AnimeType,
  AnimeStatus,
} from "@/types/anime";
import { JikanAPIResponse, PaginationParams } from "@/types/api";
import { SearchFilters } from "@/types/filters";

// Fetch trending anime (top airing)
export async function fetchTrendingAnime(limit: number = 10): Promise<Anime[]> {
  try {
    const response = await makeRequest<JikanAPIResponse<Anime[]>>({
      method: "GET",
      url: "/top/anime",
      params: {
        filter: "airing",
        limit,
      },
    });

    if (!response || !response.data) {
      console.error("fetchTrendingAnime: Invalid response", response);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("fetchTrendingAnime error:", error);
    return [];
  }
}

// Fetch top anime by score
export async function fetchTopAnime(limit: number = 10): Promise<Anime[]> {
  try {
    console.log("fetchTopAnime called with limit:", limit);
    const response = await makeRequest<JikanAPIResponse<Anime[]>>({
      method: "GET",
      url: "/top/anime",
      params: {
        limit,
      },
    });
    console.log("fetchTopAnime response:", response);

    if (!response || !response.data) {
      console.error("fetchTopAnime: Invalid response structure", response);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("fetchTopAnime error:", error);
    return []; // Return empty array instead of throwing to prevent undefined
  }
}

// Fetch seasonal anime (current season)
export async function fetchSeasonalAnime(
  year?: number,
  season?: Season,
  limit: number = 10,
): Promise<Anime[]> {
  try {
    // If no year/season specified, use the /seasons/now endpoint which is more reliable
    const useNowEndpoint = !year && !season;

    let url: string;
    if (useNowEndpoint) {
      url = "/seasons/now";
      console.log("fetchSeasonalAnime: Using /seasons/now endpoint");
    } else {
      const now = new Date();
      const currentYear = year || now.getFullYear();
      const currentSeason = season || getCurrentSeason();
      url = `/seasons/${currentYear}/${currentSeason}`;
      console.log("fetchSeasonalAnime: Using specific season endpoint", {
        currentYear,
        currentSeason,
      });
    }

    const response = await makeRequest<JikanAPIResponse<Anime[]>>({
      method: "GET",
      url,
      params: {
        limit: Math.min(limit, 25), // Jikan API max limit is 25
      },
    });

    console.log("fetchSeasonalAnime response:", response);

    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("fetchSeasonalAnime: Invalid response structure", response);
      return [];
    }

    console.log("fetchSeasonalAnime data length:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("fetchSeasonalAnime error:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

// Get current season based on month
function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 1 && month <= 3) return "winter";
  if (month >= 4 && month <= 6) return "spring";
  if (month >= 7 && month <= 9) return "summer";
  return "fall";
}

// Search anime with filters
export async function searchAnime(
  query: string,
  filters?: Partial<SearchFilters>,
): Promise<{
  data: Anime[];
  pagination: JikanAPIResponse<Anime[]>["pagination"];
}> {
  const params: Record<string, string | number | undefined> = {
    q: query,
    page: filters?.page || 1,
    limit: filters?.limit || 25,
  };

  // Add filter parameters
  if (filters?.genres && filters.genres.length > 0) {
    params.genres = filters.genres.join(",");
  }

  if (filters?.type) {
    params.type = filters.type;
  }

  if (filters?.status) {
    params.status = filters.status;
  }

  if (filters?.minScore !== null && filters?.minScore !== undefined) {
    params.min_score = filters.minScore;
  }

  if (filters?.maxScore !== null && filters?.maxScore !== undefined) {
    params.max_score = filters.maxScore;
  }

  if (filters?.year) {
    params.start_date = `${filters.year}-01-01`;
    params.end_date = `${filters.year}-12-31`;
  }

  if (filters?.sortBy) {
    params.order_by = filters.sortBy;
    params.sort = filters.orderBy || "desc";
  }

  const response = await makeRequest<JikanAPIResponse<Anime[]>>({
    method: "GET",
    url: "/anime",
    params,
  });

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

// Fetch anime details by ID
export async function fetchAnimeDetails(id: number): Promise<AnimeDetail> {
  const response = await makeRequest<JikanAPIResponse<AnimeDetail>>({
    method: "GET",
    url: `/anime/${id}/full`,
  });

  return response.data;
}

// Fetch anime characters
export async function fetchAnimeCharacters(id: number): Promise<Character[]> {
  const response = await makeRequest<JikanAPIResponse<Character[]>>({
    method: "GET",
    url: `/anime/${id}/characters`,
  });

  return response.data;
}

// Fetch anime recommendations
export async function fetchAnimeRecommendations(
  id: number,
  limit: number = 20,
): Promise<Anime[]> {
  const response = await makeRequest<JikanAPIResponse<Array<{ entry: Anime }>>>(
    {
      method: "GET",
      url: `/anime/${id}/recommendations`,
    },
  );

  // Extract anime from recommendation entries and limit results
  return response.data.slice(0, limit).map((rec) => rec.entry);
}

// Fetch all genres for filter population
export async function fetchGenres(): Promise<Genre[]> {
  const response = await makeRequest<JikanAPIResponse<Genre[]>>({
    method: "GET",
    url: "/genres/anime",
  });

  return response.data;
}

// Fetch anime by multiple IDs (for watchlist hydration)
export async function fetchAnimeByIds(ids: number[]): Promise<Anime[]> {
  // Jikan doesn't support batch requests, so we fetch individually
  // This should be used sparingly and with caching
  const promises = ids.map((id) =>
    makeRequest<JikanAPIResponse<Anime>>({
      method: "GET",
      url: `/anime/${id}`,
    }).then((response) => response.data),
  );

  const results = await Promise.allSettled(promises);

  // Return only successful fetches
  return results
    .filter(
      (result): result is PromiseFulfilledResult<Anime> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);
}

// Validate anime data against TypeScript interfaces
export function validateAnimeData(data: unknown): data is Anime {
  if (!data || typeof data !== "object") return false;

  const anime = data as Partial<Anime>;

  // Required fields validation
  if (
    typeof anime.mal_id !== "number" ||
    anime.mal_id <= 0 ||
    typeof anime.title !== "string" ||
    anime.title.trim() === ""
  ) {
    return false;
  }

  // Score validation
  if (
    anime.score !== null &&
    anime.score !== undefined &&
    (typeof anime.score !== "number" || anime.score < 0 || anime.score > 10)
  ) {
    return false;
  }

  // Episodes validation
  if (
    anime.episodes !== null &&
    anime.episodes !== undefined &&
    (typeof anime.episodes !== "number" || anime.episodes <= 0)
  ) {
    return false;
  }

  // Type validation
  const validTypes: AnimeType[] = [
    "tv",
    "movie",
    "ova",
    "special",
    "ona",
    "music",
  ];
  if (anime.type && !validTypes.includes(anime.type)) {
    return false;
  }

  // Status validation
  const validStatuses: AnimeStatus[] = ["airing", "complete", "upcoming"];
  if (anime.status && !validStatuses.includes(anime.status)) {
    return false;
  }

  return true;
}
