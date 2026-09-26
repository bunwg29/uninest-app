import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from '@core';
import type {
  CreateListingPayload,
  ListingResponse,
  PresignedUploadRequest,
  PresignedUploadResponse,
} from '../types';

const unwrapData = <T>(payload: unknown): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { status?: boolean }).status !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const listingService = {
  async getPresignedUploadUrl(req: PresignedUploadRequest): Promise<PresignedUploadResponse> {
    const response = await apiClient.post('/storage/presigned-upload-url', {
      fileName: req.fileName,
      contentType: req.contentType,
      folder: req.folder ?? 'listings',
    });

    return unwrapData<PresignedUploadResponse>(response.data);
  },

  async uploadImageToR2(uploadUrl: string, fileUri: string, contentType: string): Promise<void> {
    if (Platform.OS !== 'web' && fileUri.startsWith('file://')) {
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': contentType,
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(`Tải ảnh lên thất bại với mã lỗi ${uploadResult.status}`);
      }

      return;
    }

    const fetchResponse = await fetch(fileUri);
    const blob = await fetchResponse.blob();

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });

    if (!response.ok) {
      throw new Error(`Tải ảnh lên thất bại với mã lỗi ${response.status}`);
    }
  },

  async createListing(dto: CreateListingPayload): Promise<ListingResponse> {
    const response = await apiClient.post('/listings', dto);

    return unwrapData<ListingResponse>(response.data);
  },

  async updateListing(id: string, dto: CreateListingPayload): Promise<ListingResponse> {
    const response = await apiClient.put(`/landlord/listings/${id}`, dto);

    return unwrapData<ListingResponse>(response.data);
  },
};
