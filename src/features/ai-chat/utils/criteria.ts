import type { SearchFilters } from '@features/search';
import type { AiChatCriteria, AiCriteriaDisplay } from '../types';

export const toSearchPreset = (
  criteria: AiChatCriteria | null,
  display: AiCriteriaDisplay | null
): Partial<SearchFilters> => ({
  keyword: display?.ward?.name ?? display?.province?.name ?? '',
  minPrice: criteria?.minPrice,
  maxPrice: criteria?.maxPrice,
  minArea: criteria?.minArea,
  roomTypes: criteria?.roomTypes ?? [],
  amenities: criteria?.amenityIds ?? [],
  universities: display?.university ? [display.university] : [],
});

export const formatAiTime = (value: string): string => {
  const date = new Date(value);

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
