import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue, useToast } from '@hooks';
import { useAuth } from '@features/auth';
import { recommendationsService } from '../services/recommendationsService';
import {
  RECOMMENDATIONS_REFRESH_INTERVAL_MS,
  type RecommendationsResponse,
  type SearchBehaviorPayload,
} from '../types';

export const RECOMMENDATIONS_QUERY_KEY = ['recommendations'] as const;
export const BEHAVIOR_SUMMARY_QUERY_KEY = ['behavior-summary'] as const;

const SEARCH_BEHAVIOR_DEBOUNCE_MS = 1500;

export const useRecommendations = (enabled: boolean) => {
  const queryClient = useQueryClient();
  const userId = useAuth().user?.id;
  const queryKey = [...RECOMMENDATIONS_QUERY_KEY, userId] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => recommendationsService.list(),
    enabled: enabled && Boolean(userId),
    staleTime: RECOMMENDATIONS_REFRESH_INTERVAL_MS,
    gcTime: RECOMMENDATIONS_REFRESH_INTERVAL_MS,
  });

  useEffect(() => {
    if (!enabled || !userId) return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;

      const cached = queryClient.getQueryData<RecommendationsResponse>([
        ...RECOMMENDATIONS_QUERY_KEY,
        userId,
      ]);
      const nextRefreshAt = cached ? Date.parse(cached.nextRefreshAt) : 0;

      if (Date.now() >= nextRefreshAt) {
        void queryClient.invalidateQueries({ queryKey: [...RECOMMENDATIONS_QUERY_KEY, userId] });
      }
    });

    return () => subscription.remove();
  }, [enabled, userId, queryClient]);

  return query;
};

export const useBehaviorSummary = () =>
  useQuery({
    queryKey: BEHAVIOR_SUMMARY_QUERY_KEY,
    queryFn: () => recommendationsService.getBehaviorSummary(),
    staleTime: 0,
  });

export const useDeleteBehaviors = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => recommendationsService.deleteBehaviors(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECOMMENDATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BEHAVIOR_SUMMARY_QUERY_KEY });
      toast.success('Đã xoá lịch sử xem và tìm kiếm');
    },
    onError: (error) => toast.error(error.message),
  });
};

const hasSearchSignal = (payload: SearchBehaviorPayload): boolean =>
  Boolean(payload.keyword?.trim()) ||
  payload.minPrice !== undefined ||
  payload.maxPrice !== undefined ||
  Boolean(payload.roomTypes?.length) ||
  Boolean(payload.amenities?.length) ||
  Boolean(payload.universityCodes?.length);

export const useRecordSearchBehavior = (payload: SearchBehaviorPayload, enabled: boolean) => {
  const debouncedPayload = useDebouncedValue(payload, SEARCH_BEHAVIOR_DEBOUNCE_MS);
  const lastRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !hasSearchSignal(debouncedPayload)) return;

    const signature = JSON.stringify(debouncedPayload);

    if (signature === lastRecordedRef.current) return;

    lastRecordedRef.current = signature;
    recommendationsService.recordSearch(debouncedPayload).catch(() => {
      lastRecordedRef.current = null;
    });
  }, [debouncedPayload, enabled]);
};
