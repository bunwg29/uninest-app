import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ChangePasswordScreen,
  LandlordVerificationScreen,
  OtpScreen,
  ProfileEditScreen,
  ResetPasswordScreen,
  SettingsScreen,
  SplashScreen,
  useAuth,
} from '@features/auth';
import { ChatImagePreviewScreen, ChatRoomScreen, useChatRealtime } from '@features/chat';
import { CommunityScreen, ForumPostComposerScreen, ForumPostDetailScreen } from '@features/forum';
import {
  LandlordListingDetailScreen,
  LandlordPublicProfileScreen,
  ListingDetailScreen,
  StudentListingPreviewScreen,
} from '@features/listings';
import { ComparisonScreen } from '@features/comparison';
import { PriceComparisonScreen } from '@features/price-comparison';
import { PersonalizationDataScreen } from '@features/recommendations';
import { SavedRoomsScreen } from '@features/search';
import {
  NotificationsScreen,
  NotificationSettingsScreen,
  SavedSearchesScreen,
  usePushRegistration,
} from '@features/notifications';
import { HelpCenterScreen, TermsScreen } from '@features/support';
import {
  BookingConfirmScreen,
  BookingDetailScreen,
  BookingNewScreen,
  BookingSuccessScreen,
  CancelBookingScreen,
  MyBookingsScreen,
} from '@features/booking';
import type { RootStackParamList } from './types';
import { AuthNavigator, MainTabNavigator, ListingPostNavigator } from './navigators';
import { MaintenanceGate } from './components/MaintenanceGate';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);

  useChatRealtime(isAuthenticated ? (user?.id ?? null) : null);
  usePushRegistration(isAuthenticated ? (user?.id ?? null) : null);

  const showSplash = !isInitialized || !isSplashDone;

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {showSplash ? (
            <Stack.Screen name="Splash">
              {() => <SplashScreen onFinish={() => setIsSplashDone(true)} />}
            </Stack.Screen>
          ) : isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen
                name="ListingPost"
                component={ListingPostNavigator}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
              <Stack.Screen
                name="ChatImagePreview"
                component={ChatImagePreviewScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="LandlordListingDetail" component={LandlordListingDetailScreen} />
              <Stack.Screen name="StudentListingPreview" component={StudentListingPreviewScreen} />
              <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
              <Stack.Screen name="LandlordPublicProfile" component={LandlordPublicProfileScreen} />
              <Stack.Screen name="Comparison" component={ComparisonScreen} />
              <Stack.Screen name="PriceComparison" component={PriceComparisonScreen} />
              <Stack.Screen name="PersonalizationData" component={PersonalizationDataScreen} />
              <Stack.Screen name="SavedRooms" component={SavedRoomsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
              <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} />
              <Stack.Screen name="LandlordVerification" component={LandlordVerificationScreen} />
              <Stack.Screen name="BookingNew" component={BookingNewScreen} />
              <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
              <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
              <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
              <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
              <Stack.Screen
                name="CancelBooking"
                component={CancelBookingScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="OtpVerification" component={OtpScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="Community" component={CommunityScreen} />
              <Stack.Screen name="ForumPostDetail" component={ForumPostDetailScreen} />
              <Stack.Screen
                name="ForumPostComposer"
                component={ForumPostComposerScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="Terms" component={TermsScreen} />
              <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {showSplash ? null : <MaintenanceGate />}
    </>
  );
};
