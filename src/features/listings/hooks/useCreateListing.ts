import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@core';
import { listingService } from '../services/listingService';
import type { CreateListingPayload, ListingResponse } from '../types';
import { LANDLORD_LISTINGS_QUERY_KEY } from './useLandlordListings';

export const useCreateListing = () => {
  return useMutation<ListingResponse, AppError, CreateListingPayload>({
    mutationFn: (dto) => listingService.createListing(dto),
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation<ListingResponse, AppError, { id: string; dto: CreateListingPayload }>({
    mutationFn: ({ id, dto }) => listingService.updateListing(id, dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LANDLORD_LISTINGS_QUERY_KEY });
    },
  });
};
