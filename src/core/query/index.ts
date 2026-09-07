import { QueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '../config';

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: API_CONFIG.RETRY_COUNT,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
