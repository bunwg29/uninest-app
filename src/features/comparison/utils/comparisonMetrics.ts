import { haversineMeters } from '@features/search/utils/distance';
import type { ComparisonItem } from '../types';

export interface ComparisonAmenityRow {
  id: number;
  name: string;
}

type NumericValue = number | null | undefined;

const isComparable = (value: NumericValue): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const getBestIndexes = (values: NumericValue[], mode: 'min' | 'max'): Set<number> => {
  const comparable = values.filter(isComparable);

  if (comparable.length < 2) {
    return new Set();
  }

  const best = mode === 'min' ? Math.min(...comparable) : Math.max(...comparable);

  if (comparable.every((value) => value === best)) {
    return new Set();
  }

  return new Set(values.flatMap((value, index) => (value === best ? [index] : [])));
};

export const getItemDistance = (
  item: ComparisonItem,
  reference: { latitude?: number; longitude?: number }
): number | undefined => {
  if (reference.latitude !== undefined && reference.longitude !== undefined && item.location) {
    return haversineMeters(
      { latitude: reference.latitude, longitude: reference.longitude },
      item.location
    );
  }

  return item.distanceMeters;
};

export const getAmenityRows = (items: ComparisonItem[]): ComparisonAmenityRow[] => {
  const rows = new Map<number, ComparisonAmenityRow & { count: number }>();

  items.forEach((item) => {
    item.amenities?.forEach((amenity) => {
      const current = rows.get(amenity.id);

      rows.set(amenity.id, {
        id: amenity.id,
        name: amenity.name,
        count: (current?.count ?? 0) + 1,
      });
    });
  });

  return [...rows.values()]
    .sort((first, second) => second.count - first.count || first.id - second.id)
    .map(({ id, name }) => ({ id, name }));
};

export const getDepositMonths = (deposit: NumericValue, price: NumericValue): number | null => {
  if (!isComparable(deposit) || !isComparable(price) || price <= 0 || deposit <= 0) {
    return null;
  }

  const months = deposit / price;

  return Number.isInteger(months) ? months : null;
};

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
