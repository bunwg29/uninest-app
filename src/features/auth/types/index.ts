export type UserRole = 'student' | 'landlord' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  provinceCode?: string;
  wardCode?: string;
  streetAddress?: string;
  fullAddress?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  phoneVerified: boolean;
  email?: string | null;
  school?: string | null;
  bio?: string | null;
  interestedAreas: string[];
  role: UserRole;
  verificationStatus?: 'pending_verification' | 'verified' | null;
  stats: {
    savedRooms: number;
    appointments: number;
    reviews: number;
  };
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  school?: string;
  bio?: string;
  interestedAreas?: string[];
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  type?: 'phone' | 'email';
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role?: UserRole;
  provinceCode?: string;
  wardCode?: string;
  streetAddress?: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otpCode: string;
  flow?: 'register' | 'forgot_password';
  role?: UserRole;
}

export interface ForgotPasswordPayload {
  phoneNumber: string;
}

export interface ResetPasswordPayload {
  phoneNumber: string;
  otpCode: string;
  newPassword: string;
}
