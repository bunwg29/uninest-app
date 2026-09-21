import { useState, useCallback } from 'react';
import { listingService } from '../services/listingService';
import type { LocalImageItem, UploadedImageItem } from '../types';
import { SUPPORTED_IMAGE_TYPES } from '../types/constants';

export interface UploadImageError {
  index: number;
  message: string;
}

export interface UseUploadImagesResult {
  uploadAll: (images: LocalImageItem[]) => Promise<UploadedImageItem[]>;
  isUploading: boolean;
  uploadProgress: number;
  errors: UploadImageError[];
}

const resolveContentType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'png') return 'image/png';

  if (ext === 'webp') return 'image/webp';

  if (ext === 'gif') return 'image/gif';

  if (ext === 'heic') return 'image/heic';

  return 'image/jpeg';
};

export const useUploadImages = (): UseUploadImagesResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<UploadImageError[]>([]);

  const uploadAll = useCallback(async (images: LocalImageItem[]): Promise<UploadedImageItem[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);

    const uploaded: UploadedImageItem[] = [];
    const uploadErrors: UploadImageError[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const contentType = SUPPORTED_IMAGE_TYPES.includes(
        image.contentType as (typeof SUPPORTED_IMAGE_TYPES)[number]
      )
        ? image.contentType
        : resolveContentType(image.fileName);

      try {
        const { uploadUrl, publicUrl } = await listingService.getPresignedUploadUrl({
          fileName: image.fileName,
          contentType,
          folder: 'listings',
        });

        await listingService.uploadImageToR2(uploadUrl, image.uri, contentType);

        uploaded.push({
          publicUrl,
          key: publicUrl,
          isCover: image.isCover,
          sortOrder: image.sortOrder,
        });
      } catch {
        uploadErrors.push({
          index: i,
          message: `Không thể tải ảnh ${i + 1} lên. Vui lòng thử lại.`,
        });
      }

      setUploadProgress(Math.round(((i + 1) / images.length) * 100));
    }

    setErrors(uploadErrors);
    setIsUploading(false);

    return uploaded;
  }, []);

  return { uploadAll, isUploading, uploadProgress, errors };
};
