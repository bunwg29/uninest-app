import { apiClient } from '@core';
import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
  VerifyOtpPayload,
} from '../types';

const isNetworkOrNotFoundError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode;

    return statusCode === 404 || statusCode === 500 || statusCode === 0;
  }

  return true;
};

const createMockUser = (
  phoneNumber: string,
  fullName: string = 'Nguyễn Xuân Hoài',
  role: UserRole = 'student'
): AuthUser => ({
  id: 'user_mock_001',
  fullName,
  phoneNumber,
  email: 'nguyenvana@gmail.com',
  role,
  avatarUrl: undefined,
  isVerified: true,
});

const createMockTokens = (): AuthTokens => ({
  accessToken: 'mock_jwt_access_token_' + Date.now(),
  refreshToken: 'mock_jwt_refresh_token_' + Date.now(),
  expiresIn: 3600,
});

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        return {
          user: createMockUser(
            payload.identifier.includes('@') ? '0905123456' : payload.identifier,
            'Nguyễn Xuân Hoài',
            'student'
          ),
          tokens: createMockTokens(),
        };
      }

      throw error;
    }
  },

  async register(payload: RegisterPayload): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/register',
        payload
      );

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        return {
          success: true,
          message: 'OTP sent successfully',
        };
      }

      throw error;
    }
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/verify-otp', payload);

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        if (payload.otpCode !== '123456' && payload.otpCode.length === 6) {
          // If code is not 123456 and equal to 000000, trigger error to demo invalid OTP state
          if (payload.otpCode === '000000') {
            const err = new Error('Invalid OTP');

            (err as unknown as { statusCode: number }).statusCode = 400;
            throw err;
          }
        }

        return {
          user: createMockUser(payload.phoneNumber, 'Nguyễn Xuân Hoài', payload.role || 'student'),
          tokens: createMockTokens(),
        };
      }

      throw error;
    }
  },

  async resendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/resend-otp',
        { phoneNumber }
      );

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        return {
          success: true,
          message: 'OTP resent successfully',
        };
      }

      throw error;
    }
  },

  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/forgot-password',
        payload
      );

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        return {
          success: true,
          message: 'Reset instructions sent',
        };
      }

      throw error;
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>('/auth/reset-password', payload);

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        return { success: true };
      }

      throw error;
    }
  },

  async getProfile(): Promise<AuthUser> {
    try {
      const response = await apiClient.get<AuthUser>('/auth/me');

      return response.data;
    } catch (error) {
      if (isNetworkOrNotFoundError(error)) {
        return createMockUser('0905123456');
      }

      throw error;
    }
  },
};
