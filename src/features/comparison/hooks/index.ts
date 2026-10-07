import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError, HTTP_STATUS_CODES } from '@core';
import { useToast } from '@hooks';
import { useAuth } from '@features/auth';
import { comparisonService } from '../services';
import { MAX_COMPARISON_ITEMS, useComparisonStore } from '../store';
import type { AddComparisonResult, ComparisonItem, ComparisonList } from '../types';

export const COMPARISON_QUERY_KEY = ['comparison'] as const;

const COMPARISON_STALE_TIME_MS = 15_000;
const LIMIT_MESSAGE_FRAGMENT = 'tối đa';
const NO_ITEMS: ComparisonItem[] = [];

export const useIsServerComparison = () => {
  const { isAuthenticated, role } = useAuth();

  return isAuthenticated && role === 'student';
};

export const useComparison = () => {
  const isServerMode = useIsServerComparison();
  const localItems = useComparisonStore((state) => state.items);
  const query = useQuery({
    queryKey: COMPARISON_QUERY_KEY,
    queryFn: () => comparisonService.list(),
    enabled: isServerMode,
    staleTime: COMPARISON_STALE_TIME_MS,
  });
  const items = isServerMode ? (query.data?.items ?? NO_ITEMS) : localItems;
  const contains = useCallback(
    (listingId: string) => items.some((item) => item.id === listingId),
    [items]
  );

  return {
    items,
    count: items.length,
    isFull: items.length >= MAX_COMPARISON_ITEMS,
    isLoading: isServerMode && query.isLoading,
    isServerMode,
    contains,
    refetch: query.refetch,
  };
};

const useOptimisticListUpdate = () => {
  const queryClient = useQueryClient();

  const apply = async (update: (list: ComparisonList) => ComparisonList) => {
    await queryClient.cancelQueries({ queryKey: COMPARISON_QUERY_KEY });

    const previous = queryClient.getQueryData<ComparisonList>(COMPARISON_QUERY_KEY);

    if (previous) {
      queryClient.setQueryData<ComparisonList>(COMPARISON_QUERY_KEY, update(previous));
    }

    return { previous };
  };

  const rollback = (previous: ComparisonList | undefined) => {
    queryClient.setQueryData(COMPARISON_QUERY_KEY, previous);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: COMPARISON_QUERY_KEY });

  return { queryClient, apply, rollback, refresh };
};

const withItems = (list: ComparisonList, items: ComparisonItem[]): ComparisonList => ({
  ...list,
  items,
  count: items.length,
});

export const useAddComparison = () => {
  const isServerMode = useIsServerComparison();
  const localAdd = useComparisonStore((state) => state.add);
  const toast = useToast();
  const { queryClient, apply, rollback, refresh } = useOptimisticListUpdate();
  const mutation = useMutation({
    mutationFn: (item: ComparisonItem) => comparisonService.add(item.id),
    onMutate: (item) =>
      apply((list) =>
        list.items.some((existing) => existing.id === item.id)
          ? list
          : withItems(list, [
              ...list.items,
              { ...item, isAvailable: true, unavailableReason: null },
            ])
      ),
    onError: (_error, _item, context) => rollback(context?.previous),
    onSettled: () => void refresh(),
  });

  const add = async (item: ComparisonItem): Promise<AddComparisonResult> => {
    if (!isServerMode) {
      return localAdd(item);
    }

    const cached = queryClient.getQueryData<ComparisonList>(COMPARISON_QUERY_KEY);

    if (cached?.items.some((existing) => existing.id === item.id)) {
      return 'duplicate';
    }

    if ((cached?.items.length ?? 0) >= MAX_COMPARISON_ITEMS) {
      return 'limit-reached';
    }

    try {
      const response = await mutation.mutateAsync(item);

      return response.added ? 'added' : 'duplicate';
    } catch (error) {
      if (error instanceof AppError && error.statusCode === HTTP_STATUS_CODES.CONFLICT) {
        return error.message.includes(LIMIT_MESSAGE_FRAGMENT) ? 'limit-reached' : 'unavailable';
      }

      toast.error(error instanceof Error ? error.message : 'Không thể thêm phòng vào so sánh');

      return 'failed';
    }
  };

  return { add, isPending: mutation.isPending };
};

export const useRemoveComparison = () => {
  const isServerMode = useIsServerComparison();
  const localRemove = useComparisonStore((state) => state.remove);
  const toast = useToast();
  const { apply, rollback, refresh } = useOptimisticListUpdate();
  const mutation = useMutation({
    mutationFn: (listingId: string) => comparisonService.remove(listingId),
    onMutate: (listingId) =>
      apply((list) =>
        withItems(
          list,
          list.items.filter((item) => item.id !== listingId)
        )
      ),
    onError: (error, _listingId, context) => {
      rollback(context?.previous);
      toast.error(error instanceof Error ? error.message : 'Không thể bỏ phòng khỏi so sánh');
    },
    onSettled: () => void refresh(),
  });
  const { mutate } = mutation;

  return useCallback(
    (listingId: string) => {
      if (!isServerMode) {
        localRemove(listingId);

        return;
      }

      mutate(listingId);
    },
    [isServerMode, localRemove, mutate]
  );
};

export const useClearComparison = () => {
  const isServerMode = useIsServerComparison();
  const localClear = useComparisonStore((state) => state.clear);
  const toast = useToast();
  const { apply, rollback, refresh } = useOptimisticListUpdate();
  const mutation = useMutation({
    mutationFn: () => comparisonService.clear(),
    onMutate: () => apply((list) => withItems(list, [])),
    onError: (error, _variables, context) => {
      rollback(context?.previous);
      toast.error(error instanceof Error ? error.message : 'Không thể xoá danh sách so sánh');
    },
    onSettled: () => void refresh(),
  });
  const { mutate } = mutation;

  return useCallback(() => {
    if (!isServerMode) {
      localClear();

      return;
    }

    mutate();
  }, [isServerMode, localClear, mutate]);
};

export const useComparisonSync = () => {
  const isServerMode = useIsServerComparison();
  const queryClient = useQueryClient();
  const isMerging = useRef(false);

  useEffect(() => {
    if (!isServerMode || isMerging.current) {
      return;
    }

    const localItems = useComparisonStore.getState().items;

    if (localItems.length === 0) {
      return;
    }

    isMerging.current = true;

    const mergeLocalItems = async () => {
      for (const item of localItems) {
        try {
          await comparisonService.add(item.id);
        } catch {
          continue;
        }
      }

      useComparisonStore.getState().clear();
      await queryClient.invalidateQueries({ queryKey: COMPARISON_QUERY_KEY });
    };

    void mergeLocalItems().finally(() => {
      isMerging.current = false;
    });
  }, [isServerMode, queryClient]);
};
