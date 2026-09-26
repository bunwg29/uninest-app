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

    const uploadErrors: UploadImageError[] = [];
    let completedCount = 0;

    const uploadResults = await Promise.all(
      images.map(async (image, index): Promise<UploadedImageItem | null> => {
        const contentType = SUPPORTED_IMAGE_TYPES.includes(
          image.contentType as (typeof SUPPORTED_IMAGE_TYPES)[number]
        )
          ? image.contentType
          : resolveContentType(image.fileName);

        try {
          const { uploadUrl, publicUrl, key } = await listingService.getPresignedUploadUrl({
            fileName: image.fileName,
            contentType,
            folder: 'listings',
          });

          await listingService.uploadImageToR2(uploadUrl, image.uri, contentType);

          return {
            publicUrl,
            key,
            isCover: image.isCover,
            sortOrder: image.sortOrder,
          };
        } catch {
          uploadErrors.push({
            index,
            message: `Không thể tải ảnh ${index + 1} lên. Vui lòng thử lại.`,
          });

          return null;
        } finally {
          completedCount += 1;
          setUploadProgress(Math.round((completedCount / images.length) * 100));
        }
      })
    );

    const uploaded = uploadResults
      .filter((image): image is UploadedImageItem => image !== null)
      .sort((first, second) => first.sortOrder - second.sortOrder);

    setErrors(uploadErrors.sort((first, second) => first.index - second.index));
    setIsUploading(false);

    return uploaded;
  }, []);

  return { uploadAll, isUploading, uploadProgress, errors };
};
