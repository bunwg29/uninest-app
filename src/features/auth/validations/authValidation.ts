import { z } from 'zod';

export type LoginIdentifierType = 'phone' | 'email';

export const createLoginSchema = (type: LoginIdentifierType, t: (key: string) => string) => {
  return z.object({
    identifier:
      type === 'phone'
        ? z
            .string()
            .min(1, t('auth.validation.phoneRequired'))
            .regex(/^[0-9]{10}$/, t('auth.validation.phoneInvalid'))
        : z
            .string()
            .min(1, t('auth.validation.emailRequired'))
            .email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });
};

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export const createRegisterSchema = (t: (key: string) => string) => {
  return z.object({
    fullName: z.string().min(2, t('auth.validation.fullNameRequired')),
    phoneNumber: z
      .string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(/^[0-9]{10}$/, t('auth.validation.phoneInvalid')),
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z
      .string()
      .min(8, t('auth.validation.passwordMinLength'))
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, t('auth.validation.passwordPattern')),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: t('auth.validation.termsRequired'),
    }),
  });
};

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export const createForgotPasswordSchema = (t: (key: string) => string) => {
  return z.object({
    phoneNumber: z
      .string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(/^[0-9]{10}$/, t('auth.validation.phoneInvalid')),
  });
};

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export const createResetPasswordSchema = (t: (key: string) => string) => {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, t('auth.validation.passwordMinLength'))
        .regex(/[0-9]/, t('auth.resetPassword.ruleDigit'))
        .regex(/[A-Z]/, t('auth.resetPassword.ruleUppercase')),
      confirmPassword: z.string().min(1, t('auth.validation.passwordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('auth.validation.passwordsMustMatch'),
      path: ['confirmPassword'],
    });
};

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
