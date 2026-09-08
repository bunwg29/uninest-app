import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import type { AuthStackParamList, RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  const handleGoToOtp = () => {
    navigation.navigate('OtpVerification', { target: '0901234567' });
  };

  const handleGoToMain = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleGoToMain}>
        <Text style={styles.primaryButtonText}>Trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToRegister}>
        <Text style={styles.secondaryButtonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToOtp}>
        <Text style={styles.secondaryButtonText}>Xác thực OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.BACKGROUND,
    padding: SPACING_TOKENS.MD,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING_TOKENS.LG,
  },
  primaryButton: {
    backgroundColor: THEME_COLORS.PRIMARY,
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.SM,
    borderRadius: 8,
    marginBottom: SPACING_TOKENS.SM,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: THEME_COLORS.SURFACE,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.SM,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.SM,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: THEME_COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    fontSize: 14,
  },
});
