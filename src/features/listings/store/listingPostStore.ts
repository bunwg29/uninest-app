import { create } from 'zustand';
import type {
  ListingStep1State,
  ListingStep3State,
  LocalImageItem,
  UploadedImageItem,
  ViewingSchedule,
  DayKey,
} from '../types';

const INITIAL_STEP1: ListingStep1State = {
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

const INITIAL_STEP3: ListingStep3State = {
  streetAddress: '',
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  latitude: null,
  longitude: null,
};

const buildInitialSchedule = (): ViewingSchedule => {
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
  step1: ListingStep1State;
  localImages: LocalImageItem[];
  uploadedImages: UploadedImageItem[];
  step3: ListingStep3State;
  viewingSchedule: ViewingSchedule;

  setStep1: (data: Partial<ListingStep1State>) => void;
  setLocalImages: (images: LocalImageItem[]) => void;
  setUploadedImages: (images: UploadedImageItem[]) => void;
  setStep3: (data: Partial<ListingStep3State>) => void;
  setViewingSchedule: (schedule: ViewingSchedule) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  step1: INITIAL_STEP1,
  localImages: [] as LocalImageItem[],
  uploadedImages: [] as UploadedImageItem[],
  step3: INITIAL_STEP3,
  viewingSchedule: buildInitialSchedule(),
};

export const useListingPostStore = create<ListingPostState>((set) => ({
  ...INITIAL_STATE,

  setStep1: (data) => set((state) => ({ step1: { ...state.step1, ...data } })),

  setLocalImages: (localImages) => set({ localImages }),

  setUploadedImages: (uploadedImages) => set({ uploadedImages }),

  setStep3: (data) => set((state) => ({ step3: { ...state.step3, ...data } })),

  setViewingSchedule: (viewingSchedule) => set({ viewingSchedule }),

  reset: () => set({ ...INITIAL_STATE, viewingSchedule: buildInitialSchedule() }),
}));
