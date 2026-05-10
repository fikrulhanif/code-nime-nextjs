// Utility functions for XSS prevention and data sanitization

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Requirement 21.2: Escape HTML special characters (<, >, &, ", ') in anime synopsis and descriptions
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitizes anime synopsis for safe display
 * Escapes HTML special characters and trims whitespace
 */
export function sanitizeSynopsis(synopsis: string | null | undefined): string {
  if (!synopsis) return "";

  // Trim whitespace and escape HTML
  const trimmed = synopsis.trim();
  return escapeHtml(trimmed);
}

/**
 * Sanitizes anime title for safe display
 * Escapes HTML special characters
 */
export function sanitizeTitle(title: string | null | undefined): string {
  if (!title) return "";

  return escapeHtml(title.trim());
}

/**
 * Sanitizes anime background text for safe display
 * Escapes HTML special characters
 */
export function sanitizeBackground(
  background: string | null | undefined,
): string {
  if (!background) return "";

  return escapeHtml(background.trim());
}

/**
 * Sanitizes any user-facing text content
 * General purpose sanitization function
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";

  return escapeHtml(text.trim());
}

/**
 * Truncates text to a maximum length and adds ellipsis
 * Also sanitizes the text for XSS prevention
 */
export function truncateAndSanitize(
  text: string | null | undefined,
  maxLength: number,
): string {
  if (!text) return "";

  const sanitized = sanitizeText(text);

  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return sanitized.substring(0, maxLength) + "...";
}
