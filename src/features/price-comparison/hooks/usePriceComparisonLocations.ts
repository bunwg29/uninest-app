import { useQuery } from '@tanstack/react-query';
import { locationsService } from '@features/auth';

export const usePriceComparisonProvinces = () =>
  useQuery({
    queryKey: ['locations', 'provinces'],
    queryFn: locationsService.getProvinces,
  });

export const usePriceComparisonWards = (provinceCode?: string) =>
  useQuery({
    queryKey: ['locations', 'wards', provinceCode],
    queryFn: () => locationsService.getWardsByProvince(provinceCode ?? ''),
    enabled: Boolean(provinceCode),
  });
