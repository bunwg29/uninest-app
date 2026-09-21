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
import type { RootStackParamList } from './types';
import { AuthNavigator, MainTabNavigator, ListingPostNavigator } from './navigators';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);

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
