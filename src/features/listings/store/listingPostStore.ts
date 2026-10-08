import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  ListingStep1State,
  ListingStep3State,
  LocalImageItem,
  UploadedImageItem,
  ViewingSchedule,
  DayKey,
  LandlordListing,
} from '../types';

export const INITIAL_STEP1: ListingStep1State = {
  title: '',
  roomType: '',
  price: '',
  area: '',
  maxOccupants: '',
  description: '',
  electricPrice: '',
  waterPrice: '',
  deposit: '',
};

export const INITIAL_STEP3: ListingStep3State = {
  streetAddress: '',
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  latitude: null,
  longitude: null,
};

export const buildInitialSchedule = (): ViewingSchedule => {
  const days: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return days.reduce<ViewingSchedule>(
    (acc, day) => ({
      ...acc,
      [day]: { morning: false, afternoon: false, evening: false },
    }),
    {} as ViewingSchedule
  );
};

interface ListingPostState {
  editingListingId: string | null;
  editBaseline: string | null;
  step1: ListingStep1State;
  localImages: LocalImageItem[];
  uploadedImages: UploadedImageItem[];
  step3: ListingStep3State;
  selectedAmenityIds: number[];
  viewingSchedule: ViewingSchedule;

  setStep1: (data: Partial<ListingStep1State>) => void;
  setEditingListingId: (id: string | null) => void;
  setLocalImages: (images: LocalImageItem[]) => void;
  setUploadedImages: (images: UploadedImageItem[]) => void;
  setStep3: (data: Partial<ListingStep3State>) => void;
  setSelectedAmenityIds: (ids: number[]) => void;
  setViewingSchedule: (schedule: ViewingSchedule) => void;
  initCreate: () => void;
  initEdit: (listing: LandlordListing) => void;
  hasEditChanges: () => boolean;
  reset: () => void;
}

const INITIAL_STATE = {
  editingListingId: null as string | null,
  editBaseline: null as string | null,
  step1: INITIAL_STEP1,
  localImages: [] as LocalImageItem[],
  uploadedImages: [] as UploadedImageItem[],
  step3: INITIAL_STEP3,
  selectedAmenityIds: [] as number[],
  viewingSchedule: buildInitialSchedule(),
};

const getDraftSnapshot = ({
  step1,
  localImages,
  step3,
  selectedAmenityIds,
  viewingSchedule,
}: Pick<
  ListingPostState,
  'step1' | 'localImages' | 'step3' | 'selectedAmenityIds' | 'viewingSchedule'
>): string =>
  JSON.stringify({
    basicInfo: {
      title: step1.title.trim(),
      roomType: step1.roomType,
      price: Number(step1.price) || 0,
      area: Number(step1.area) || 0,
      maxOccupants: Number(step1.maxOccupants) || 1,
      description: step1.description.trim(),
      electricPrice: step1.electricPrice ? Number(step1.electricPrice) : null,
      waterPrice: step1.waterPrice ? Number(step1.waterPrice) : null,
      deposit: step1.deposit ? Number(step1.deposit) : null,
    },
    images: localImages.map((image) => ({
      key: image.uploadedKey ?? image.uploadedUrl ?? image.uri,
      isCover: image.isCover,
      sortOrder: image.sortOrder,
    })),
    location: {
      streetAddress: step3.streetAddress.trim(),
      provinceCode: step3.provinceCode,
      wardCode: step3.wardCode,
      latitude: step3.latitude,
      longitude: step3.longitude,
    },
    amenityIds: [...selectedAmenityIds].sort((first, second) => first - second),
    viewingSchedule,
  });

export const LISTING_POST_DRAFT_STORAGE_KEY = 'uninest-listing-post-draft';

export const useListingPostStore = create<ListingPostState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setEditingListingId: (editingListingId) => set({ editingListingId }),

      setStep1: (data) => set((state) => ({ step1: { ...state.step1, ...data } })),

      setLocalImages: (localImages) => set({ localImages }),

      setUploadedImages: (uploadedImages) => set({ uploadedImages }),

      setStep3: (data) => set((state) => ({ step3: { ...state.step3, ...data } })),

      setSelectedAmenityIds: (selectedAmenityIds) => set({ selectedAmenityIds }),

      setViewingSchedule: (viewingSchedule) => set({ viewingSchedule }),

      initCreate: () => {
        if (get().editingListingId === null) return;

        set({
          ...INITIAL_STATE,
          viewingSchedule: buildInitialSchedule(),
        });
      },

      initEdit: (listing: LandlordListing) => {
        const basicInfo: ListingStep1State = {
          title: listing.title || '',
          roomType: listing.roomType || '',
          price: listing.price ? String(listing.price) : '',
          area: listing.area ? String(listing.area) : '',
          maxOccupants: listing.maxOccupants ? String(listing.maxOccupants) : '',
          description: listing.description || '',
          electricPrice: listing.electricPrice ? String(listing.electricPrice) : '',
          waterPrice: listing.waterPrice ? String(listing.waterPrice) : '',
          deposit: listing.deposit ? String(listing.deposit) : '',
        };

        const imageUrls = listing.imageUrls?.length
          ? listing.imageUrls
          : listing.imageUrl
            ? [listing.imageUrl]
            : [];

        const localImages: LocalImageItem[] = imageUrls.map((uri, index) => ({
          uri,
          uploadedUrl: uri,
          uploadedKey: listing.imageKeys?.[index] ?? listing.imageKey,
          isCover: index === 0,
          sortOrder: index,
          fileName: `listing-${listing.id}-${index}.jpg`,
          contentType: 'image/jpeg',
        }));

        const uploadedImages: UploadedImageItem[] = imageUrls.map((publicUrl, index) => ({
          publicUrl,
          key: listing.imageKeys?.[index] ?? listing.imageKey ?? publicUrl,
          isCover: index === 0,
          sortOrder: index,
        }));

        const step3: ListingStep3State = {
          streetAddress: listing.streetAddress || '',
          provinceCode: listing.provinceCode || '',
          provinceName: listing.provinceName || '',
          wardCode: listing.wardCode || '',
          wardName: listing.wardName || '',
          latitude: listing.latitude ?? null,
          longitude: listing.longitude ?? null,
        };

        const schedule = buildInitialSchedule();
        const existingSchedule = listing.viewingSchedule;

        if (existingSchedule && typeof existingSchedule === 'object') {
          const days: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

          days.forEach((day) => {
            const daySlots = existingSchedule[day];

            if (daySlots) {
              schedule[day] = {
                morning: Boolean(daySlots.morning),
                afternoon: Boolean(daySlots.afternoon),
                evening: Boolean(daySlots.evening),
              };
            }
          });
        }

        const editBaseline = getDraftSnapshot({
          step1: basicInfo,
          localImages,
          step3,
          selectedAmenityIds: listing.amenityIds || [],
          viewingSchedule: schedule,
        });

        set({
          editingListingId: listing.id,
          editBaseline,
          step1: basicInfo,
          localImages,
          uploadedImages,
          step3,
          selectedAmenityIds: listing.amenityIds || [],
          viewingSchedule: schedule,
        });
      },

      hasEditChanges: () => {
        const state = get();

        if (!state.editBaseline) return true;

        return getDraftSnapshot(state) !== state.editBaseline;
      },

      reset: () => set({ ...INITIAL_STATE, viewingSchedule: buildInitialSchedule() }),
    }),
    {
      name: LISTING_POST_DRAFT_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) =>
        state.editingListingId
          ? {}
          : {
              step1: state.step1,
              step3: state.step3,
              selectedAmenityIds: state.selectedAmenityIds,
              viewingSchedule: state.viewingSchedule,
              localImages: state.localImages.filter((image) => Boolean(image.uploadedKey)),
              uploadedImages: state.uploadedImages,
            },
    }
  )
);
