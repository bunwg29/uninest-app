import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordListingsService } from '../services';
import type { LandlordListingStatus } from '../types';

export const LANDLORD_LISTINGS_QUERY_KEY = ['landlord-listings'];

export const useLandlordListings = (status: LandlordListingStatus, keyword?: string) => {
  return useInfiniteQuery({
    queryKey: [...LANDLORD_LISTINGS_QUERY_KEY, status, keyword],
    queryFn: ({ pageParam }) => landlordListingsService.getListings(status, pageParam, keyword),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
};

export const useLandlordListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, id }: { action: 'hide' | 'republish' | 'delete'; id: string }) => {
      if (action === 'hide') return landlordListingsService.hideListing(id);

      if (action === 'republish') return landlordListingsService.republishListing(id);

      return landlordListingsService.deleteListing(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LANDLORD_LISTINGS_QUERY_KEY });
    },
  });
};

export const useLandlordListingDetailMutation = () =>
  useMutation({ mutationFn: landlordListingsService.getListing });
