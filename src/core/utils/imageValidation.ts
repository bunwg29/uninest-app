export const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;

interface PickedImageAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}

export const resolveImageContentType = (asset: PickedImageAsset): string => {
  if (asset.mimeType) return asset.mimeType.toLowerCase();

  const source = (asset.fileName ?? asset.uri).split('?')[0].toLowerCase();

  if (source.endsWith('.png')) return 'image/png';

  if (source.endsWith('.jpg') || source.endsWith('.jpeg')) return 'image/jpeg';

  return 'application/octet-stream';
};

export const validateUploadImage = (asset: PickedImageAsset): string | null => {
  const contentType = resolveImageContentType(asset);

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(contentType)) {
    return 'Chỉ hỗ trợ ảnh định dạng jpg hoặc png';
  }

  if (asset.fileSize && asset.fileSize > MAX_UPLOAD_IMAGE_BYTES) {
    return 'Mỗi ảnh có dung lượng tối đa 5MB';
  }

  return null;
};

export const filterValidUploadImages = <T extends PickedImageAsset>(
  assets: T[]
): { valid: T[]; firstError: string | null } => {
  let firstError: string | null = null;
  const valid = assets.filter((asset) => {
    const error = validateUploadImage(asset);

    if (error && !firstError) firstError = error;

    return error === null;
  });

  return { valid, firstError };
};
