import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@features/auth';
import { useToast } from '@hooks';
import { favoriteService } from '../services/favoriteService';

export const FAVORITE_IDS_QUERY_KEY = ['favorite-ids'] as const;
export const FAVORITES_QUERY_KEY = ['favorites'] as const;

export const useFavoriteIds = () => {
  const { role } = useAuth();

  return useQuery({
    queryKey: FAVORITE_IDS_QUERY_KEY,
    queryFn: () => favoriteService.listIds(),
    enabled: role === 'student',
    staleTime: 60_000,
  });
};

export const useFavorites = () =>
  useInfiniteQuery({
    queryKey: FAVORITES_QUERY_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => favoriteService.list(pageParam),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ listingId, isSaved }: { listingId: string; isSaved: boolean }) =>
      isSaved ? favoriteService.remove(listingId) : favoriteService.add(listingId),
    onMutate: async ({ listingId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_IDS_QUERY_KEY });

      const previous = queryClient.getQueryData<string[]>(FAVORITE_IDS_QUERY_KEY);

      queryClient.setQueryData<string[]>(FAVORITE_IDS_QUERY_KEY, (current = []) =>
        isSaved ? current.filter((id) => id !== listingId) : [...current, listingId]
      );

      return { previous };
    },
    onError: (error, { isSaved }, context) => {
      queryClient.setQueryData(FAVORITE_IDS_QUERY_KEY, context?.previous);
      toast.error(
        error instanceof Error
          ? error.message
          : isSaved
            ? 'Không thể bỏ lưu phòng'
            : 'Không thể lưu phòng'
      );
    },
    onSettled: (_data, _error, { listingId }) => {
      void queryClient.invalidateQueries({ queryKey: FAVORITE_IDS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
