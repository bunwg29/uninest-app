export type SearchSortBy =
  'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'distance';

export type SearchViewMode = 'list' | 'map';

export type PublicListingStatus = 'active' | 'pending' | 'rejected' | 'hidden' | 'deleted';

export interface SearchFilters {
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomTypes: string[];
  amenities: number[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy: SearchSortBy;
  page: number;
  limit: number;
}

export interface SearchListingLocation {
  latitude: number;
  longitude: number;
}

export interface SearchListingStats {
  views?: number;
  saved?: number;
}

export interface SearchListingItem {
  id: string;
  title: string;
  thumbnail: string | null;
  imageUrls?: string[];
  price: number;
  area: number;
  address: string;
  roomType: string;
  amenityIds: number[];
  location?: SearchListingLocation;
  distanceMeters?: number | null;
  isHighlighted: boolean;
  isReserved: boolean;
  rating?: number;
  reviewCount?: number;
  capacity?: number;
  description?: string;
  status: PublicListingStatus;
  stats?: SearchListingStats;
  createdAt: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchListingsPage {
  items: SearchListingItem[];
  pagination: SearchPagination;
}

export interface SearchRepository {
  search(filters: SearchFilters, signal?: AbortSignal): Promise<SearchListingsPage>;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  keyword: '',
  roomTypes: [],
  amenities: [],
  radius: 5,
  sortBy: 'newest',
  page: 1,
  limit: 10,
};

export const SEARCH_SORT_OPTIONS: ReadonlyArray<{
  label: string;
  compactLabel: string;
  value: SearchSortBy;
}> = [
  { label: 'Mới nhất', compactLabel: 'Mới nhất', value: 'newest' },
  { label: 'Giá thấp đến cao', compactLabel: 'Giá tăng', value: 'price_asc' },
  { label: 'Giá cao đến thấp', compactLabel: 'Giá giảm', value: 'price_desc' },
  { label: 'Diện tích tăng dần', compactLabel: 'Diện tích tăng', value: 'area_asc' },
  { label: 'Diện tích giảm dần', compactLabel: 'Diện tích giảm', value: 'area_desc' },
  { label: 'Gần nhất', compactLabel: 'Gần nhất', value: 'distance' },
];
