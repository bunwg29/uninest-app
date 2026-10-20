import { apiClient, unwrapApiData } from '@core';
import type { SearchListingsPage } from '../types';

export const favoriteService = {
  async list(page: number, limit = 20): Promise<SearchListingsPage> {
    const response = await apiClient.get('/listings/favorites', { params: { page, limit } });

    return unwrapApiData<SearchListingsPage>(response.data);
  },

  async listIds(): Promise<string[]> {
    const response = await apiClient.get('/listings/favorites/ids');

    return unwrapApiData<string[]>(response.data);
  },

  async add(listingId: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/favorite`);
  },

  async remove(listingId: string): Promise<void> {
    await apiClient.delete(`/listings/${listingId}/favorite`);
  },
};
