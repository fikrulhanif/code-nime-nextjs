/**
 * API Response Validation
 * Requirement 21.3: Validate all API responses against TypeScript interfaces
 * Requirement 21.4: Log validation errors
 */

import { Anime, AnimeDetail } from "@/types/anime";

/**
 * Validates if an object has the required properties
 */
function hasRequiredProperties<T>(
  obj: any,
  requiredProps: (keyof T)[],
): boolean {
  return requiredProps.every((prop) => prop in obj);
}

/**
 * Validates anime object structure
 * Requirement 21.3: Validate API responses
 */
export function validateAnime(data: any): data is Anime {
  try {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid anime data: not an object");
    }

    const required: (keyof Anime)[] = ["mal_id", "title"];
    if (!hasRequiredProperties<Anime>(data, required)) {
      throw new Error("Invalid anime data: missing required properties");
    }

    if (typeof data.mal_id !== "number" || data.mal_id <= 0) {
      throw new Error("Invalid anime data: mal_id must be a positive number");
    }

    if (typeof data.title !== "string" || data.title.trim() === "") {
      throw new Error("Invalid anime data: title must be a non-empty string");
    }

    return true;
  } catch (error) {
    // Requirement 21.4: Log validation errors
    console.error("[Validation Error]", error);
    return false;
  }
}

/**
 * Validates anime detail object structure
 */
export function validateAnimeDetail(data: any): data is AnimeDetail {
  try {
    if (!validateAnime(data)) {
      return false;
    }

    // Additional validation for detail-specific fields can be added here
    return true;
  } catch (error) {
    console.error("[Validation Error]", error);
    return false;
  }
}

/**
 * Validates array of anime objects
 */
export function validateAnimeArray(data: any): data is Anime[] {
  try {
    if (!Array.isArray(data)) {
      throw new Error("Invalid anime array: not an array");
    }

    const allValid = data.every((item) => validateAnime(item));
    if (!allValid) {
      throw new Error("Invalid anime array: contains invalid items");
    }

    return true;
  } catch (error) {
    console.error("[Validation Error]", error);
    return false;
  }
}

/**
 * Generic error message for users
 * Requirement 21.4: Display generic error message to user
 */
export const GENERIC_ERROR_MESSAGE =
  "We encountered an error loading this content. Please try again later.";
