import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services';

export const LISTING_DETAIL_QUERY_KEY = ['listing-detail'] as const;

export const useListingDetail = (id: string) =>
  useQuery({
    queryKey: [...LISTING_DETAIL_QUERY_KEY, id],
    queryFn: () => listingService.getListingDetail(id),
    enabled: Boolean(id),
  });

export const useRecordListingView = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => listingService.recordListingView(id),
    onSuccess: (response) => {
      queryClient.setQueryData(
        [...LISTING_DETAIL_QUERY_KEY, id],
        (current: { viewCount: number } | undefined) =>
          current ? { ...current, viewCount: response.viewCount } : current
      );
    },
  });
};
