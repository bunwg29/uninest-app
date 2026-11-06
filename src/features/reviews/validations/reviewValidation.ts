import { z } from 'zod';
import { REVIEW_COMMENT_MAX_LENGTH } from '../types';

const ratingSchema = z
  .number({ required_error: 'Vui lòng chọn số sao' })
  .int()
  .min(1, 'Vui lòng chọn ít nhất 1 sao')
  .max(5, 'Điểm đánh giá tối đa là 5 sao');

export const reviewSchema = z.object({
  locationRating: ratingSchema,
  valueRating: ratingSchema,
  landlordRating: ratingSchema,
  amenitiesRating: ratingSchema,
  comment: z
    .string()
    .trim()
    .max(REVIEW_COMMENT_MAX_LENGTH, 'Nhận xét tối đa 2000 ký tự')
    .optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
