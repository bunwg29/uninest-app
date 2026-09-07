export interface ApiResponse<T = unknown> {
  status: boolean;
  data: T;
  error?: string | null;
  messages: string | string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  hasMore: boolean;
}

export interface ApiErrorResponse {
  status: false;
  data: null;
  error?: string | null;
  messages: string | string[];
  statusCode?: number;
  timestamp?: string;
  path?: string;
}
