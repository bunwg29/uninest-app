import type { NavigatorScreenParams } from '@react-navigation/native';
import type { UserRole } from '@features/auth';

export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Register: { role?: UserRole } | undefined;
  OtpVerification: {
    target: string;
    flow?: 'register' | 'forgot_password';
    role?: UserRole;
  };
  ForgotPassword: undefined;
  ResetPassword: { target: string; otpCode: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Messages: undefined;
  Community: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};
