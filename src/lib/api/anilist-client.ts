// AniList GraphQL API Client

const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

export interface AniListError {
  message: string;
  status?: number;
  locations?: Array<{ line: number; column: number }>;
}

export async function anilistQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  retries: number = MAX_RETRIES,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle Rate Limiting (429)
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const delayMs = retryAfterHeader
        ? Math.max(parseInt(retryAfterHeader, 10) * 1000, 1500)
        : 2000;

      if (retries > 0) {
        console.warn(`[AniList] Rate limited (429). Retrying after ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return anilistQuery<T>(query, variables, retries - 1);
      }
      throw new Error("AniList rate limit reached. Please try again shortly.");
    }

    // Handle 5xx Server Errors
    if (response.status >= 500 && retries > 0) {
      console.warn(`[AniList] Server error ${response.status}. Retrying in 1s...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return anilistQuery<T>(query, variables, retries - 1);
    }

    if (!response.ok) {
      let errorMsg = `AniList request failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.errors?.[0]?.message) {
          errorMsg = errorJson.errors[0].message;
        }
      } catch {
        // use fallback errorMsg
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      console.error("[AniList] GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message || "GraphQL error");
    }

    return result.data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      if (retries > 0) {
        console.warn("[AniList] Request timed out. Retrying...");
        return anilistQuery<T>(query, variables, retries - 1);
      }
      throw new Error("AniList request timed out. Please check your internet connection.");
    }
    throw err;
  }
}
