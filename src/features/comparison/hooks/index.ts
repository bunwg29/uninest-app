import { useCallback } from 'react';
import { MAX_COMPARISON_ITEMS, useComparisonStore } from '../store';
import type { AddComparisonResult, ComparisonItem } from '../types';

export const useComparison = () => {
  const items = useComparisonStore((state) => state.items);
  const contains = useCallback(
    (listingId: string) => items.some((item) => item.id === listingId),
    [items]
  );

  return {
    items,
    count: items.length,
    isFull: items.length >= MAX_COMPARISON_ITEMS,
    isLoading: false,
    contains,
  };
};

export const useAddComparison = () => {
  const localAdd = useComparisonStore((state) => state.add);

  const add = async (item: ComparisonItem): Promise<AddComparisonResult> => localAdd(item);

  return { add, isPending: false };
};

export const useRemoveComparison = () => useComparisonStore((state) => state.remove);

export const useClearComparison = () => useComparisonStore((state) => state.clear);
