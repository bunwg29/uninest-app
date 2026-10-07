import { apiClient } from '@core';
import type { AddComparisonResponse, ComparisonList } from '../types';

const unwrapData = <T>(payload: unknown): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { status?: boolean }).status !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const comparisonService = {
  async list(): Promise<ComparisonList> {
    const response = await apiClient.get('/comparison');

    return unwrapData<ComparisonList>(response.data);
  },

  async add(listingId: string): Promise<AddComparisonResponse> {
    const response = await apiClient.post('/comparison', { listingId });

    return unwrapData<AddComparisonResponse>(response.data);
  },

  async remove(listingId: string): Promise<void> {
    await apiClient.delete(`/comparison/${listingId}`);
  },

  async clear(): Promise<void> {
    await apiClient.delete('/comparison');
  },
};
