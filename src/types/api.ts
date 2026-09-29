// API response and error type definitions
// Note: JikanAPIResponse is kept for backward compatibility after AniList migration

export interface JikanAPIResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface APIError {
  status: number;
  type: string;
  message: string;
  error: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  total: number;
  perPage: number;
}
