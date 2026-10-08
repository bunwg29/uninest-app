import { apiClient, unwrapApiData } from '@core';

export interface University {
  code: string;
  name: string;
}

export const UNIVERSITY_SEARCH_LIMIT = 30;

export const universitiesService = {
  async search(keyword: string, signal?: AbortSignal): Promise<University[]> {
    const response = await apiClient.get('/universities', {
      params: { keyword: keyword.trim() || undefined, limit: UNIVERSITY_SEARCH_LIMIT },
      signal,
    });

    return unwrapApiData<University[]>(response.data);
  },
};
