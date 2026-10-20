import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuth } from '@features/auth';

export const RECENTLY_VIEWED_STORAGE_KEY = 'uninest-recently-viewed';
export const RECENTLY_VIEWED_LIMIT = 20;

const NO_LISTING_IDS: string[] = [];

interface RecentlyViewedState {
  listingIdsByUser: Record<string, string[]>;
  hasHydrated: boolean;
  recordView: (userId: string, listingId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      listingIdsByUser: {},
      hasHydrated: false,

      recordView(userId, listingId) {
        set((state) => {
          const current = state.listingIdsByUser[userId] ?? [];

          return {
            listingIdsByUser: {
              ...state.listingIdsByUser,
              [userId]: [listingId, ...current.filter((id) => id !== listingId)].slice(
                0,
                RECENTLY_VIEWED_LIMIT
              ),
            },
          };
        });
      },
    }),
    {
      name: RECENTLY_VIEWED_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ listingIdsByUser: state.listingIdsByUser }),
      migrate: () => ({ listingIdsByUser: {} }),
      onRehydrateStorage: () => () => {
        useRecentlyViewedStore.setState({ hasHydrated: true });
      },
    }
  )
);

export const useRecentListingIds = (): string[] => {
  const userId = useAuth().user?.id;

  return useRecentlyViewedStore((state) =>
    userId ? (state.listingIdsByUser[userId] ?? NO_LISTING_IDS) : NO_LISTING_IDS
  );
};
