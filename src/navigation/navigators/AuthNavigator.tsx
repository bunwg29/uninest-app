import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { THEME_COLORS } from '@theme';
import type { AuthStackParamList } from '../types';
import {
  OnboardingScreen,
  RoleSelectionScreen,
  LoginScreen,
  RegisterScreen,
  OtpScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '@features/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
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
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />

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
          headerBackTitle: 'Chọn vai trò',
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: '',
          headerBackTitle: 'Đăng nhập',
        }}
      />

      <Stack.Screen
        name="OtpVerification"
        component={OtpScreen}
        options={{
          headerTitle: '',
          headerBackTitle: 'Đăng ký',
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerTitle: '',
          headerBackTitle: 'Đăng nhập',
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerTitle: '',
          headerBackTitle: 'Quên mật khẩu',
        }}
      />
    </Stack.Navigator>
  );
};
