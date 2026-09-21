import { z } from 'zod';

export const basicInfoSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề tin đăng').max(150, 'Tiêu đề tối đa 150 ký tự'),
  roomType: z.string().min(1, 'Vui lòng chọn loại phòng'),
  price: z
    .string()
    .min(1, 'Vui lòng nhập giá thuê')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Giá thuê phải lớn hơn 0',
    }),
  area: z
    .string()
    .min(1, 'Vui lòng nhập diện tích')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Diện tích phải lớn hơn 0',
    }),
  maxOccupants: z
    .string()
    .min(1, 'Vui lòng nhập số người tối đa')
    .refine(
      (val) => {
        const n = Number(val);

        return Number.isInteger(n) && n >= 1 && n <= 20;
      },
      { message: 'Số người tối đa từ 1 đến 20' }
    ),
  description: z.string().max(3000, 'Mô tả tối đa 3000 ký tự').optional(),
  electricPrice: z
    .string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Giá điện không hợp lệ',
    })
    .optional(),
  waterPrice: z
    .string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Giá nước không hợp lệ',
    })
    .optional(),
  deposit: z
    .string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Tiền cọc không hợp lệ',
    })
    .optional(),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export const locationSchema = z.object({
  streetAddress: z
    .string()
    .min(1, 'Vui lòng nhập địa chỉ đường phố')
    .max(255, 'Địa chỉ tối đa 255 ký tự'),
  provinceCode: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  wardCode: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  latitude: z
    .number({ invalid_type_error: 'Vui lòng chọn vị trí trên bản đồ' })
    .min(-90, 'Vĩ độ không hợp lệ')
    .max(90, 'Vĩ độ không hợp lệ'),
  longitude: z
    .number({ invalid_type_error: 'Vui lòng chọn vị trí trên bản đồ' })
    .min(-180, 'Kinh độ không hợp lệ')
    .max(180, 'Kinh độ không hợp lệ'),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
