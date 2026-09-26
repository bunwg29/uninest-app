import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@core';
import { listingService } from '../services/listingService';
import type { CreateListingPayload, ListingResponse } from '../types';
import {
  LANDLORD_LISTINGS_QUERY_KEY,
  LANDLORD_LISTING_DETAIL_QUERY_KEY,
} from './useLandlordListings';

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, AppError, CreateListingPayload>({
    mutationFn: (dto) => listingService.createListing(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LANDLORD_LISTINGS_QUERY_KEY });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, AppError, { id: string; dto: CreateListingPayload }>({
    mutationFn: ({ id, dto }) => listingService.updateListing(id, dto),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LANDLORD_LISTINGS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: [LANDLORD_LISTING_DETAIL_QUERY_KEY, variables.id],
        }),
      ]);
    },
  });
};
