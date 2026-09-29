// API client with rate limiting and error handling

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { APIError } from "@/types/api";

// Rate limiter class that enforces 3 requests per second with queue (max 10 items)
class RateLimiter {
  private queue: Array<() => void> = [];
  private requestTimestamps: number[] = [];
  private readonly maxRequestsPerSecond = 3;
  private readonly maxQueueSize = 10;
  private readonly windowMs = 1000;

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.canMakeRequest()) {
        this.recordRequest();
        execute();
      } else {
        if (this.queue.length >= this.maxQueueSize) {
          reject(new Error("Too many requests. Please try again later."));
          return;
        }

        this.queue.push(execute);
        this.scheduleNextRequest();
      }
    });
  }

  private canMakeRequest(): boolean {
    this.cleanOldTimestamps();
    return this.requestTimestamps.length < this.maxRequestsPerSecond;
  }

  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  private cleanOldTimestamps(): void {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
  }

  private scheduleNextRequest(): void {
    if (this.queue.length === 0) return;

    const delay = this.getDelayUntilNextSlot();
    setTimeout(() => {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        this.recordRequest();
        nextRequest();
        this.scheduleNextRequest();
      }
    }, delay);
  }

  private getDelayUntilNextSlot(): number {
    if (this.requestTimestamps.length === 0) return 0;

    const oldestTimestamp = this.requestTimestamps[0];
    const timeSinceOldest = Date.now() - oldestTimestamp;
    return Math.max(0, this.windowMs - timeSinceOldest);
  }
}

// Error handler that maps API errors to user-friendly messages
export function handleAPIError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIError>;

    if (axiosError.response) {
      // Server responded with error status
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      return {
        status,
        type: data?.type || "ServerError",
        message: data?.message || getDefaultErrorMessage(status),
        error: data?.error || axiosError.message,
      };
    } else if (axiosError.request) {
      // Request made but no response received
      return {
        status: 0,
        type: "NetworkError",
        message: "Network error. Check your connection.",
        error: axiosError.message,
      };
    }
  }

  // Unknown error
  return {
    status: 0,
    type: "UnknownError",
    message: "An unexpected error occurred",
    error: error instanceof Error ? error.message : String(error),
  };
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request";
    case 404:
      return "Resource not found";
    case 429:
      return "Too many requests. Please wait a moment.";
    case 500:
    case 502:
    case 503:
      return "Server error. Please try again later.";
    case 504:
      return "Gateway timeout. The server took too long to respond. Please try again later.";
    default:
      return "An error occurred";
  }
}

// Helper to detect 504 (Gateway Timeout) errors
export function isGatewayTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; type?: string };
  return e.status === 504;
}

// Retry logic with exponential backoff
// For 504 errors (gateway timeout), use a longer fixed delay
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Handle 504 (gateway timeout) - don't keep retrying
      // because server being unavailable won't resolve in seconds
      if (isGatewayTimeoutError(error)) {
        if (attempt < maxRetries) {
          // Wait longer for timeout issues (5s), only retry once
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        // Don't retry on client errors (except 429)
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error;
        }

        // Retry on 429 and 5xx errors
        if (
          attempt < maxRetries &&
          (status === 429 || (status && status >= 500))
        ) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError;
}

// Create Axios instance with configuration
const rateLimiter = new RateLimiter();

// Note: This client is deprecated after migration to AniList API
// Kept for legacy compatibility during transition period
const apiClient: AxiosInstance = axios.create({
  baseURL: "https://api.jikan.moe/v4",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for rate limiting
apiClient.interceptors.request.use(
  async (config) => {
    // Rate limiting is handled in the request wrapper
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = handleAPIError(error);
    return Promise.reject(apiError);
  },
);

// Wrapper function that applies rate limiting and retry logic
export async function makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
  return rateLimiter.throttle(async () => {
    return retryWithBackoff(async () => {
      const response = await apiClient.request<T>(config);
      return response.data;
    });
  });
}

export default apiClient;
