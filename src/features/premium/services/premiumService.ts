import { apiClient, unwrapApiData } from '@core';
import type {
  PremiumOrder,
  PremiumPlan,
  PremiumPlanCode,
  PremiumStats,
  PremiumStatsPeriod,
  PremiumStatus,
} from '../types';

export const premiumService = {
  async getPlans(): Promise<PremiumPlan[]> {
    const response = await apiClient.get('/premium/plans');

    return unwrapApiData<PremiumPlan[]>(response.data);
  },

  async getStatus(): Promise<PremiumStatus> {
    const response = await apiClient.get('/premium/me');

    return unwrapApiData<PremiumStatus>(response.data);
  },

  async getStats(period: PremiumStatsPeriod): Promise<PremiumStats> {
    const response = await apiClient.get('/premium/stats', { params: { period } });

    return unwrapApiData<PremiumStats>(response.data);
  },

  async createOrder(planCode: PremiumPlanCode): Promise<PremiumOrder> {
    const response = await apiClient.post('/payment/premium/orders', { planCode });

    return unwrapApiData<PremiumOrder>(response.data);
  },

  async getOrder(id: string): Promise<PremiumOrder> {
    const response = await apiClient.get(`/payment/premium/orders/${id}`);

    return unwrapApiData<PremiumOrder>(response.data);
  },
};
