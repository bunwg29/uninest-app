import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { landlordListingsService } from '../services';
import type { LandlordStatsPeriod } from '../types';

export const LANDLORD_STATS_QUERY_KEY = 'landlord-stats';

export const useLandlordStats = (period: LandlordStatsPeriod) =>
  useQuery({
    queryKey: [LANDLORD_STATS_QUERY_KEY, period],
    queryFn: () => landlordListingsService.getStats(period),
    placeholderData: keepPreviousData,
  });
