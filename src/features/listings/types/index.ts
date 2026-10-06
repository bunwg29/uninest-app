export interface CreateListingImagePayload {
  key: string;
  isCover?: boolean;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  roomType: string;
  price: number;
  area: number;
  maxOccupants: number;
  electricPrice?: number;
  waterPrice?: number;
  deposit?: number;
  streetAddress: string;
  provinceCode: string;
  wardCode: string;
  latitude: number;
  longitude: number;
  images?: CreateListingImagePayload[];
  amenityIds?: number[];
  viewingSchedule?: ViewingSchedule;
}

export interface ListingResponse {
  id: string;
  title: string;
  status: string;
  roomType: string;
  price: string;
  area: string;
  createdAt: string;
}

export interface ListingDetailImage {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
}

export interface ListingDetailAmenity {
  id: number;
  name: string;
  group: number;
}

export interface ListingDetailAddress {
  streetAddress: string;
  fullAddress: string;
  provinceCode: string;
  provinceName: string | null;
  wardCode: string;
  wardName: string | null;
}

export interface ListingDetailLandlord {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
}

export type ListingAvailability = 'available' | 'holding' | 'rented' | 'paused';

export interface ListingHold {
  expiresAt: string;
  daysLeft: number;
}

export interface ListingMyBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'holding';
  startTime: string;
  expiresAt: string | null;
}

export interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  roomType: string;
  price: number;
  area: number;
  maxOccupants: number;
  electricPrice: number | null;
  waterPrice: number | null;
  deposit: number | null;
  address: ListingDetailAddress;
  location: {
    latitude: number;
    longitude: number;
  };
  images: ListingDetailImage[];
  amenities: ListingDetailAmenity[];
  landlord: ListingDetailLandlord;
  status: string;
  viewingSchedule: Record<string, unknown> | null;
  averageRating: number | null;
  reviewCount?: number | null;
  isHighlighted?: boolean;
  viewCount: number | null;
  availability: ListingAvailability;
  hold: ListingHold | null;
  isFavorite: boolean;
  myBooking?: ListingMyBooking | null;
  createdAt: string;
  updatedAt: string;
  distanceMeters?: number;
}

export interface RecordListingViewResponse {
  viewCount: number | null;
  incremented: boolean;
}

export interface PresignedUploadRequest {
  fileName: string;
  contentType: string;
  fileSize?: number;
  folder?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

export interface LocalImageItem {
  uri: string;
  uploadedUrl?: string;
  uploadedKey?: string;
  isCover: boolean;
  sortOrder: number;
  fileName: string;
  contentType: string;
  fileSize?: number;
}

export interface UploadedImageItem {
  publicUrl: string;
  key: string;
  isCover: boolean;
  sortOrder: number;
}

export interface ViewingSlot {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type ViewingSchedule = Record<DayKey, ViewingSlot>;

export * from './landlord';

export interface ListingStep1State {
  title: string;
  roomType: string;
  price: string;
  area: string;
  maxOccupants: string;
  description: string;
  electricPrice: string;
  waterPrice: string;
  deposit: string;
}

export interface ListingStep3State {
  streetAddress: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  latitude: number | null;
  longitude: number | null;
}

export * from './landlord';
