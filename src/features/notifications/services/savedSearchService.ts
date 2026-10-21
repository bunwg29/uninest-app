import { apiClient, unwrapApiData } from '@core';

export interface SavedSearch {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
}

export interface SavedSearchPage {
  items: SavedSearch[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export const savedSearchService = {
  async list(page: number): Promise<SavedSearchPage> {
    const response = await apiClient.get('/saved-searches', { params: { page, limit: 20 } });

    return unwrapApiData<SavedSearchPage>(response.data);
  },

  async create(name: string, criteria: Record<string, string | number>): Promise<SavedSearch> {
    const response = await apiClient.post('/saved-searches', { name, criteria });

    return unwrapApiData<SavedSearch>(response.data);
  },

  async update(id: string, enabled: boolean): Promise<SavedSearch> {
    const response = await apiClient.patch(`/saved-searches/${id}`, { enabled });

    return unwrapApiData<SavedSearch>(response.data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/saved-searches/${id}`);
  },
};
