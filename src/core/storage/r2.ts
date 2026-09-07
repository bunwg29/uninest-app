import { apiClient } from '../http';
import { ApiResponse } from '../types';

export interface PresignedUploadUrlData {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}

export interface DirectUploadParams {
  fileUri: string;
  fileName: string;
  contentType: string;
  folder?: string;
}

export interface UploadResult {
  fileKey: string;
  publicUrl: string;
}

/**
 * Requests a presigned PUT URL from backend and uploads the file directly to Cloudflare R2.
 * The binary file is sent directly to R2 from the mobile client without passing through the application server.
 */
export async function uploadImageDirectToR2(params: DirectUploadParams): Promise<UploadResult> {
  const { fileUri, fileName, contentType, folder = 'general' } = params;

  // 1. Request presigned upload URL from backend
  const response = await apiClient.post<ApiResponse<PresignedUploadUrlData>>(
    '/storage/presigned-upload-url',
    {
      fileName,
      contentType,
      folder,
    }
  );

  const { uploadUrl, fileKey, publicUrl } = response.data.data;

  // 2. Fetch binary blob from local URI
  const fileBlobResponse = await fetch(fileUri);
  const blob = await fileBlobResponse.blob();

  // 3. Upload directly to Cloudflare R2 bucket via presigned PUT URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Direct R2 upload failed with status ${uploadResponse.status}`);
  }

  return {
    fileKey,
    publicUrl,
  };
}
