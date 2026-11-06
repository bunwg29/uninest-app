import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services';
import type { ListingViewSource } from '../types';

export const LISTING_DETAIL_QUERY_KEY = ['listing-detail'] as const;

export const useListingDetail = (id: string) =>
  useQuery({
    queryKey: [...LISTING_DETAIL_QUERY_KEY, id],
    queryFn: () => listingService.getListingDetail(id),
    enabled: Boolean(id),
  });

export const useRecordListingView = (id: string, source?: ListingViewSource) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => listingService.recordListingView(id, source),
    onSuccess: (response) => {
      if (response.viewCount === null) return;

      queryClient.setQueryData(
        [...LISTING_DETAIL_QUERY_KEY, id],
        (current: { viewCount: number } | undefined) =>
          current ? { ...current, viewCount: response.viewCount } : current
      );
    },
  });
};

export const useReportListing = (id: string) =>
  useMutation({
    mutationFn: ({ reason, note }: { reason: string; note?: string }) =>
      listingService.reportListing(id, reason, note),
  });
