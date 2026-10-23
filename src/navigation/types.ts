import type { NavigatorScreenParams } from '@react-navigation/native';
import type { UserRole } from '@features/auth';
import type { ForumCategory } from '@features/forum';
import type { LandlordListing } from '@features/listings';
import type { HelpTopicId, LegalTab } from '@features/support';

export type ListingPostStackParamList = {
  ListingPostBasicInfo: { listingId?: string; listing?: LandlordListing } | undefined;
  ListingPostImages: undefined;
  ListingPostLocation: undefined;
  ListingPostAmenities: undefined;
  ListingPostSchedule: undefined;
  ListingPostPreview: undefined;
  ListingPostSuccess: {
    listingId: string;
    title?: string;
    price?: number;
    area?: number;
    imageUri?: string;
  };
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
  Terms: { tab?: LegalTab } | undefined;
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
};

export type LandlordTabParamList = {
  Overview: undefined;
  Listings: undefined;
  CreateListing: undefined;
  Appointments: undefined;
  Messages: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ListingPost: NavigatorScreenParams<ListingPostStackParamList> | undefined;
  ProfileEdit: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  ChatRoom: { conversationId: string };
  ChatImagePreview: { conversationId: string; counterpartName: string; imageUris: string[] };
  LandlordListingDetail: { listing: LandlordListing };
  StudentListingPreview: { listing: LandlordListing };
  BookingNew: { resourceId: string };
  BookingConfirm: undefined;
  BookingSuccess: { id: string };
  MyBookings: undefined;
  BookingDetail: { id: string };
  CancelBooking: { id: string };
  OtpVerification: {
    target: string;
    flow?: 'register' | 'forgot_password';
    role?: UserRole;
    returnToChangePassword?: boolean;
  };
  ResetPassword: { target: string; otpCode: string };
  ListingDetail: { id: string };
  LandlordPublicProfile: { landlordId: string; isPreview?: boolean };
  Comparison: undefined;
  PriceComparison: undefined;
  SavedRooms: undefined;
  LandlordVerification: undefined;
  Community: { category?: ForumCategory } | undefined;
  ForumPostDetail: { postId: string };
  ForumPostComposer: { postId?: string; category?: ForumCategory } | undefined;
  Terms: { tab?: LegalTab } | undefined;
  HelpCenter: { topicId?: HelpTopicId } | undefined;
};
