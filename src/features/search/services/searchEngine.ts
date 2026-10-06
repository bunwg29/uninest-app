import type { SearchFilters, SearchListingItem, SearchListingsPage } from '../types';

const EARTH_RADIUS_METERS = 6371000;

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();

const toRadians = (degree: number) => (degree * Math.PI) / 180;

const calculateDistanceMeters = (
  sourceLatitude: number,
  sourceLongitude: number,
  targetLatitude: number,
  targetLongitude: number
) => {
  const latitudeDelta = toRadians(targetLatitude - sourceLatitude);
  const longitudeDelta = toRadians(targetLongitude - sourceLongitude);
  const sourceLatitudeRadians = toRadians(sourceLatitude);
  const targetLatitudeRadians = toRadians(targetLatitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(sourceLatitudeRadians) *
      Math.cos(targetLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine)));
};

const matchesKeyword = (listing: SearchListingItem, keyword: string) => {
  const normalizedKeyword = normalizeText(keyword.trim());

  if (!normalizedKeyword) return true;

  return normalizeText(`${listing.title} ${listing.address}`).includes(normalizedKeyword);
};

const attachDistance = (listing: SearchListingItem, filters: SearchFilters): SearchListingItem => {
  if (
    filters.latitude === undefined ||
    filters.longitude === undefined ||
    listing.location === undefined
  ) {
    return listing;
  }

  return {
    ...listing,
    distanceMeters: calculateDistanceMeters(
      filters.latitude,
      filters.longitude,
      listing.location.latitude,
      listing.location.longitude
    ),
  };
};

const filterListing = (listing: SearchListingItem, filters: SearchFilters) => {
  if (listing.status !== 'active') return false;

  if (!matchesKeyword(listing, filters.keyword)) return false;

  if (filters.minPrice !== undefined && listing.price < filters.minPrice) return false;

  if (filters.maxPrice !== undefined && listing.price > filters.maxPrice) return false;

  if (filters.minArea !== undefined && listing.area < filters.minArea) return false;

  if (filters.maxArea !== undefined && listing.area > filters.maxArea) return false;

  if (filters.roomTypes.length > 0 && !filters.roomTypes.includes(listing.roomType)) return false;

  if (
    filters.amenities.length > 0 &&
    !filters.amenities.every((amenityId) => listing.amenityIds.includes(amenityId))
  ) {
    return false;
  }

  if (
    filters.latitude !== undefined &&
    filters.longitude !== undefined &&
    filters.radius !== undefined &&
    listing.distanceMeters !== null &&
    listing.distanceMeters !== undefined &&
    listing.distanceMeters > filters.radius * 1000
  ) {
    return false;
  }

  return true;
};

const sortListings = (items: SearchListingItem[], sortBy: SearchFilters['sortBy']) => {
  return [...items].sort((first, second) => {
    switch (sortBy) {
      case 'price_asc':
        return first.price - second.price;
      case 'price_desc':
        return second.price - first.price;
      case 'area_asc':
        return first.area - second.area;
      case 'area_desc':
        return second.area - first.area;
      case 'distance':
        return (
          (first.distanceMeters ?? Number.MAX_SAFE_INTEGER) -
          (second.distanceMeters ?? Number.MAX_SAFE_INTEGER)
        );
      case 'newest':
      default:
        return Date.parse(second.createdAt) - Date.parse(first.createdAt);
    }
  });
};

export const searchMockListings = (
  source: SearchListingItem[],
  filters: SearchFilters
): SearchListingsPage => {
  const filteredItems = source
    .map((listing) => attachDistance(listing, filters))
    .filter((listing) => filterListing(listing, filters));
  const sortedItems = sortListings(filteredItems, filters.sortBy);
  const page = Math.max(filters.page, 1);
  const offset = (page - 1) * filters.limit;
  const items = sortedItems.slice(offset, offset + filters.limit);
  const total = sortedItems.length;

  return {
    items,
    pagination: {
      page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};
