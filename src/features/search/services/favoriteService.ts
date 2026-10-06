import { apiClient } from '@core';
import type { SearchListingsPage } from '../types';

const unwrapData = <T>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const favoriteService = {
  async list(page: number, limit = 20): Promise<SearchListingsPage> {
    const response = await apiClient.get('/listings/favorites', { params: { page, limit } });

    return unwrapData<SearchListingsPage>(response.data);
  },

  async listIds(): Promise<string[]> {
    const response = await apiClient.get('/listings/favorites/ids');

    return unwrapData<string[]>(response.data);
  },

  async add(listingId: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/favorite`);
  },

  async remove(listingId: string): Promise<void> {
    await apiClient.delete(`/listings/${listingId}/favorite`);
  },
};
