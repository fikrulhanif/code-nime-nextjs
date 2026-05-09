// TanStack Query client configuration

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes (300 seconds)
      staleTime: 5 * 60 * 1000, // 300000ms

      // Keep unused data in cache for 30 minutes (1800 seconds)
      gcTime: 30 * 60 * 1000, // 1800000ms (formerly cacheTime)

      // Disable automatic refetch on window focus
      refetchOnWindowFocus: false,

      // Enable refetch on network reconnect
      refetchOnReconnect: true,

      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (except 429)
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500 && status !== 429) {
            return false;
          }
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
