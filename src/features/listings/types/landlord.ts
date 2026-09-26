import type { ViewingSchedule } from './index';

export type LandlordListingStatus = 'published' | 'pending' | 'rejected' | 'hidden' | 'expired';

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
}

export interface LandlordListingsPage {
  items: LandlordListing[];
  totalCount: number;
  counters: LandlordListingCounters;
  page: number;
  totalPages: number;
}
