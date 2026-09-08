import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyRound, Phone } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Input, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList } from '@navigation';
import { authService } from '../services';
import { forgotPasswordSchema } from '../validations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanPhone = phoneNumber.trim();
    const result = forgotPasswordSchema.safeParse({ phoneNumber: cleanPhone });

    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || 'Số điện thoại không hợp lệ');

      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ phoneNumber: cleanPhone });

      toast.success(`Mã gồm 6 số vừa được gửi tới ${cleanPhone}`);

      navigation.navigate('OtpVerification', {
        target: cleanPhone,
        flow: 'forgot_password',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';

      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <KeyRound size={32} color={THEME_COLORS.SECONDARY} />
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Quên mật khẩu?
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          Nhập số điện thoại đã đăng ký để nhận mã xác thực đặt lại mật khẩu.
        </Typography>

        <View style={styles.form}>
          <Input
            label="Số điện thoại"
            placeholder="0912 345 678"
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            helperText="Mã OTP 6 số sẽ được gửi qua SMS/Zalo"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);

              if (errorMessage) setErrorMessage(null);
            }}
            errorMessage={errorMessage || undefined}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Gửi mã xác thực
          </Button>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
            activeOpacity={0.7}
          >
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.TEXT_MUTED}>
              Quay lại đăng nhập
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.MD,
  },
  content: {
    marginTop: SPACING_TOKENS.LG,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: SPACING_TOKENS.XL,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.MD,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.SM,
  },
});
