import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: { target?: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Messages: undefined;
  Community: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};
