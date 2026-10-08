export type SearchSortBy =
  'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'distance';

export type SearchViewMode = 'list' | 'grid' | 'map';

export type ListingAvailability = 'available' | 'holding' | 'rented' | 'paused';

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
  schoolId?: string;
  ownerId?: string;
  sortBy: SearchSortBy;
  page: number;
  limit: number;
}

export interface SearchListingLocation {
  latitude: number;
  longitude: number;
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
  availability: ListingAvailability;
  holdExpiresAt?: string | null;
  createdAt: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchSuggestion {
  type: 'expand_radius' | 'relax_filters';
  radiusKm?: number;
  message: string;
}

export interface SearchListingsPage {
  items: SearchListingItem[];
  pagination: SearchPagination;
  hasResults: boolean;
  suggestion?: SearchSuggestion;
}

export interface SearchRepository {
  search(filters: SearchFilters, signal?: AbortSignal): Promise<SearchListingsPage>;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  keyword: '',
  roomTypes: [],
  amenities: [],
  radius: 5,
  sortBy: 'relevance',
  page: 1,
  limit: 10,
};

export const SEARCH_SORT_OPTIONS: ReadonlyArray<{
  label: string;
  compactLabel: string;
  value: SearchSortBy;
}> = [
  { label: 'Phù hợp nhất', compactLabel: 'Phù hợp', value: 'relevance' },
  { label: 'Gần trường nhất', compactLabel: 'Gần nhất', value: 'distance' },
  { label: 'Giá thấp đến cao', compactLabel: 'Giá thấp', value: 'price_asc' },
  { label: 'Giá cao đến thấp', compactLabel: 'Giá cao', value: 'price_desc' },
  { label: 'Mới đăng nhất', compactLabel: 'Mới nhất', value: 'newest' },
  { label: 'Diện tích tăng dần', compactLabel: 'Diện tích tăng', value: 'area_asc' },
  { label: 'Diện tích giảm dần', compactLabel: 'Diện tích giảm', value: 'area_desc' },
];

export interface SearchSchool {
  id: string;
  name: string;
  shortName: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export const SEARCH_SCHOOLS: readonly SearchSchool[] = [
  {
    id: 'dut',
    name: 'ĐH Bách khoa Đà Nẵng',
    shortName: 'BKĐN',
    address: '54 Nguyễn Lương Bằng, Liên Chiểu',
    latitude: 16.0739,
    longitude: 108.1499,
  },
  {
    id: 'ued',
    name: 'ĐH Sư phạm Đà Nẵng',
    shortName: 'ĐHSP',
    address: '459 Tôn Đức Thắng, Liên Chiểu',
    latitude: 16.0617,
    longitude: 108.1585,
  },
  {
    id: 'vku',
    name: 'ĐH CNTT & TT Việt - Hàn (VKU)',
    shortName: 'VKU',
    address: '470 Trần Đại Nghĩa, Ngũ Hành Sơn',
    latitude: 15.9757,
    longitude: 108.2531,
  },
  {
    id: 'due',
    name: 'ĐH Kinh tế Đà Nẵng',
    shortName: 'ĐH Kinh tế',
    address: '71 Ngũ Hành Sơn, Ngũ Hành Sơn',
    latitude: 16.0481,
    longitude: 108.2402,
  },
];
