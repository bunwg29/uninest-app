import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@core';
import { reviewService } from '../services';
import type { Review, ReviewReportPayload, SaveReviewPayload } from '../types';

export const REVIEWS_QUERY_KEY = ['reviews'] as const;
export const REVIEW_ELIGIBILITY_QUERY_KEY = ['review-eligibility'] as const;
export const MY_REVIEWS_QUERY_KEY = ['my-reviews'] as const;

const invalidateRatingQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  listingId: string
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, listingId] }),
    queryClient.invalidateQueries({ queryKey: [...REVIEW_ELIGIBILITY_QUERY_KEY, listingId] }),
    queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] }),
    queryClient.invalidateQueries({ queryKey: ['search-listings'] }),
    queryClient.invalidateQueries({ queryKey: ['landlord-public-profile'] }),
    queryClient.invalidateQueries({ queryKey: ['landlord-listings'] }),
    queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ['profile'] }),
  ]);
};

export const useMyReviews = () =>
  useInfiniteQuery({
    queryKey: MY_REVIEWS_QUERY_KEY,
    queryFn: ({ pageParam }) => reviewService.listMine(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

export const useReviews = (listingId: string, stars?: number) =>
  useInfiniteQuery({
    queryKey: [...REVIEWS_QUERY_KEY, listingId, stars ?? 'all'],
    queryFn: ({ pageParam }) => reviewService.list(listingId, pageParam, stars),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: Boolean(listingId),
  });

export const useReviewEligibility = (listingId: string, enabled: boolean) =>
  useQuery({
    queryKey: [...REVIEW_ELIGIBILITY_QUERY_KEY, listingId],
    queryFn: () => reviewService.getEligibility(listingId),
    enabled: Boolean(listingId) && enabled,
  });

export const useSaveReview = (listingId: string, reviewId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<Review, AppError, SaveReviewPayload>({
    mutationFn: (payload) =>
      reviewId ? reviewService.update(reviewId, payload) : reviewService.create(listingId, payload),
    onSuccess: async () => invalidateRatingQueries(queryClient, listingId),
  });
};

export const useReplyReview = (listingId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Review, AppError, { reviewId: string; content: string }>({
    mutationFn: ({ reviewId, content }) => reviewService.reply(reviewId, content),
    onSuccess: async () => invalidateRatingQueries(queryClient, listingId),
  });
};

export const useReportReview = () =>
  useMutation<void, AppError, { reviewId: string; payload: ReviewReportPayload }>({
    mutationFn: ({ reviewId, payload }) => reviewService.report(reviewId, payload),
  });
