import type { ViewingSchedule } from './index';

export type LandlordListingStatus =
  'published' | 'pending' | 'rejected' | 'hidden' | 'expired' | 'paused';

export interface LandlordListing {
  id: string;
  title: string;
  price: number;
  area: number;
  address?: string;
  imageUrl?: string;
  imageKey?: string;
  status: LandlordListingStatus;
  isFeatured: boolean;
  viewCount: number;
  contactCount: number;
  saveCount: number;
  bookingCount?: number;
  holdingStatus: boolean;
  holderName?: string;
  holdExpireDate?: string;
  depositAmount?: number;
  rejectionReason?: string;
  roomType?: string;
  maxOccupants?: number;
  description?: string;
  electricPrice?: number;
  waterPrice?: number;
  videoKey?: string;
  videoUrl?: string;
  universities?: { code: string; name: string }[];
  deposit?: number;
  streetAddress?: string;
  provinceCode?: string;
  provinceName?: string;
  wardCode?: string;
  wardName?: string;
  latitude?: number;
  longitude?: number;
  imageUrls?: string[];
  imageKeys?: string[];
  amenityIds?: number[];
  viewingSchedule?: ViewingSchedule;
}

export interface LandlordListingCounters {
  published: number;
  pending: number;
  rejected: number;
  hidden: number;
  expired: number;
  paused: number;
}

export interface LandlordListingsPage {
  items: LandlordListing[];
  totalCount: number;
  counters: LandlordListingCounters;
  page: number;
  totalPages: number;
}

export type LandlordStatsPeriod = '7d' | '30d' | '90d' | 'all';

export interface LandlordStats {
  period: LandlordStatsPeriod;
  since: string | null;
  views: number;
  contacts: number;
  conversations: number;
  bookings: number;
  pendingBookings: number;
}

export const LANDLORD_STATS_PERIOD_OPTIONS: ReadonlyArray<{
  value: LandlordStatsPeriod;
  label: string;
  title: string;
}> = [
  { value: '7d', label: '7 ngày', title: '7 ngày qua' },
  { value: '30d', label: '30 ngày', title: '30 ngày qua' },
  { value: '90d', label: '90 ngày', title: '90 ngày qua' },
  { value: 'all', label: 'Tất cả', title: 'Từ trước đến nay' },
];

export interface LandlordPublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  joinedAt: string;
  bio: string | null;
  universities: { code: string; name: string }[];
  activeListingCount: number;
  phone: string | null;
  averageRating: number | null;
  reviewCount: number;
  responseMinutes: number | null;
}
