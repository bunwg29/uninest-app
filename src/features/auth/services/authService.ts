import { apiClient, tokenStorage, getDeviceInfo } from '@core';
import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  Profile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UserRole,
  VerifyOtpPayload,
} from '../types';

interface BackendUser {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  roleId: number;
  avatarUrl?: string | null;
  isVerified: boolean;
  provinceCode?: string | null;
  wardCode?: string | null;
  streetAddress?: string | null;
  fullAddress?: string | null;
}

interface BackendAuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user: BackendUser;
}

const unwrapData = <T>(payload: unknown): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { status?: boolean }).status !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const mapBackendUser = (user: BackendUser): AuthUser => {
  let role: UserRole = 'student';

  if (user.roleId === 1) {
    role = 'landlord';
  } else if (user.roleId === 2) {
    role = 'admin';
  }

  return {
    id: user.id,
    fullName: user.fullName,
    phoneNumber: user.phone || '',
    email: user.email || undefined,
    role,
    avatarUrl: user.avatarUrl || undefined,
    isVerified: user.isVerified,
    provinceCode: user.provinceCode || undefined,
    wardCode: user.wardCode || undefined,
    streetAddress: user.streetAddress || undefined,
    fullAddress: user.fullAddress || undefined,
  };
};

const mapBackendTokens = (result: BackendAuthResult): AuthTokens => ({
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,
  expiresIn: result.expiresIn,
});

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { deviceName, deviceId } = await getDeviceInfo();

    const response = await apiClient.post('/auth/login', {
      identifier: payload.identifier.trim(),
      password: payload.password,
      deviceName,
      deviceId,
    });

    const result = unwrapData<BackendAuthResult>(response.data);

    return {
      user: mapBackendUser(result.user),
      tokens: mapBackendTokens(result),
    };
  },

  async register(payload: RegisterPayload): Promise<{ success: boolean; message: string }> {
    const roleId = payload.role === 'landlord' ? 1 : 0;
    const phone = payload.phoneNumber ? payload.phoneNumber.trim() : null;
    const email = payload.email ? payload.email.trim() : null;

    const response = await apiClient.post('/auth/register', {
      fullName: payload.fullName.trim(),
      phone,
      email,
      password: payload.password,
      roleId,
      provinceCode: payload.provinceCode || undefined,
      wardCode: payload.wardCode || undefined,
      streetAddress: payload.streetAddress?.trim() || undefined,
    });

    const result = unwrapData<{ message: string }>(response.data);

    return {
      success: true,
      message: result.message || 'Đăng ký tài khoản thành công',
    };
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    const type = payload.flow === 'forgot_password' ? 'FORGOT_PASSWORD' : 'REGISTER';
    const { deviceName, deviceId } = await getDeviceInfo();

    const response = await apiClient.post('/auth/otp/verify', {
      identifier: payload.phoneNumber.trim(),
      code: payload.otpCode.trim(),
      type,
      deviceName,
      deviceId,
    });

    const result = unwrapData<BackendAuthResult>(response.data);

    return {
      user: mapBackendUser(result.user),
      tokens: mapBackendTokens(result),
    };
  },

  async resendOtp(
    phoneNumber: string,
    type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' = 'REGISTER'
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/otp/send', {
      identifier: phoneNumber.trim(),
      type,
    });

    const result = unwrapData<{ message: string }>(response.data);

    return {
      success: true,
      message: result.message || 'Mã xác thực đã được gửi lại',
    };
  },

  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/forgot-password', {
      identifier: payload.phoneNumber.trim(),
    });

    const result = unwrapData<{ message: string }>(response.data);

    return {
      success: true,
      message: result.message || 'Mã OTP khôi phục mật khẩu đã được gửi',
    };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean }> {
    await apiClient.post('/auth/reset-password', {
      identifier: payload.phoneNumber.trim(),
      code: payload.otpCode.trim(),
      newPassword: payload.newPassword,
    });

    return { success: true };
  },

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get('/profile');
    const result = unwrapData<Profile>(response.data);

    return result;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
    const response = await apiClient.patch('/profile', payload);

    return unwrapData<Profile>(response.data);
  },

  async presignAvatar(fileName: string, contentType: string, fileSize: number) {
    const response = await apiClient.post('/profile/avatar/presign', {
      fileName,
      contentType,
      fileSize,
    });

    return unwrapData<{ uploadUrl: string; objectKey: string; expiresIn: number }>(response.data);
  },

  async confirmAvatar(objectKey: string): Promise<{ avatarUrl: string }> {
    const response = await apiClient.post('/profile/avatar/confirm', { objectKey });

    return unwrapData<{ avatarUrl: string }>(response.data);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const deviceId = await tokenStorage.getDeviceId();

    await apiClient.patch('/auth/change-password', payload, {
      headers: deviceId ? { 'x-device-id': deviceId } : undefined,
    });
  },

  async logout(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    const deviceId = await tokenStorage.getDeviceId();

    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', {
          refreshToken,
          deviceId: deviceId || undefined,
        });
      } catch {
        // ignore logout errors
      }
    }
  },
};
