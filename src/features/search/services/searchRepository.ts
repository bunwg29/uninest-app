import { apiClient } from '@core';
import type { SearchListingsPage, SearchRepository } from '../types';
import { buildSearchParams } from './searchParams';

const unwrapData = <T>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const searchRepository: SearchRepository = {
  async search(filters, signal): Promise<SearchListingsPage> {
    const response = await apiClient.get('/listings/search', {
      params: buildSearchParams(filters),
      signal,
    });

    return unwrapData<SearchListingsPage>(response.data);
  },
};
