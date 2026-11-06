import type { ListingDetail } from '@features/listings';
import type { InterestedPriceMarker, PriceComparisonItem, PriceComparisonRoomType } from '../types';

export const MINIMUM_PRICE_SAMPLE_COUNT = 5;

export const formatMonthlyPrice = (price: number): string => {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  }

  return `${Math.round(price / 1_000).toLocaleString('vi-VN')} nghìn`;
};

export const formatPriceDataPeriod = (from: string, to: string): string => {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`;
};

export const getInterestedPriceMarkers = (
  listings: ListingDetail[],
  wardCode: string,
  roomType: PriceComparisonRoomType
): InterestedPriceMarker[] =>
  listings.flatMap((listing) =>
    listing.status === 'active' &&
    listing.address.wardCode === wardCode &&
    listing.roomType === roomType
      ? [{ id: listing.id, title: listing.title, price: listing.price }]
      : []
  );

export const hasSufficientPriceData = (item: PriceComparisonItem): boolean =>
  item.sampleCount >= MINIMUM_PRICE_SAMPLE_COUNT &&
  item.avgPrice !== null &&
  item.popularPriceMin !== null &&
  item.popularPriceMax !== null;
