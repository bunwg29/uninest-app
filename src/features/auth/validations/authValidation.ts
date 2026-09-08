import { z } from 'zod';

export type LoginIdentifierType = 'phone' | 'email';

export const createLoginSchema = (type: LoginIdentifierType) => {
  return z.object({
    identifier:
      type === 'phone'
        ? z
            .string()
            .min(1, 'Vui lòng nhập số điện thoại')
            .regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (10 chữ số)')
        : z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  });
};

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  phoneNumber: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (10 chữ số)'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Mật khẩu phải chứa cả chữ cái và số'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần đồng ý với điều khoản sử dụng',
  }),
});

export const createRegisterSchema = () => registerSchema;

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (10 chữ số)'),
});

export const createForgotPasswordSchema = () => forgotPasswordSchema;

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
      .regex(/[0-9]/, 'Có ít nhất một chữ số')
      .regex(/[A-Z]/, 'Có ít nhất một chữ in hoa'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Hai mật khẩu không khớp nhau',
    path: ['confirmPassword'],
  });

export const createResetPasswordSchema = () => resetPasswordSchema;

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
