import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { landlordListingsService } from '../services';
import type { LandlordListing, LandlordListingStatus } from '../types';

export const LANDLORD_LISTINGS_QUERY_KEY = ['landlord-listings'];
export const LANDLORD_LISTING_DETAIL_QUERY_KEY = 'landlord-listing-detail';

export const useLandlordListings = (status: LandlordListingStatus, keyword?: string) => {
  return useInfiniteQuery({
    queryKey: [...LANDLORD_LISTINGS_QUERY_KEY, status, keyword],
    queryFn: ({ pageParam }) => landlordListingsService.getListings(status, pageParam, keyword),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
};

export const useLandlordListingDetail = (id: string, initialData?: LandlordListing) => {
  return useQuery({
    queryKey: [LANDLORD_LISTING_DETAIL_QUERY_KEY, id],
    queryFn: () => landlordListingsService.getListing(id),
    initialData,
    enabled: Boolean(id),
  });
};

export const useLandlordListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      id,
    }: {
      action: 'hide' | 'republish' | 'rent' | 'unrent' | 'delete';
      id: string;
    }): Promise<{ deleted: boolean } | void> => {
      if (action === 'hide') return landlordListingsService.hideListing(id);

      if (action === 'republish') return landlordListingsService.republishListing(id);

      if (action === 'rent') return landlordListingsService.markRented(id);

      if (action === 'unrent') return landlordListingsService.markAvailable(id);

      return landlordListingsService.deleteListing(id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LANDLORD_LISTINGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [LANDLORD_LISTING_DETAIL_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['listing-detail'] }),
      ]);
    },
  });
};

export const useLandlordListingDetailMutation = () =>
  useMutation({ mutationFn: landlordListingsService.getListing });
