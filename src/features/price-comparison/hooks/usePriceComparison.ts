import { useQuery } from '@tanstack/react-query';
import { priceComparisonService } from '../services';
import type { PriceComparisonQuery } from '../types';

export const PRICE_COMPARISON_QUERY_KEY = ['price-comparison'] as const;

export const usePriceComparison = (query: PriceComparisonQuery, enabled: boolean) =>
  useQuery({
    queryKey: [...PRICE_COMPARISON_QUERY_KEY, query],
    queryFn: () => priceComparisonService.getPriceComparison(query),
    enabled,
    placeholderData: undefined,
  });
