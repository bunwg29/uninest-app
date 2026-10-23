export {};
import { apiClient, unwrapApiData } from '@core';
import type {
  Booking,
  BookingListResponse,
  BookingSlot,
  BookingStatus,
  CreateBookingPayload,
} from '../types';

export const bookingService = {
  async getSlots(listingId: string, date: string): Promise<BookingSlot[]> {
    const response = await apiClient.get('/bookings/slots', { params: { listingId, date } });

    return unwrapApiData<BookingSlot[]>(response.data);
  },

  async create(payload: CreateBookingPayload): Promise<Booking> {
    const response = await apiClient.post('/bookings', payload);

    return unwrapApiData<Booking>(response.data);
  },

  async getOne(id: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${id}`);

    return unwrapApiData<Booking>(response.data);
  },

  async getList(status?: BookingStatus): Promise<BookingListResponse> {
    const response = await apiClient.get('/bookings', { params: { status, page: 1, limit: 50 } });

    return unwrapApiData<BookingListResponse>(response.data);
  },

  async cancel(id: string, reason?: string): Promise<Booking> {
    const response = await apiClient.delete(`/bookings/${id}`, { data: { reason } });

    return unwrapApiData<Booking>(response.data);
  },

  async getLandlordList(status?: BookingStatus): Promise<BookingListResponse> {
    const response = await apiClient.get('/bookings/landlord', {
      params: { status, page: 1, limit: 50 },
    });

    return unwrapApiData<BookingListResponse>(response.data);
  },

  async confirm(id: string): Promise<Booking> {
    const response = await apiClient.patch(`/bookings/${id}/confirm`);

    return unwrapApiData<Booking>(response.data);
  },

  async reject(id: string, reason: string): Promise<Booking> {
    const response = await apiClient.patch(`/bookings/${id}/reject`, { reason });

    return unwrapApiData<Booking>(response.data);
  },
};
