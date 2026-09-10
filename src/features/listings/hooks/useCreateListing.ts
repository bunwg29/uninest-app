import { useMutation } from '@tanstack/react-query';
import { AppError } from '@core';
import { listingService } from '../services/listingService';
import type { CreateListingPayload, ListingResponse } from '../types';

export const useCreateListing = () => {
  return useMutation<ListingResponse, AppError, CreateListingPayload>({
    mutationFn: (dto) => listingService.createListing(dto),
  });
};
