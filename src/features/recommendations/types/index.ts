import type { ListingDetail } from '@features/listings';

export const RECOMMENDATIONS_LIMIT = 10;
export const RECOMMENDATIONS_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface RecommendedListing extends ListingDetail {
  matchPercentage: number | null;
}

export interface RecommendationsResponse {
  items: RecommendedListing[];
  isFallback: boolean;
  basedOnListingCount: number;
  computedAt: string;
  nextRefreshAt: string;
}

export interface BehaviorSummary {
  viewedCount: number;
  savedCount: number;
  searchCount: number;
}

export interface SearchBehaviorPayload {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  roomTypes?: string[];
  amenities?: number[];
  universityCodes?: string[];
}
