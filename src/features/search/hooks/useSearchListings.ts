import { useInfiniteQuery } from '@tanstack/react-query';
import { searchRepository } from '../services';
import type { SearchFilters } from '../types';

export const useSearchListings = (filters: SearchFilters) => {
  return useInfiniteQuery({
    queryKey: ['search-listings', filters],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      searchRepository.search({ ...filters, page: pageParam }, signal),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });
};
