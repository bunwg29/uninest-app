import type { ListingDetail } from '@features/listings';

export type ComparisonItem = ListingDetail & {
  isAvailable?: boolean;
  unavailableReason?: string | null;
  addedAt?: string;
};

export type AddComparisonResult =
  'added' | 'duplicate' | 'limit-reached' | 'unavailable' | 'failed';
