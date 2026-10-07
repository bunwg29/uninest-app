import type { ListingDetail } from '@features/listings';

export type ComparisonItem = ListingDetail & {
  isAvailable?: boolean;
  unavailableReason?: string | null;
  addedAt?: string;
};

export interface ComparisonList {
  items: ComparisonItem[];
  count: number;
  maxItems: number;
}

export interface AddComparisonResponse {
  listingId: string;
  added: boolean;
  count: number;
  maxItems: number;
}

export type AddComparisonResult =
  'added' | 'duplicate' | 'limit-reached' | 'unavailable' | 'failed';
