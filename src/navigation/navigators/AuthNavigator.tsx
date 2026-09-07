import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@theme';
import type { AuthStackParamList } from '../types';
import { LoginScreen, RegisterScreen, OtpScreen } from '@features/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: THEME_COLORS.SURFACE },
        headerTintColor: THEME_COLORS.TEXT_PRIMARY,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: t('navigation.login') }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: t('navigation.register') }}
      />

      <Stack.Screen
        name="OtpVerification"
        component={OtpScreen}
        options={{ title: t('navigation.otp') }}
      />
    </Stack.Navigator>
  );
};
