import type { ListingDetail } from '@features/listings';

export type ComparisonItem = ListingDetail;

export type AddComparisonResult = 'added' | 'duplicate' | 'limit-reached';
