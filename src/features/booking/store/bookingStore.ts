import { create } from 'zustand';
import type { BookingResource, BookingSlot } from '../types';

interface BookingFlowState {
  resource: BookingResource | null;
  selectedDate: string | null;
  selectedSlot: BookingSlot | null;
  startBooking: (resource: BookingResource, selectedDate: string) => void;
  setResource: (resource: BookingResource) => void;
  selectDate: (date: string) => void;
  selectSlot: (slot: BookingSlot | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingFlowState>((set) => ({
  resource: null,
  selectedDate: null,
  selectedSlot: null,
  startBooking: (resource, selectedDate) => set({ resource, selectedDate, selectedSlot: null }),
  setResource: (resource) => set({ resource }),
  selectDate: (selectedDate) => set({ selectedDate, selectedSlot: null }),
  selectSlot: (selectedSlot) => set({ selectedSlot }),
  reset: () => set({ resource: null, selectedDate: null, selectedSlot: null }),
}));
