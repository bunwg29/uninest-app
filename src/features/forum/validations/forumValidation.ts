import { z } from 'zod';
import { parseRawNumberString } from '@core';
import { parseDisplayDate } from '../utils/forumFormat';

const optionalText = (maxLength: number, message: string) =>
  z.string().trim().max(maxLength, message).optional().or(z.literal(''));

export const forumPostSchema = z
  .object({
    category: z.enum(['roommate', 'experience', 'question', 'area_review'], {
      errorMap: () => ({ message: 'Vui lòng chọn chuyên mục' }),
    }),
    title: z
      .string()
      .trim()
      .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
      .max(150, 'Tiêu đề không được vượt quá 150 ký tự'),
    content: z
      .string()
      .trim()
      .min(10, 'Nội dung phải có ít nhất 10 ký tự')
      .max(5000, 'Nội dung không được vượt quá 5000 ký tự'),
    gender: z.enum(['female', 'male', 'any']),
    costPerPerson: z.string(),
    moveInDate: z.string(),
    minStayMonths: z.string(),
    costNote: optionalText(200, 'Ghi chú chi phí không được vượt quá 200 ký tự'),
    lifestyle: optionalText(500, 'Tiêu chí ở ghép không được vượt quá 500 ký tự'),
    area: optionalText(255, 'Khu vực không được vượt quá 255 ký tự'),
    roommateStatus: z.enum(['open', 'full']),
  })
  .superRefine((values, context) => {
    if (values.category !== 'roommate') return;

    const cost = Number(parseRawNumberString(values.costPerPerson));

    if (!values.costPerPerson || Number.isNaN(cost)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['costPerPerson'],
        message: 'Vui lòng nhập chi phí mỗi người',
      });
    } else if (cost > 100_000_000) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['costPerPerson'],
        message: 'Chi phí mỗi người vượt quá giới hạn cho phép',
      });
    }

    if (values.moveInDate.trim() && !parseDisplayDate(values.moveInDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['moveInDate'],
        message: 'Ngày dọn vào phải có dạng DD/MM/YYYY',
      });
    }

    const minStayMonths = Number(values.minStayMonths);

    if (
      values.minStayMonths.trim() &&
      (!Number.isInteger(minStayMonths) || minStayMonths < 1 || minStayMonths > 60)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minStayMonths'],
        message: 'Số tháng ở tối thiểu từ 1 đến 60',
      });
    }
  });

export type ForumPostFormValues = z.infer<typeof forumPostSchema>;

export const FORUM_POST_FORM_DEFAULTS: ForumPostFormValues = {
  category: 'roommate',
  title: '',
  content: '',
  gender: 'female',
  costPerPerson: '',
  moveInDate: '',
  minStayMonths: '',
  costNote: '',
  lifestyle: '',
  area: '',
  roommateStatus: 'open',
};
