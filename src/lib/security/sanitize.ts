/**
 * Security utilities for XSS prevention
 * Requirement 21.2: Escape HTML special characters
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Requirement 21.2: Escape <, >, &, ", '
 */
export function escapeHtml(text: string): string {
  if (!text) return "";

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

/**
 * Sanitizes anime synopsis and descriptions
 * Requirement 21.2: Escape HTML in anime content
 */
export function sanitizeAnimeText(text: string | null | undefined): string {
  if (!text) return "";
  return escapeHtml(text);
}
