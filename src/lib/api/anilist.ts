// AniList API Service Functions & Data Adapters
// Replaces Jikan API while keeping TypeScript models compatible with the UI layer

import { anilistQuery } from "./anilist-client";
import {
  Anime,
  AnimeDetail,
  Character,
  Episode,
  Genre,
  Season,
  AnimeType,
  AnimeStatus,
  Studio,
  Relation,
  ExternalLink,
  StreamingLink,
} from "@/types/anime";
import { JikanAPIResponse } from "@/types/api";
import { SearchFilters } from "@/types/filters";

// ==========================================
// Genre Mapping (AniList string <-> Numeric ID)
// ==========================================
export const ANILIST_GENRES: Genre[] = [
  { mal_id: 1, name: "Action", type: "anime", url: "" },
  { mal_id: 2, name: "Adventure", type: "anime", url: "" },
  { mal_id: 4, name: "Comedy", type: "anime", url: "" },
  { mal_id: 8, name: "Drama", type: "anime", url: "" },
  { mal_id: 9, name: "Ecchi", type: "anime", url: "" },
  { mal_id: 10, name: "Fantasy", type: "anime", url: "" },
  { mal_id: 14, name: "Horror", type: "anime", url: "" },
  { mal_id: 66, name: "Mahou Shoujo", type: "anime", url: "" },
  { mal_id: 18, name: "Mecha", type: "anime", url: "" },
  { mal_id: 19, name: "Music", type: "anime", url: "" },
  { mal_id: 7, name: "Mystery", type: "anime", url: "" },
  { mal_id: 40, name: "Psychological", type: "anime", url: "" },
  { mal_id: 22, name: "Romance", type: "anime", url: "" },
  { mal_id: 24, name: "Sci-Fi", type: "anime", url: "" },
  { mal_id: 36, name: "Slice of Life", type: "anime", url: "" },
  { mal_id: 30, name: "Sports", type: "anime", url: "" },
  { mal_id: 37, name: "Supernatural", type: "anime", url: "" },
  { mal_id: 41, name: "Thriller", type: "anime", url: "" },
];

const GENRE_ID_TO_NAME = new Map<number, string>(
  ANILIST_GENRES.map((g) => [g.mal_id, g.name]),
);
const GENRE_NAME_TO_ID = new Map<string, number>(
  ANILIST_GENRES.map((g) => [g.name.toLowerCase(), g.mal_id]),
);

// ==========================================
// GraphQL Queries & Fragments
// ==========================================
const MEDIA_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  coverImage {
    large
    extraLarge
    medium
  }
  bannerImage
  description(asHtml: false)
  format
  status
  episodes
  duration
  averageScore
  popularity
  favourites
  genres
  season
  seasonYear
  startDate {
    year
    month
    day
  }
  endDate {
    year
    month
    day
  }
  trailer {
    id
    site
  }
  studios(isMain: true) {
    nodes {
      id
      name
    }
  }
`;

interface AniListMedia {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string | null;
    extraLarge: string | null;
    medium: string | null;
  };
  bannerImage: string | null;
  description: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration?: number | null;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  genres: string[];
  season: string | null;
  seasonYear: number | null;
  startDate?: { year: number | null; month: number | null; day: number | null } | null;
  endDate?: { year: number | null; month: number | null; day: number | null } | null;
  trailer?: { id: string | null; site: string | null } | null;
  studios?: { nodes: Array<{ id: number; name: string }> };
  synonyms?: string[];
  source?: string | null;
  externalLinks?: Array<{ site: string; url: string; type?: string }>;
  relations?: {
    edges: Array<{
      relationType: string;
      node: {
        id: number;
        title: { romaji: string | null; english: string | null };
        type: string;
      };
    }>;
  };
  streamingEpisodes?: Array<{
    title: string | null;
    thumbnail: string | null;
    url: string | null;
    site: string | null;
  }>;
}

// ==========================================
// Data Transformation Helpers
// ==========================================
function cleanHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function formatDate(date?: { year: number | null; month: number | null; day: number | null } | null): string | null {
  if (!date || !date.year) return null;
  const month = date.month ? String(date.month).padStart(2, "0") : "01";
  const day = date.day ? String(date.day).padStart(2, "0") : "01";
  return `${date.year}-${month}-${day}`;
}

function mapFormatToAnimeType(format: string | null): AnimeType {
  switch (format) {
    case "TV":
    case "TV_SHORT":
      return "tv";
    case "MOVIE":
      return "movie";
    case "OVA":
      return "ova";
    case "ONA":
      return "ona";
    case "SPECIAL":
      return "special";
    case "MUSIC":
      return "music";
    default:
      return "tv";
  }
}

function mapAnimeTypeToFormat(type?: AnimeType | null): string | undefined {
  if (!type) return undefined;
  switch (type) {
    case "tv":
      return "TV";
    case "movie":
      return "MOVIE";
    case "ova":
      return "OVA";
    case "ona":
      return "ONA";
    case "special":
      return "SPECIAL";
    case "music":
      return "MUSIC";
    default:
      return undefined;
  }
}

function mapStatusToAnimeStatus(status: string | null): AnimeStatus {
  switch (status) {
    case "RELEASING":
      return "airing";
    case "FINISHED":
    case "CANCELLED":
      return "complete";
    case "NOT_YET_RELEASED":
      return "upcoming";
    default:
      return "complete";
  }
}

function mapAnimeStatusToStatus(status?: AnimeStatus | null): string | undefined {
  if (!status) return undefined;
  switch (status) {
    case "airing":
      return "RELEASING";
    case "complete":
      return "FINISHED";
    case "upcoming":
      return "NOT_YET_RELEASED";
    default:
      return undefined;
  }
}

function mapSeasonToSeason(season: string | null): Season | null {
  if (!season) return null;
  const s = season.toLowerCase();
  if (s === "winter" || s === "spring" || s === "summer" || s === "fall") {
    return s as Season;
  }
  return null;
}

export function mapAniListMediaToAnime(media: AniListMedia): Anime {
  const coverLarge =
    media.coverImage?.extraLarge ||
    media.coverImage?.large ||
    media.coverImage?.medium ||
    "";
  const coverSmall =
    media.coverImage?.medium || media.coverImage?.large || coverLarge;

  const score = media.averageScore != null ? media.averageScore / 10 : null;

  const genres: Genre[] = (media.genres || []).map((genreName, index) => {
    const malId = GENRE_NAME_TO_ID.get(genreName.toLowerCase()) ?? index + 100;
    return {
      mal_id: malId,
      name: genreName,
      type: "anime",
      url: "",
    };
  });

  const studios: Studio[] = (media.studios?.nodes || []).map((studio) => ({
    mal_id: studio.id,
    name: studio.name,
    type: "anime",
    url: "",
  }));

  const fromDate = formatDate(media.startDate);
  const toDate = formatDate(media.endDate);
  const airedString = fromDate
    ? toDate
      ? `${fromDate} to ${toDate}`
      : `${fromDate}`
    : "Unknown";

  return {
    mal_id: media.id,
    id: media.id,
    idMal: media.idMal,
    bannerImage: media.bannerImage || null,
    title:
      media.title?.romaji ||
      media.title?.english ||
      media.title?.native ||
      "Untitled",
    title_english: media.title?.english || null,
    title_japanese: media.title?.native || null,
    images: {
      jpg: {
        image_url: coverLarge,
        small_image_url: coverSmall,
        large_image_url: coverLarge,
      },
      webp: {
        image_url: coverLarge,
        small_image_url: coverSmall,
        large_image_url: coverLarge,
      },
    },
    trailer:
      media.trailer && media.trailer.site?.toLowerCase() === "youtube" && media.trailer.id
        ? {
            youtube_id: media.trailer.id,
            url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
            embed_url: `https://www.youtube.com/embed/${media.trailer.id}`,
          }
        : null,
    synopsis: cleanHtml(media.description),
    type: mapFormatToAnimeType(media.format),
    episodes: media.episodes || null,
    status: mapStatusToAnimeStatus(media.status),
    airing: media.status === "RELEASING",
    aired: {
      from: fromDate,
      to: toDate,
      string: airedString,
    },
    score,
    scored_by: media.popularity || null,
    rank: null,
    popularity: media.popularity || null,
    members: media.popularity || null,
    favorites: media.favourites || null,
    genres,
    studios,
    season: mapSeasonToSeason(media.season),
    year: media.seasonYear || media.startDate?.year || null,
  };
}

export function mapAniListMediaToAnimeDetail(media: AniListMedia): AnimeDetail {
  const baseAnime = mapAniListMediaToAnime(media);

  const relations: Relation[] = (media.relations?.edges || []).map((edge) => ({
    relation: edge.relationType,
    entry: [
      {
        mal_id: edge.node.id,
        type: edge.node.type,
        name:
          edge.node.title?.english ||
          edge.node.title?.romaji ||
          "Unknown Title",
        url: `/anime/${edge.node.id}`,
      },
    ],
  }));

  const external: ExternalLink[] = (media.externalLinks || []).map((link) => ({
    name: link.site,
    url: link.url,
  }));

  const streaming: StreamingLink[] = (media.externalLinks || [])
    .filter((link) => link.type === "STREAMING")
    .map((link) => ({
      name: link.site,
      url: link.url,
    }));

  return {
    ...baseAnime,
    title_synonyms: media.synonyms || [],
    source: media.source || "Original",
    duration: media.duration ? `${media.duration} min per ep` : "Unknown",
    rating: "PG-13",
    background: media.bannerImage || null,
    broadcast: {
      day: null,
      time: null,
      timezone: null,
      string: null,
    },
    producers: [],
    licensors: [],
    demographics: [],
    relations,
    theme: {
      openings: [],
      endings: [],
    },
    external,
    streaming,
  };
}

// ==========================================
// Public API Functions
// ==========================================

// 1. Fetch Trending Anime
export async function fetchTrendingAnime(limit: number = 10): Promise<Anime[]> {
  try {
    const query = `
      query ($perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(sort: [TRENDING_DESC], status: RELEASING, type: ANIME) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, {
      perPage: limit,
    });

    return (data?.Page?.media || []).map(mapAniListMediaToAnime);
  } catch (error) {
    console.error("fetchTrendingAnime error:", error);
    return [];
  }
}

// 2. Fetch Top Anime
export async function fetchTopAnime(limit: number = 10): Promise<Anime[]> {
  try {
    const query = `
      query ($perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(sort: [SCORE_DESC], type: ANIME) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, {
      perPage: limit,
    });

    return (data?.Page?.media || []).map(mapAniListMediaToAnime);
  } catch (error) {
    console.error("fetchTopAnime error:", error);
    return [];
  }
}

// 2b. Fetch Top Anime with Pagination
export async function fetchTopAnimeWithPage(
  page: number = 1,
  limit: number = 12,
): Promise<{ data: Anime[]; hasNextPage: boolean }> {
  try {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
          }
          media(sort: [SCORE_DESC], type: ANIME) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{
      Page: {
        pageInfo: { hasNextPage: boolean };
        media: AniListMedia[];
      };
    }>(query, { page, perPage: limit });

    return {
      data: (data?.Page?.media || []).map(mapAniListMediaToAnime),
      hasNextPage: data?.Page?.pageInfo?.hasNextPage || false,
    };
  } catch (error) {
    console.error("fetchTopAnimeWithPage error:", error);
    return { data: [], hasNextPage: false };
  }
}

// 3. Fetch Seasonal Anime
export async function fetchSeasonalAnime(
  year?: number,
  season?: Season,
  limit: number = 10,
): Promise<Anime[]> {
  try {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentSeason = (season || getCurrentSeason()).toUpperCase();

    const query = `
      query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(
            season: $season,
            seasonYear: $seasonYear,
            type: ANIME,
            sort: [POPULARITY_DESC]
          ) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, {
      season: currentSeason,
      seasonYear: currentYear,
      perPage: limit,
    });

    return (data?.Page?.media || []).map(mapAniListMediaToAnime);
  } catch (error) {
    console.error("fetchSeasonalAnime error:", error);
    return [];
  }
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 3) return "winter";
  if (month >= 4 && month <= 6) return "spring";
  if (month >= 7 && month <= 9) return "summer";
  return "fall";
}

// 4. Fetch Upcoming Anime
export async function fetchUpcomingAnime(limit: number = 25): Promise<Anime[]> {
  try {
    const query = `
      query ($perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(status: NOT_YET_RELEASED, sort: [POPULARITY_DESC], type: ANIME) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, {
      perPage: limit,
    });

    return (data?.Page?.media || []).map(mapAniListMediaToAnime);
  } catch (error) {
    console.error("fetchUpcomingAnime error:", error);
    return [];
  }
}

// 5. Search Anime with Filters
export async function searchAnime(
  query: string,
  filters?: Partial<SearchFilters>,
): Promise<{
  data: Anime[];
  pagination: JikanAPIResponse<Anime[]>["pagination"];
  error?: { status: number; message: string };
}> {
  try {
    const page = filters?.page || 1;
    const perPage = filters?.limit || 24;

    const variables: Record<string, unknown> = {
      page,
      perPage,
    };

    if (query && query.trim() !== "") {
      variables.search = query.trim();
    }

    // Genre filter: map numeric mal_ids to AniList genre strings
    if (filters?.genres && filters.genres.length > 0) {
      const genreNames = filters.genres
        .map((id) => GENRE_ID_TO_NAME.get(id))
        .filter((name): name is string => !!name);
      if (genreNames.length > 0) {
        variables.genre_in = genreNames;
      }
    }

    if (filters?.type) {
      const format = mapAnimeTypeToFormat(filters.type);
      if (format) variables.format = format;
    }

    if (filters?.status) {
      const status = mapAnimeStatusToStatus(filters.status);
      if (status) variables.status = status;
    }

    if (filters?.minScore !== null && filters?.minScore !== undefined) {
      variables.averageScore_greater = Math.round(filters.minScore * 10);
    }

    if (filters?.maxScore !== null && filters?.maxScore !== undefined) {
      variables.averageScore_lesser = Math.round(filters.maxScore * 10);
    }

    if (filters?.year) {
      variables.seasonYear = filters.year;
    }

    if (filters?.season) {
      variables.season = filters.season.toUpperCase();
    }

    // Sort order
    if (filters?.sortBy) {
      const isDesc = filters.orderBy !== "asc";
      switch (filters.sortBy) {
        case "score":
          variables.sort = isDesc ? ["SCORE_DESC"] : ["SCORE"];
          break;
        case "popularity":
          variables.sort = isDesc ? ["POPULARITY_DESC"] : ["POPULARITY"];
          break;
        case "favorites":
          variables.sort = isDesc ? ["FAVOURITES_DESC"] : ["FAVOURITES"];
          break;
        case "title":
          variables.sort = isDesc ? ["TITLE_ROMAJI_DESC"] : ["TITLE_ROMAJI"];
          break;
        default:
          variables.sort = ["SEARCH_MATCH"];
      }
    } else if (variables.search) {
      variables.sort = ["SEARCH_MATCH"];
    } else {
      variables.sort = ["POPULARITY_DESC"];
    }

    const gqlQuery = `
      query (
        $page: Int,
        $perPage: Int,
        $search: String,
        $genre_in: [String],
        $format: MediaFormat,
        $status: MediaStatus,
        $sort: [MediaSort],
        $averageScore_greater: Int,
        $averageScore_lesser: Int,
        $seasonYear: Int,
        $season: MediaSeason
      ) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(
            search: $search,
            genre_in: $genre_in,
            format: $format,
            status: $status,
            sort: $sort,
            averageScore_greater: $averageScore_greater,
            averageScore_lesser: $averageScore_lesser,
            seasonYear: $seasonYear,
            season: $season,
            type: ANIME
          ) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{
      Page: {
        pageInfo: {
          total: number;
          perPage: number;
          currentPage: number;
          lastPage: number;
          hasNextPage: boolean;
        };
        media: AniListMedia[];
      };
    }>(gqlQuery, variables);

    const mediaList = data?.Page?.media || [];
    const pageInfo = data?.Page?.pageInfo;

    return {
      data: mediaList.map(mapAniListMediaToAnime),
      pagination: pageInfo
        ? {
            last_visible_page: pageInfo.lastPage,
            has_next_page: pageInfo.hasNextPage,
            current_page: pageInfo.currentPage,
            items: {
              count: mediaList.length,
              total: pageInfo.total,
              per_page: pageInfo.perPage,
            },
          }
        : undefined,
    };
  } catch (error: any) {
    console.error("searchAnime error:", error);
    return {
      data: [],
      pagination: undefined,
      error: {
        status: error?.status || 500,
        message: error?.message || "Failed to search anime from AniList",
      },
    };
  }
}

// 6. Fetch Anime Details by ID
export async function fetchAnimeDetails(id: number): Promise<AnimeDetail> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        synonyms
        source
        externalLinks {
          site
          url
          type
        }
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
                english
              }
              type
            }
          }
        }
      }
    }
  `;

  try {
    const data = await anilistQuery<{ Media: AniListMedia }>(query, { id });
    if (data?.Media) {
      return mapAniListMediaToAnimeDetail(data.Media);
    }
  } catch (primaryError) {
    // If lookup by AniList ID fails, attempt fallback by MAL ID (for backwards compatibility with existing bookmarks/links)
    try {
      const malQuery = `
        query ($id: Int) {
          Media(idMal: $id, type: ANIME) {
            ${MEDIA_FIELDS}
            synonyms
            source
            externalLinks {
              site
              url
              type
            }
            relations {
              edges {
                relationType
                node {
                  id
                  title {
                    romaji
                    english
                  }
                  type
                }
              }
            }
          }
        }
      `;
      const fallbackData = await anilistQuery<{ Media: AniListMedia }>(malQuery, { id });
      if (fallbackData?.Media) {
        return mapAniListMediaToAnimeDetail(fallbackData.Media);
      }
    } catch {
      // Re-throw primary error if fallback also fails
    }
    throw primaryError;
  }

  throw new Error(`Anime with ID ${id} not found`);
}

// 7. Fetch Anime Characters
export async function fetchAnimeCharacters(id: number): Promise<Character[]> {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          characters(page: 1, perPage: 25, sort: [ROLE, RELEVANCE]) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
              }
              voiceActors(language: JAPANESE) {
                id
                name {
                  full
                }
                languageV2
                image {
                  large
                }
              }
            }
          }
        }
      }
    `;

    const data = await anilistQuery<{
      Media: {
        characters: {
          edges: Array<{
            role: "MAIN" | "SUPPORTING";
            node: {
              id: number;
              name: { full: string; native: string | null };
              image: { large: string | null; medium: string | null };
            };
            voiceActors: Array<{
              id: number;
              name: { full: string };
              image: { large: string | null };
            }>;
          }>;
        };
      };
    }>(query, { id });

    const edges = data?.Media?.characters?.edges || [];

    return edges.map((edge) => {
      const charImage = edge.node.image?.large || edge.node.image?.medium || "";
      const voiceActor = edge.voiceActors?.[0];

      return {
        character: {
          mal_id: edge.node.id,
          name: edge.node.name.full,
          images: {
            jpg: { image_url: charImage },
            webp: { image_url: charImage },
          },
        },
        role: edge.role === "MAIN" ? "Main" : "Supporting",
        voice_actors: voiceActor
          ? [
              {
                mal_id: voiceActor.id,
                name: voiceActor.name.full,
                language: "Japanese",
                images: {
                  jpg: {
                    image_url: voiceActor.image?.large || "",
                  },
                },
              },
            ]
          : [],
      };
    });
  } catch (error) {
    console.error("fetchAnimeCharacters error:", error);
    return [];
  }
}

// 8. Fetch Anime Episodes
export async function fetchAnimeEpisodes(
  id: number,
  page: number = 1,
): Promise<{ data: Episode[]; pagination: any }> {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
        }
      }
    `;

    const data = await anilistQuery<{
      Media: {
        streamingEpisodes?: Array<{
          title: string | null;
          thumbnail: string | null;
          url: string | null;
          site: string | null;
        }>;
      };
    }>(query, { id });

    const episodesList = data?.Media?.streamingEpisodes || [];
    const perPage = 25;
    const startIndex = (page - 1) * perPage;
    const pagedItems = episodesList.slice(startIndex, startIndex + perPage);

    const episodes: Episode[] = pagedItems.map((ep, idx) => ({
      mal_id: startIndex + idx + 1,
      title: ep.title || `Episode ${startIndex + idx + 1}`,
      title_japanese: null,
      title_romanji: null,
      aired: null,
      score: null,
      filler: false,
      recap: false,
      forum_url: ep.url || null,
    }));

    return {
      data: episodes,
      pagination: {
        last_visible_page: Math.ceil(episodesList.length / perPage) || 1,
        has_next_page: startIndex + perPage < episodesList.length,
        current_page: page,
        items: {
          count: episodes.length,
          total: episodesList.length,
          per_page: perPage,
        },
      },
    };
  } catch (error) {
    console.error("fetchAnimeEpisodes error:", error);
    return {
      data: [],
      pagination: null,
    };
  }
}

// 9. Fetch Anime Recommendations
export async function fetchAnimeRecommendations(
  id: number,
  limit: number = 20,
): Promise<Anime[]> {
  try {
    const query = `
      query ($id: Int, $perPage: Int) {
        Media(id: $id, type: ANIME) {
          recommendations(page: 1, perPage: $perPage, sort: [RATING_DESC]) {
            nodes {
              mediaRecommendation {
                ${MEDIA_FIELDS}
              }
            }
          }
        }
      }
    `;

    const data = await anilistQuery<{
      Media: {
        recommendations: {
          nodes: Array<{
            mediaRecommendation: AniListMedia | null;
          }>;
        };
      };
    }>(query, { id, perPage: limit });

    const recs = data?.Media?.recommendations?.nodes || [];
    return recs
      .map((r) => r.mediaRecommendation)
      .filter((media): media is AniListMedia => !!media)
      .map(mapAniListMediaToAnime);
  } catch (error) {
    console.error("fetchAnimeRecommendations error:", error);
    return [];
  }
}

// 10. Fetch Genres for Filter Panel
export async function fetchGenres(): Promise<Genre[]> {
  return ANILIST_GENRES;
}

// 11. Fetch Anime by Multiple IDs (Batch)
export async function fetchAnimeByIds(ids: number[]): Promise<Anime[]> {
  if (ids.length === 0) return [];
  try {
    const query = `
      query ($ids: [Int]) {
        Page(page: 1, perPage: 50) {
          media(id_in: $ids, type: ANIME) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `;

    const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, {
      ids,
    });

    return (data?.Page?.media || []).map(mapAniListMediaToAnime);
  } catch (error) {
    console.error("fetchAnimeByIds error:", error);
    return [];
  }
}

// 12. Validate Anime Data
export function validateAnimeData(data: unknown): data is Anime {
  if (!data || typeof data !== "object") return false;

  const anime = data as Partial<Anime>;

  if (
    typeof anime.mal_id !== "number" ||
    anime.mal_id <= 0 ||
    typeof anime.title !== "string" ||
    anime.title.trim() === ""
  ) {
    return false;
  }

  return true;
}
