import { apiClient, unwrapApiData } from '@core';
import type { PriceComparisonQuery, PriceComparisonResponse } from '../types';

export const priceComparisonService = {
  async getPriceComparison(query: PriceComparisonQuery): Promise<PriceComparisonResponse> {
    const response = await apiClient.get('/price-comparison', { params: query });

    return unwrapApiData<PriceComparisonResponse>(response.data);
  },
};
