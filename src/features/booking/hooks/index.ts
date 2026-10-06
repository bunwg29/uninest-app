export {};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services';
import type { BookingStatus, CreateBookingPayload } from '../types';

const BOOKING_KEYS = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', id] as const,
  slots: (listingId: string, date: string) => ['bookings', 'slots', listingId, date] as const,
};

export const useBookingSlots = (listingId: string | undefined, date: string | null) =>
  useQuery({
    queryKey: BOOKING_KEYS.slots(listingId ?? '', date ?? ''),
    queryFn: () => bookingService.getSlots(listingId as string, date as string),
    enabled: Boolean(listingId && date),
  });

export const useBookingDetail = (id: string) =>
  useQuery({
    queryKey: BOOKING_KEYS.detail(id),
    queryFn: () => bookingService.getOne(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      return status === 'pending' || status === 'holding' ? 30_000 : false;
    },
  });

export const useBookings = (status?: BookingStatus) =>
  useQuery({
    queryKey: [...BOOKING_KEYS.all, status ?? 'all'],
    queryFn: () => bookingService.getList(status),
    refetchInterval: 30_000,
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all }),
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingService.cancel(id, reason),
    onSuccess: (booking) => {
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
};

export const useHoldBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.hold(id),
    onSuccess: (booking) => {
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
};
