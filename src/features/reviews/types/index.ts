import type { PaginatedResponse } from '@core';

export interface ReviewStudent {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  listingId: string;
  bookingId: string;
  student?: ReviewStudent;
  locationRating: number;
  valueRating: number;
  landlordRating: number;
  amenitiesRating: number;
  averageRating: number;
  comment: string | null;
  editedUntil: string;
  landlordReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  distribution: Record<number, number>;
}

export interface ReviewListResponse extends PaginatedResponse<Review> {
  summary: ReviewSummary;
}

export interface MyReview extends Review {
  listing: {
    id: string;
    title: string;
    address: string;
  };
}

export type MyReviewListResponse = PaginatedResponse<MyReview>;

export type ReviewEligibility =
  | { eligible: true; bookingId: string; viewedAt: string }
  | {
      eligible: false;
      reason: 'already_reviewed';
      reviewId: string;
      editableUntil: string;
    }
  | { eligible: false; reason: 'viewing_history_required' };

export interface SaveReviewPayload {
  bookingId?: string;
  locationRating: number;
  valueRating: number;
  landlordRating: number;
  amenitiesRating: number;
  comment?: string;
  acknowledgeWarnings?: boolean;
}

export interface ReviewReportPayload {
  reason: string;
  note?: string;
}

export const REVIEW_PAGE_SIZE = 10;
export const REVIEW_COMMENT_MAX_LENGTH = 2000;
export const REVIEW_REPLY_MAX_LENGTH = 1000;
export const REVIEW_REPORT_REASON_MAX_LENGTH = 80;
export const REVIEW_REPORT_NOTE_MAX_LENGTH = 500;
