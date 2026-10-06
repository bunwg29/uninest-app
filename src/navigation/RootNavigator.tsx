import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ChangePasswordScreen,
  OtpScreen,
  ProfileEditScreen,
  ResetPasswordScreen,
  SettingsScreen,
  SplashScreen,
  useAuth,
} from '@features/auth';
import { ChatImagePreviewScreen, ChatRoomScreen, useChatRealtime } from '@features/chat';
import { LandlordListingDetailScreen, StudentListingPreviewScreen } from '@features/listings';
import {
  BookingConfirmScreen,
  BookingDetailScreen,
  BookingHoldScreen,
  BookingNewScreen,
  BookingSuccessScreen,
  CancelBookingScreen,
  MyBookingsScreen,
} from '@features/booking';
import type { RootStackParamList } from './types';
import { AuthNavigator, MainTabNavigator, ListingPostNavigator } from './navigators';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);

  useChatRealtime(isAuthenticated ? (user?.id ?? null) : null);

  const showSplash = !isInitialized || !isSplashDone;

  return (
    <NavigationContainer>
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
            <Stack.Screen name="BookingHold" component={BookingHoldScreen} />
            <Stack.Screen name="OtpVerification" component={OtpScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
