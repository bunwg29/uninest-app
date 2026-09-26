export interface CreateListingImagePayload {
  url: string;
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

export interface PresignedUploadRequest {
  fileName: string;
  contentType: string;
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
  isCover: boolean;
  sortOrder: number;
  fileName: string;
  contentType: string;
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
