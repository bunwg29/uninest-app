import type { SearchFilters } from '../types/index.ts';

const MAX_RADIUS_KM = 50;

export const buildSearchParams = (filters: SearchFilters) => {
  const params: Record<string, string | number> = {
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
  };
  const keyword = filters.keyword.trim();

  if (keyword) params.keyword = keyword;

  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;

  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;

  if (filters.minArea !== undefined) params.minArea = filters.minArea;

  if (filters.maxArea !== undefined) params.maxArea = filters.maxArea;

  if (filters.roomTypes.length > 0) params.roomTypes = filters.roomTypes.join(',');

  if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');

  if (filters.ownerId) params.ownerId = filters.ownerId;

  if (filters.latitude !== undefined && filters.longitude !== undefined) {
    params.latitude = filters.latitude;
    params.longitude = filters.longitude;
    params.radius = filters.radius ?? MAX_RADIUS_KM;
  }

  return params;
};
