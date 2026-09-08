import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { THEME_COLORS } from '@theme';
import type { AuthStackParamList } from '../types';
import { LoginScreen, RegisterScreen, OtpScreen } from '@features/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: THEME_COLORS.SURFACE },
        headerTintColor: THEME_COLORS.TEXT_PRIMARY,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />

      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />

      <Stack.Screen
        name="OtpVerification"
        component={OtpScreen}
        options={{ title: 'Xác thực OTP' }}
      />
    </Stack.Navigator>
  );
};
