import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@theme';
import type { AuthStackParamList } from '../types';
import {
  RoleSelectionScreen,
  LoginScreen,
  RegisterScreen,
  OtpScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '@features/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName="RoleSelection"
      screenOptions={{
        headerStyle: { backgroundColor: THEME_COLORS.SURFACE },
        headerTintColor: THEME_COLORS.TEXT_PRIMARY,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: '',
          headerBackTitle: t('navigation.roleSelection'),
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: '',
          headerBackTitle: t('navigation.login'),
        }}
      />

      <Stack.Screen
        name="OtpVerification"
        component={OtpScreen}
        options={{
          headerTitle: '',
          headerBackTitle: t('navigation.register'),
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerTitle: '',
          headerBackTitle: t('navigation.login'),
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerTitle: '',
          headerBackTitle: t('navigation.forgotPassword'),
        }}
      />
    </Stack.Navigator>
  );
};
