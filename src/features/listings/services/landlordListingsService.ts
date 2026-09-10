import { apiClient } from '@core';
import type { LandlordListingStatus, LandlordListingsPage } from '../types/landlord';

const BASE_PATH = '/landlord/listings';

export const landlordListingsService = {
  async getListings(status: LandlordListingStatus, page: number): Promise<LandlordListingsPage> {
    const response = await apiClient.get<LandlordListingsPage>(BASE_PATH, {
      params: { status, page },
    });

    return response.data;
  },

  async hideListing(id: string): Promise<void> {
    await apiClient.patch(`${BASE_PATH}/${id}/hide`);
  },

  async republishListing(id: string): Promise<void> {
    await apiClient.patch(`${BASE_PATH}/${id}/republish`);
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
