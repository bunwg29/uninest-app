import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { premiumService } from '../services';
import type { PremiumPlanCode, PremiumStatsPeriod } from '../types';

export const PREMIUM_STATUS_QUERY_KEY = ['premium', 'status'] as const;
export const PREMIUM_PLANS_QUERY_KEY = ['premium', 'plans'] as const;
export const PREMIUM_STATS_QUERY_KEY = ['premium', 'stats'] as const;
export const PREMIUM_ORDER_QUERY_KEY = ['premium', 'order'] as const;

const ORDER_POLL_INTERVAL_MS = 3000;

export const usePremiumStatus = () =>
  useQuery({
    queryKey: PREMIUM_STATUS_QUERY_KEY,
    queryFn: () => premiumService.getStatus(),
  });

export const usePremiumPlans = () =>
  useQuery({
    queryKey: PREMIUM_PLANS_QUERY_KEY,
    queryFn: () => premiumService.getPlans(),
    staleTime: Infinity,
  });

export const usePremiumStats = (period: PremiumStatsPeriod, enabled: boolean) =>
  useQuery({
    queryKey: [...PREMIUM_STATS_QUERY_KEY, period],
    queryFn: () => premiumService.getStats(period),
    enabled,
  });

export const useCreatePremiumOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planCode: PremiumPlanCode) => premiumService.createOrder(planCode),
    onSuccess: (order) => {
      queryClient.setQueryData([...PREMIUM_ORDER_QUERY_KEY, order.id], order);
    },
  });
};

export const usePremiumOrder = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...PREMIUM_ORDER_QUERY_KEY, id],
    queryFn: async () => {
      const order = await premiumService.getOrder(id);

      if (order.status === 'paid') {
        await queryClient.invalidateQueries({ queryKey: PREMIUM_STATUS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: PREMIUM_STATS_QUERY_KEY });
      }

      return order;
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? ORDER_POLL_INTERVAL_MS : false,
  });
};
