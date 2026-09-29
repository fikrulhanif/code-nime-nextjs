/**
 * Security utilities export
 * Requirements 21.2, 21.3, 21.4: XSS prevention and data validation
 */

export { escapeHtml, sanitizeAnimeText } from "./sanitize";
export {
  validateAnime,
  validateAnimeDetail,
  validateAnimeArray,
  GENERIC_ERROR_MESSAGE,
} from "./validator";

// Re-export for backward compatibility
export function sanitizeAnimeData<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== "object") return data;

  // Just return the data as-is since React automatically escapes content
  // and we don't want to double-escape
  return data;
}

export function logValidationError(
  context: string,
  message: string,
  data: unknown,
): void {
  console.error(`[Validation Error - ${context}]`, message, {
    timestamp: new Date().toISOString(),
    data: typeof data === "object" ? JSON.stringify(data).slice(0, 200) : data,
  });
}

export const VALIDATION_ERROR_MESSAGE =
  "We encountered an error loading this content. Please try again later.";
