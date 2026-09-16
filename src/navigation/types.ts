import type { NavigatorScreenParams } from '@react-navigation/native';
import type { UserRole } from '@features/auth';

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
  Messages: undefined;
  Community: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ProfileEdit: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};
