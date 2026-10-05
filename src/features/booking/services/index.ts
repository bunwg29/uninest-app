export {};
import { apiClient } from '@core';
import type {
  Booking,
  BookingListResponse,
  BookingSlot,
  BookingStatus,
  CreateBookingPayload,
} from '../types';

const unwrapData = <T>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const bookingService = {
  async getSlots(listingId: string, date: string): Promise<BookingSlot[]> {
    const response = await apiClient.get('/bookings/slots', { params: { listingId, date } });

    return unwrapData<BookingSlot[]>(response.data);
  },

  async create(payload: CreateBookingPayload): Promise<Booking> {
    const response = await apiClient.post('/bookings', payload);

    return unwrapData<Booking>(response.data);
  },

  async getOne(id: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${id}`);

    return unwrapData<Booking>(response.data);
  },

  async getList(status?: BookingStatus): Promise<BookingListResponse> {
    const response = await apiClient.get('/bookings', { params: { status, page: 1, limit: 50 } });

    return unwrapData<BookingListResponse>(response.data);
  },

  async cancel(id: string, reason?: string): Promise<Booking> {
    const response = await apiClient.delete(`/bookings/${id}`, { data: { reason } });

    return unwrapData<Booking>(response.data);
  },

  async hold(id: string): Promise<Booking> {
    const response = await apiClient.patch(`/bookings/${id}/hold`);

    return unwrapData<Booking>(response.data);
  },
};
