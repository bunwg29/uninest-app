import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const RECENTLY_VIEWED_STORAGE_KEY = 'uninest-recently-viewed';
export const RECENTLY_VIEWED_LIMIT = 20;

interface RecentlyViewedState {
  listingIds: string[];
  hasHydrated: boolean;
  recordView: (listingId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      listingIds: [],
      hasHydrated: false,

      recordView(listingId) {
        set((state) => ({
          listingIds: [listingId, ...state.listingIds.filter((id) => id !== listingId)].slice(
            0,
            RECENTLY_VIEWED_LIMIT
          ),
        }));
      },
    }),
    {
      name: RECENTLY_VIEWED_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ listingIds: state.listingIds }),
      onRehydrateStorage: () => () => {
        useRecentlyViewedStore.setState({ hasHydrated: true });
      },
    }
  )
);
