export {};
export type BookingStatus =
  'pending' | 'confirmed' | 'holding' | 'expired' | 'cancelled' | 'rejected';

export interface BookingResource {
  id: string;
  ownerId?: string;
  title: string;
  price: number;
  address: string;
  imageUrl?: string | null;
  deposit?: number | null;
}

export interface BookingSlot {
  time: string;
  startTime: string;
  available: boolean;
}

export interface BookingEvent {
  id: string;
  eventType: string;
  actor: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BookingStudent {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
}

export interface Booking {
  id: string;
  code: string;
  phone: string;
  note: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  expiresAt: string | null;
  cancelReason: string | null;
  depositAmount: number | null;
  confirmedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  student: BookingStudent | null;
  listing: BookingResource;
  events: BookingEvent[];
}

export interface BookingListResponse {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBookingPayload {
  listingId: string;
  startTime: string;
  phone: string;
  note?: string;
}
