import { apiClient } from '@core';
import type { ApiResponse, PaginatedResponse } from '@core';
import { listingService } from '@features/listings/services/listingService';
import type {
  CreateForumCommentPayload,
  ForumComment,
  ForumFeedFilters,
  ForumLikeResult,
  ForumLocalImage,
  ForumPost,
  ForumReportEntityType,
  ForumReportPayload,
  ForumReportResult,
  ModerationCheckPayload,
  ModerationResult,
  SaveForumPostPayload,
} from '../types';
import {
  FORUM_COMMENTS_PAGE_SIZE,
  FORUM_IMAGE_FOLDER,
  FORUM_PAGE_SIZE,
  FORUM_REPLIES_PAGE_SIZE,
} from '../types';

const REPORT_ENDPOINTS: Record<ForumReportEntityType, (entityId: string) => string> = {
  forum_post: (entityId) => `/forum/posts/${entityId}/reports`,
  forum_comment: (entityId) => `/forum/comments/${entityId}/reports`,
};

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

export const forumService = {
  async getFeed(filters: ForumFeedFilters, page: number): Promise<PaginatedResponse<ForumPost>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ForumPost>>>(
      '/forum/posts',
      { params: compactParams({ ...filters, page, limit: FORUM_PAGE_SIZE }) }
    );

    return unwrap(response);
  },

  async getPost(postId: string): Promise<ForumPost> {
    return unwrap(await apiClient.get<ApiResponse<ForumPost>>(`/forum/posts/${postId}`));
  },

  async createPost(payload: SaveForumPostPayload): Promise<ForumPost> {
    return unwrap(await apiClient.post<ApiResponse<ForumPost>>('/forum/posts', payload));
  },

  async updatePost(postId: string, payload: Partial<SaveForumPostPayload>): Promise<ForumPost> {
    return unwrap(await apiClient.patch<ApiResponse<ForumPost>>(`/forum/posts/${postId}`, payload));
  },

  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/forum/posts/${postId}`);
  },

  async likePost(postId: string): Promise<ForumLikeResult> {
    return unwrap(
      await apiClient.post<ApiResponse<ForumLikeResult>>(`/forum/posts/${postId}/like`)
    );
  },

  async unlikePost(postId: string): Promise<ForumLikeResult> {
    return unwrap(
      await apiClient.delete<ApiResponse<ForumLikeResult>>(`/forum/posts/${postId}/like`)
    );
  },

  async getComments(postId: string, page: number): Promise<PaginatedResponse<ForumComment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ForumComment>>>(
      `/forum/posts/${postId}/comments`,
      { params: { page, limit: FORUM_COMMENTS_PAGE_SIZE } }
    );

    return unwrap(response);
  },

  async getReplies(commentId: string, page: number): Promise<PaginatedResponse<ForumComment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ForumComment>>>(
      `/forum/comments/${commentId}/replies`,
      { params: { page, limit: FORUM_REPLIES_PAGE_SIZE } }
    );

    return unwrap(response);
  },

  async createComment(postId: string, payload: CreateForumCommentPayload): Promise<ForumComment> {
    return unwrap(
      await apiClient.post<ApiResponse<ForumComment>>(`/forum/posts/${postId}/comments`, payload)
    );
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/forum/comments/${commentId}`);
  },

  async report({ entityType, entityId, reason, note }: ForumReportPayload) {
    const response = await apiClient.post<ApiResponse<ForumReportResult>>(
      REPORT_ENDPOINTS[entityType](entityId),
      { reason, note: note?.trim() || undefined }
    );

    return unwrap(response);
  },

  async checkContent(payload: ModerationCheckPayload): Promise<ModerationResult> {
    return unwrap(
      await apiClient.post<ApiResponse<ModerationResult>>('/forum/moderation/check', payload)
    );
  },

  async uploadImage(image: ForumLocalImage): Promise<string> {
    const { uploadUrl, key } = await listingService.getPresignedUploadUrl({
      fileName: image.fileName,
      contentType: image.contentType,
      folder: FORUM_IMAGE_FOLDER,
    });

    await listingService.uploadImageToR2(uploadUrl, image.uri, image.contentType);

    return key;
  },
};
