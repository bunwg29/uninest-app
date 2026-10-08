import { apiClient, unwrapApiData } from '@core';
import type { SearchListingsPage, SearchRepository } from '../types';
import { buildSearchParams } from './searchParams';

export const searchRepository: SearchRepository = {
  async search(filters, signal): Promise<SearchListingsPage> {
    const response = await apiClient.get('/listings/search', {
      params: buildSearchParams(filters),
      signal,
    });

    return unwrapApiData<SearchListingsPage>(response.data);
  },
};
