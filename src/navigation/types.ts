import type { NavigatorScreenParams } from '@react-navigation/native';
import type { UserRole } from '@features/auth';

export type ListingPostStackParamList = {
  ListingPostBasicInfo: undefined;
  ListingPostImages: undefined;
  ListingPostLocation: undefined;
  ListingPostAmenities: undefined;
  ListingPostSchedule: undefined;
  ListingPostPreview: undefined;
  ListingPostSuccess: { listingId: string };
};

export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Register: { role?: UserRole } | undefined;
  RegisterAddress: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: UserRole;
  };
  OtpVerification: {
    target: string;
    flow?: 'register' | 'forgot_password';
    role?: UserRole;
    returnToChangePassword?: boolean;
  };
  ForgotPassword: undefined;
  ResetPassword: { target: string; otpCode: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  AiChat: undefined;
  Messages: undefined;
  Profile: undefined;
  Overview?: undefined;
  Listings?: undefined;
  CreateListing?: undefined;
  Appointments?: undefined;
  Community?: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ListingPost: NavigatorScreenParams<ListingPostStackParamList> | undefined;
  ProfileEdit: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  OtpVerification: {
    target: string;
    flow?: 'register' | 'forgot_password';
    role?: UserRole;
    returnToChangePassword?: boolean;
  };
  ResetPassword: { target: string; otpCode: string };
};
