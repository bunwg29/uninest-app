import { registerStoreResetter } from '@core';
import { create } from 'zustand';
import {
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
  type SearchSortBy,
  type SearchViewMode,
} from '../types';

interface SearchState {
  appliedFilters: SearchFilters;
  draftFilters: SearchFilters;
  viewMode: SearchViewMode;
  selectedListingId: string | null;
  isFilterVisible: boolean;
  isSortVisible: boolean;
  setKeyword: (keyword: string) => void;
  openFilters: () => void;
  closeFilters: () => void;
  updateDraftFilters: (filters: Partial<SearchFilters>) => void;
  resetDraftFilters: () => void;
  applyDraftFilters: () => void;
  clearAppliedFilters: () => void;
  openSort: () => void;
  closeSort: () => void;
  setSortBy: (sortBy: SearchSortBy) => void;
  setViewMode: (viewMode: SearchViewMode) => void;
  setSelectedListingId: (listingId: string | null) => void;
  setLocation: (latitude: number, longitude: number) => void;
  setRadius: (radius: number) => void;
  applyPreset: (filters: Partial<SearchFilters>) => void;
}

const createDefaultFilters = (): SearchFilters => ({
  ...DEFAULT_SEARCH_FILTERS,
  roomTypes: [],
  amenities: [],
});

export const useSearchStore = create<SearchState>((set) => ({
  appliedFilters: createDefaultFilters(),
  draftFilters: createDefaultFilters(),
  viewMode: 'list',
  selectedListingId: null,
  isFilterVisible: false,
  isSortVisible: false,
  setKeyword: (keyword) =>
    set((state) => ({
      appliedFilters: { ...state.appliedFilters, keyword, page: 1 },
      selectedListingId: null,
    })),
  openFilters: () =>
    set((state) => ({
      draftFilters: {
        ...state.appliedFilters,
        roomTypes: [...state.appliedFilters.roomTypes],
        amenities: [...state.appliedFilters.amenities],
      },
      isFilterVisible: true,
    })),
  closeFilters: () => set({ isFilterVisible: false }),
  updateDraftFilters: (filters) =>
    set((state) => ({ draftFilters: { ...state.draftFilters, ...filters, page: 1 } })),
  resetDraftFilters: () =>
    set((state) => ({
      draftFilters: { ...createDefaultFilters(), keyword: state.appliedFilters.keyword },
    })),
  applyDraftFilters: () =>
    set((state) => {
      const hasReference =
        state.draftFilters.latitude !== undefined && state.draftFilters.longitude !== undefined;

      return {
        appliedFilters: {
          ...state.draftFilters,
          sortBy:
            state.draftFilters.sortBy === 'distance' && !hasReference
              ? 'relevance'
              : state.draftFilters.sortBy,
          roomTypes: [...state.draftFilters.roomTypes],
          amenities: [...state.draftFilters.amenities],
          page: 1,
        },
        isFilterVisible: false,
        selectedListingId: null,
      };
    }),
  clearAppliedFilters: () =>
    set((state) => ({
      appliedFilters: {
        ...createDefaultFilters(),
        keyword: state.appliedFilters.keyword,
        latitude: state.appliedFilters.latitude,
        longitude: state.appliedFilters.longitude,
      },
      selectedListingId: null,
    })),
  openSort: () => set({ isSortVisible: true }),
  closeSort: () => set({ isSortVisible: false }),
  setSortBy: (sortBy) =>
    set((state) => ({
      appliedFilters: { ...state.appliedFilters, sortBy, page: 1 },
      isSortVisible: false,
    })),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedListingId: (selectedListingId) => set({ selectedListingId }),
  setLocation: (latitude, longitude) =>
    set((state) => ({
      appliedFilters: {
        ...state.appliedFilters,
        latitude,
        longitude,
        schoolId: undefined,
        page: 1,
      },
    })),
  setRadius: (radius) =>
    set((state) => ({
      appliedFilters: { ...state.appliedFilters, radius, page: 1 },
    })),
  applyPreset: (filters) =>
    set(() => {
      const next = { ...createDefaultFilters(), ...filters, page: 1 };

      return { appliedFilters: next, draftFilters: next, selectedListingId: null };
    }),
}));

registerStoreResetter(() =>
  useSearchStore.setState({
    appliedFilters: createDefaultFilters(),
    draftFilters: createDefaultFilters(),
    viewMode: 'list',
    selectedListingId: null,
    isFilterVisible: false,
    isSortVisible: false,
  })
);
