import { create } from 'zustand';
import type { AddComparisonResult, ComparisonItem } from '../types';

export const MAX_COMPARISON_ITEMS = 5;

interface ComparisonState {
  items: ComparisonItem[];
  add: (item: ComparisonItem) => AddComparisonResult;
  remove: (listingId: string) => void;
  clear: () => void;
  contains: (listingId: string) => boolean;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  items: [],

  add: (item) => {
    const { items } = get();

    if (items.some((existingItem) => existingItem.id === item.id)) {
      return 'duplicate';
    }

    if (items.length >= MAX_COMPARISON_ITEMS) {
      return 'limit-reached';
    }

    set({ items: [...items, item] });

    return 'added';
  },

  remove: (listingId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== listingId),
    })),

  clear: () => set({ items: [] }),

  contains: (listingId) => get().items.some((item) => item.id === listingId),
}));
