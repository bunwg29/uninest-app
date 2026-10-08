import { apiClient } from '@core';

export interface University {
  code: string;
  name: string;
}

const unwrapData = <T>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const UNIVERSITY_SEARCH_LIMIT = 30;

export const universitiesService = {
  async search(keyword: string, signal?: AbortSignal): Promise<University[]> {
    const response = await apiClient.get('/universities', {
      params: { keyword: keyword.trim() || undefined, limit: UNIVERSITY_SEARCH_LIMIT },
      signal,
    });

    return unwrapData<University[]>(response.data);
  },
};
