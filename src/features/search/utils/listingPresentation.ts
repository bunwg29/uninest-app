import { OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { SEARCH_SCHOOLS, type SearchFilters, type SearchListingItem } from '../types';

export type SearchCardStatus = 'available' | 'holding' | 'featured' | 'rented' | 'paused';

export const getCardStatus = (listing: SearchListingItem): SearchCardStatus => {
  if (listing.availability === 'rented') return 'rented';

  if (listing.availability === 'paused') return 'paused';

  if (listing.availability === 'holding' || listing.isReserved) return 'holding';

  return listing.isHighlighted ? 'featured' : 'available';
};

export const STATUS_LABELS: Record<SearchCardStatus, string> = {
  available: 'Còn trống',
  holding: 'Đang giữ chỗ',
  featured: 'Nổi bật',
  rented: 'Đã cho thuê',
  paused: 'Ngừng nhận yêu cầu',
};

const GRADIENT_BLUE = [OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT] as const;
const GRADIENT_GREY = [OVERLAY_COLORS.FIELD_BORDER, THEME_COLORS.SURFACE_MUTED] as const;
const GRADIENT_AMBER = [OVERLAY_COLORS.AMBER_GRADIENT_START, THEME_COLORS.WARNING_LIGHT] as const;

export const getPlaceholderGradient = (
  listing: Pick<SearchListingItem, 'id' | 'isHighlighted'>
) => {
  if (listing.isHighlighted) return GRADIENT_AMBER;

  const hash = Array.from(listing.id).reduce((total, char) => total + char.charCodeAt(0), 0);

  return hash % 3 === 0 ? GRADIENT_BLUE : GRADIENT_GREY;
};

export const formatMillions = (value: number) => {
  const millions = value / 1_000_000;
  const text = Number.isInteger(millions) ? String(millions) : String(Number(millions.toFixed(2)));

  return text.replace('.', ',');
};

export const formatShortPrice = (price: number) => `${formatMillions(price)}tr`;

export const formatFullPrice = (price: number) => `${price.toLocaleString('vi-VN')}đ`;

export const formatListingDistance = (distanceMeters?: number | null) => {
  if (distanceMeters === undefined || distanceMeters === null) return null;

  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`
    : `${Math.round(distanceMeters)} m`;
};

export const formatListingSpecs = (
  listing: SearchListingItem,
  includeAddress: boolean,
  distanceSuffix = 'tới trường'
) =>
  [
    listing.area ? `${listing.area} m²` : null,
    includeAddress ? listing.address : null,
    listing.distanceMeters !== undefined && listing.distanceMeters !== null
      ? `${formatListingDistance(listing.distanceMeters)} ${distanceSuffix}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

export const getPriceRangeSummary = (minPrice?: number, maxPrice?: number) => {
  if (minPrice !== undefined && maxPrice !== undefined) {
    return `${formatMillions(minPrice)}–${formatMillions(maxPrice)} triệu`;
  }

  if (minPrice !== undefined) return `từ ${formatMillions(minPrice)} triệu`;

  if (maxPrice !== undefined) return `dưới ${formatMillions(maxPrice)} triệu`;

  return undefined;
};

export const getQuerySummary = (filters: SearchFilters) => {
  const school = SEARCH_SCHOOLS.find((item) => item.id === filters.schoolId);

  return [
    filters.keyword.trim() || school?.shortName,
    getPriceRangeSummary(filters.minPrice, filters.maxPrice),
  ]
    .filter(Boolean)
    .join(' · ');
};
