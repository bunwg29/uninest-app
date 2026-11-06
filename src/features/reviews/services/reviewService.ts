import { apiClient, unwrapApiData } from '@core';
import type {
  Review,
  ReviewEligibility,
  ReviewListResponse,
  ReviewReportPayload,
  SaveReviewPayload,
  MyReviewListResponse,
} from '../types';
import { REVIEW_PAGE_SIZE } from '../types';

export const reviewService = {
  async listMine(page: number): Promise<MyReviewListResponse> {
    const response = await apiClient.get('/reviews/me', {
      params: { page, limit: REVIEW_PAGE_SIZE },
    });

    return unwrapApiData<MyReviewListResponse>(response.data);
  },

  async list(listingId: string, page: number, stars?: number): Promise<ReviewListResponse> {
    const response = await apiClient.get(`/listings/${listingId}/reviews`, {
      params: { page, limit: REVIEW_PAGE_SIZE, stars },
    });

    return unwrapApiData<ReviewListResponse>(response.data);
  },

  async getEligibility(listingId: string): Promise<ReviewEligibility> {
    const response = await apiClient.get(`/listings/${listingId}/reviews/eligibility`);

    return unwrapApiData<ReviewEligibility>(response.data);
  },

  async create(listingId: string, payload: SaveReviewPayload): Promise<Review> {
    const response = await apiClient.post(`/listings/${listingId}/reviews`, payload);

    return unwrapApiData<Review>(response.data);
  },

  async update(reviewId: string, payload: SaveReviewPayload): Promise<Review> {
    const { bookingId: _bookingId, ...body } = payload;
    const response = await apiClient.patch(`/reviews/${reviewId}`, body);

    return unwrapApiData<Review>(response.data);
  },

  async reply(reviewId: string, content: string): Promise<Review> {
    const response = await apiClient.post(`/reviews/${reviewId}/reply`, { content });

    return unwrapApiData<Review>(response.data);
  },

  async report(reviewId: string, payload: ReviewReportPayload): Promise<void> {
    await apiClient.post(`/reviews/${reviewId}/reports`, payload);
  },
};
