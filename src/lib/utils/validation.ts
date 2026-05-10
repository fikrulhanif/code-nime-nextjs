// Data validation utilities with logging
// Requirements 21.3, 21.4: Validate all API responses against TypeScript interfaces

import {
  Anime,
  AnimeDetail,
  Character,
  Genre,
  AnimeType,
  AnimeStatus,
} from "@/types/anime";

/**
 * Validation error logger
 * Requirement 21.4: Log validation errors
 */
function logValidationError(
  context: string,
  field: string,
  value: unknown,
  reason: string,
): void {
  console.error(`[Validation Error] ${context}`, {
    field,
    value,
    reason,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validates anime mal_id
 * Requirement 17.1: mal_id must be a positive integer greater than 0
 */
export function validateMalId(
  malId: unknown,
  context: string = "Anime",
): malId is number {
  if (typeof malId !== "number") {
    logValidationError(context, "mal_id", malId, "Must be a number");
    return false;
  }

  if (malId <= 0 || !Number.isInteger(malId)) {
    logValidationError(
      context,
      "mal_id",
      malId,
      "Must be a positive integer greater than 0",
    );
    return false;
  }

  return true;
}

/**
 * Validates anime title
 * Requirement 17.2: title must be a non-empty string
 */
export function validateTitle(
  title: unknown,
  context: string = "Anime",
): title is string {
  if (typeof title !== "string") {
    logValidationError(context, "title", title, "Must be a string");
    return false;
  }

  if (title.trim() === "") {
    logValidationError(context, "title", title, "Must be non-empty");
    return false;
  }

  return true;
}

/**
 * Validates anime score
 * Requirement 17.3: score must be between 0 and 10 inclusive if present
 */
export function validateScore(
  score: unknown,
  context: string = "Anime",
): score is number | null {
  if (score === null || score === undefined) {
    return true; // Score is optional
  }

  if (typeof score !== "number") {
    logValidationError(context, "score", score, "Must be a number or null");
    return false;
  }

  if (score < 0 || score > 10) {
    logValidationError(
      context,
      "score",
      score,
      "Must be between 0 and 10 inclusive",
    );
    return false;
  }

  return true;
}

/**
 * Validates anime episodes
 * Requirement 17.4: episodes must be a positive integer if present
 */
export function validateEpisodes(
  episodes: unknown,
  context: string = "Anime",
): episodes is number | null {
  if (episodes === null || episodes === undefined) {
    return true; // Episodes is optional
  }

  if (typeof episodes !== "number") {
    logValidationError(
      context,
      "episodes",
      episodes,
      "Must be a number or null",
    );
    return false;
  }

  if (episodes <= 0 || !Number.isInteger(episodes)) {
    logValidationError(
      context,
      "episodes",
      episodes,
      "Must be a positive integer",
    );
    return false;
  }

  return true;
}

/**
 * Validates anime type
 * Requirement 17.5: type must be one of the valid anime types
 */
export function validateAnimeType(
  type: unknown,
  context: string = "Anime",
): type is AnimeType {
  const validTypes: AnimeType[] = [
    "tv",
    "movie",
    "ova",
    "special",
    "ona",
    "music",
  ];

  if (typeof type !== "string") {
    logValidationError(context, "type", type, "Must be a string");
    return false;
  }

  if (!validTypes.includes(type as AnimeType)) {
    logValidationError(
      context,
      "type",
      type,
      `Must be one of: ${validTypes.join(", ")}`,
    );
    return false;
  }

  return true;
}

/**
 * Validates anime status
 * Requirement 17.6: status must be one of the valid anime statuses
 */
export function validateAnimeStatus(
  status: unknown,
  context: string = "Anime",
): status is AnimeStatus {
  const validStatuses: AnimeStatus[] = ["airing", "complete", "upcoming"];

  if (typeof status !== "string") {
    logValidationError(context, "status", status, "Must be a string");
    return false;
  }

  if (!validStatuses.includes(status as AnimeStatus)) {
    logValidationError(
      context,
      "status",
      status,
      `Must be one of: ${validStatuses.join(", ")}`,
    );
    return false;
  }

  return true;
}

/**
 * Validates YouTube URL
 * Requirement 17.7: YouTube URL must match valid patterns
 */
export function validateYouTubeUrl(
  url: unknown,
  context: string = "Trailer",
): url is string {
  if (!url || typeof url !== "string") {
    return true; // URL is optional
  }

  const youtubePatterns = [
    /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/,
    /^https:\/\/youtu\.be\/[\w-]+/,
  ];

  const isValid = youtubePatterns.some((pattern) => pattern.test(url));

  if (!isValid) {
    logValidationError(
      context,
      "url",
      url,
      "Must match YouTube URL patterns (youtube.com/watch?v= or youtu.be/)",
    );
  }

  return isValid;
}

/**
 * Validates complete Anime object
 * Requirement 21.3: Validate all API responses against TypeScript interfaces
 */
export function validateAnime(data: unknown): data is Anime {
  if (!data || typeof data !== "object") {
    logValidationError("Anime", "data", data, "Must be an object");
    return false;
  }

  const anime = data as Partial<Anime>;

  // Validate required fields
  if (!validateMalId(anime.mal_id, "Anime")) {
    return false;
  }

  if (!validateTitle(anime.title, "Anime")) {
    return false;
  }

  // Validate optional fields with constraints
  if (!validateScore(anime.score, "Anime")) {
    return false;
  }

  if (!validateEpisodes(anime.episodes, "Anime")) {
    return false;
  }

  if (anime.type && !validateAnimeType(anime.type, "Anime")) {
    return false;
  }

  if (anime.status && !validateAnimeStatus(anime.status, "Anime")) {
    return false;
  }

  // Validate images structure
  if (!anime.images || typeof anime.images !== "object") {
    logValidationError("Anime", "images", anime.images, "Must be an object");
    return false;
  }

  if (
    !anime.images.jpg ||
    typeof anime.images.jpg.image_url !== "string" ||
    anime.images.jpg.image_url.trim() === ""
  ) {
    logValidationError(
      "Anime",
      "images.jpg.image_url",
      anime.images.jpg,
      "Must have valid image_url",
    );
    return false;
  }

  // Validate trailer URL if present
  if (anime.trailer?.url) {
    validateYouTubeUrl(anime.trailer.url, "Anime.trailer");
  }

  return true;
}

/**
 * Validates AnimeDetail object
 */
export function validateAnimeDetail(data: unknown): data is AnimeDetail {
  // AnimeDetail extends Anime, so first validate as Anime
  if (!validateAnime(data)) {
    return false;
  }

  const detail = data as Partial<AnimeDetail>;

  // Additional AnimeDetail-specific validations can be added here
  if (detail.title_synonyms && !Array.isArray(detail.title_synonyms)) {
    logValidationError(
      "AnimeDetail",
      "title_synonyms",
      detail.title_synonyms,
      "Must be an array",
    );
    return false;
  }

  return true;
}

/**
 * Validates Character object
 */
export function validateCharacter(data: unknown): data is Character {
  if (!data || typeof data !== "object") {
    logValidationError("Character", "data", data, "Must be an object");
    return false;
  }

  const character = data as Partial<Character>;

  if (!validateMalId(character.mal_id, "Character")) {
    return false;
  }

  if (!validateTitle(character.name, "Character")) {
    return false;
  }

  const validRoles = ["Main", "Supporting"];
  if (character.role && !validRoles.includes(character.role)) {
    logValidationError(
      "Character",
      "role",
      character.role,
      `Must be one of: ${validRoles.join(", ")}`,
    );
    return false;
  }

  return true;
}

/**
 * Validates Genre object
 */
export function validateGenre(data: unknown): data is Genre {
  if (!data || typeof data !== "object") {
    logValidationError("Genre", "data", data, "Must be an object");
    return false;
  }

  const genre = data as Partial<Genre>;

  if (!validateMalId(genre.mal_id, "Genre")) {
    return false;
  }

  if (!validateTitle(genre.name, "Genre")) {
    return false;
  }

  const validTypes = ["anime", "manga"];
  if (genre.type && !validTypes.includes(genre.type)) {
    logValidationError(
      "Genre",
      "type",
      genre.type,
      `Must be one of: ${validTypes.join(", ")}`,
    );
    return false;
  }

  return true;
}

/**
 * Validates an array of items using a validator function
 */
export function validateArray<T>(
  data: unknown,
  validator: (item: unknown) => item is T,
  context: string,
): data is T[] {
  if (!Array.isArray(data)) {
    logValidationError(context, "data", data, "Must be an array");
    return false;
  }

  // Validate each item and filter out invalid ones
  const validItems = data.filter((item) => validator(item));

  // If some items were invalid, log a warning
  if (validItems.length < data.length) {
    console.warn(
      `[Validation Warning] ${context}: ${data.length - validItems.length} invalid items filtered out`,
    );
  }

  return validItems.length > 0;
}

/**
 * Safely validates and filters an array of anime
 * Returns only valid anime items
 */
export function validateAndFilterAnimeArray(data: unknown): Anime[] {
  if (!Array.isArray(data)) {
    logValidationError("AnimeArray", "data", data, "Must be an array");
    return [];
  }

  return data.filter((item): item is Anime => validateAnime(item));
}

/**
 * Safely validates and filters an array of characters
 * Returns only valid character items
 */
export function validateAndFilterCharacterArray(data: unknown): Character[] {
  if (!Array.isArray(data)) {
    logValidationError("CharacterArray", "data", data, "Must be an array");
    return [];
  }

  return data.filter((item): item is Character => validateCharacter(item));
}

/**
 * Safely validates and filters an array of genres
 * Returns only valid genre items
 */
export function validateAndFilterGenreArray(data: unknown): Genre[] {
  if (!Array.isArray(data)) {
    logValidationError("GenreArray", "data", data, "Must be an array");
    return [];
  }

  return data.filter((item): item is Genre => validateGenre(item));
}
