import { apiClient, unwrapApiData } from '@core';
import {
  RECOMMENDATIONS_LIMIT,
  type BehaviorSummary,
  type RecommendationsResponse,
  type SearchBehaviorPayload,
} from '../types';

export const recommendationsService = {
  async list(): Promise<RecommendationsResponse> {
    const response = await apiClient.get('/recommendations', {
      params: { limit: RECOMMENDATIONS_LIMIT },
    });

    return unwrapApiData<RecommendationsResponse>(response.data);
  },

  async getBehaviorSummary(): Promise<BehaviorSummary> {
    const response = await apiClient.get('/users/me/behaviors/summary');

    return unwrapApiData<BehaviorSummary>(response.data);
  },

  async recordSearch(payload: SearchBehaviorPayload): Promise<void> {
    await apiClient.post('/users/me/behaviors/search', payload);
  },

  async deleteBehaviors(): Promise<void> {
    await apiClient.delete('/users/me/behaviors');
  },
};
