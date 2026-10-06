export {};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services';
import type { Booking, BookingStatus, CreateBookingPayload } from '../types';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['listing-detail'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['listing-detail', booking.listing.id] });
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
      queryClient.invalidateQueries({ queryKey: ['listing-detail', booking.listing.id] });
    },
  });
};

export const useLandlordBookings = () =>
  useQuery({
    queryKey: [...BOOKING_KEYS.all, 'landlord'],
    queryFn: () => bookingService.getLandlordList(),
    refetchInterval: 15_000,
  });

const useLandlordAction = <TVariables>(action: (variables: TVariables) => Promise<Booking>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: (booking) => {
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['listing-detail', booking.listing.id] });
    },
  });
};

export const useConfirmBooking = () =>
  useLandlordAction((id: string) => bookingService.confirm(id));

export const useRejectBooking = () =>
  useLandlordAction(({ id, reason }: { id: string; reason: string }) =>
    bookingService.reject(id, reason)
  );

export const useReleaseBooking = () =>
  useLandlordAction(({ id, reason }: { id: string; reason: string }) =>
    bookingService.release(id, reason)
  );
