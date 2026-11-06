import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedSearchService } from '../services/savedSearchService';

export const SAVED_SEARCH_QUERY_KEY = ['saved-searches'] as const;

export const useSavedSearches = () =>
  useInfiniteQuery({
    queryKey: SAVED_SEARCH_QUERY_KEY,
    queryFn: ({ pageParam }) => savedSearchService.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

export const useSavedSearchActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: SAVED_SEARCH_QUERY_KEY });

  return {
    create: useMutation({
      mutationFn: ({
        name,
        criteria,
      }: {
        name: string;
        criteria: Record<string, string | number>;
      }) => savedSearchService.create(name, criteria),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
        savedSearchService.update(id, enabled),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: savedSearchService.remove, onSuccess: invalidate }),
  };
};
