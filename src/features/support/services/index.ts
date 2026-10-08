import { apiClient, unwrapApiData } from '@core';

interface HealthStatus {
  status: 'ok' | 'degraded';
}

export const supportService = {
  async isServerHealthy(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');

      return unwrapApiData<HealthStatus>(response.data).status === 'ok';
    } catch {
      return false;
    }
  },
};
