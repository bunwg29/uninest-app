import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, AlertTriangle, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList, RootStackParamList } from '@navigation';
import { OtpInput } from '../components';
import { useAuth } from '../hooks';
import { authService } from '../services';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;
type OtpRouteProp = RouteProp<AuthStackParamList, 'OtpVerification'>;

const COUNTDOWN_SECONDS = 60;

export const OtpScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const { verifyOtp, isLoading, error: storeError, clearError } = useAuth();
  const toast = useToast();

  const target = route.params?.target || '0905 123 456';
  const flow = route.params?.flow || 'register';
  const role = route.params?.role || 'student';
  const returnToChangePassword = route.params?.returnToChangePassword === true;

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    clearError();
    setErrorMessage(null);
    setHasExpired(false);

    try {
      await authService.resendOtp(target);
      setCountdown(COUNTDOWN_SECONDS);
      toast.info('Mã xác thực mới đã được gửi!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsResending(false);
    }
  };

  const handleConfirm = useCallback(async () => {
    if (code.length < 6 || isLoading) {
      return;
    }

    clearError();

    try {
      if (flow === 'forgot_password') {
        toast.success('Mã OTP xác thực thành công!');

        navigation.navigate('ResetPassword', {
          target,
          otpCode: code,
        });

        return;
      }

      await verifyOtp({
        phoneNumber: target,
        otpCode: code,
        flow,
        role,
      });

      toast.success('Xác thực tài khoản thành công!');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';

      setErrorMessage(msg);
      toast.error(msg);
    }
  }, [code, isLoading, clearError, flow, target, role, verifyOtp, navigation, toast]);

  const handleBack = () => {
    clearError();

    navigation.goBack();
  };

  const hasError = Boolean(storeError || errorMessage || hasExpired);

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              Bước 2 / 2
            </Typography>
          </View>
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Nhập mã xác thực
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          {`Mã gồm 6 số vừa được gửi tới ${target}`}
        </Typography>
      </View>

      <OtpInput
        code={code}
        length={6}
        onCodeChange={(newCode) => {
          setCode(newCode);

          if (errorMessage) {
            setErrorMessage(null);
            clearError();
          }
        }}
        hasError={hasError}
      />

      {errorMessage ? (
        <View style={styles.errorRow}>
          <AlertCircle size={16} color={THEME_COLORS.ERROR} style={styles.alertIcon} />

          <Typography variant="body2" weight="MEDIUM" color={THEME_COLORS.ERROR}>
            {errorMessage}
          </Typography>
        </View>
      ) : null}

      {hasExpired ? (
        <View style={styles.warningBox}>
          <AlertTriangle size={18} color={THEME_COLORS.WARNING} style={styles.alertIcon} />

          <Typography variant="caption" color={THEME_COLORS.WARNING} style={styles.warningText}>
            Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.
          </Typography>
        </View>
      ) : null}

      <View style={styles.resendSection}>
        {countdown > 0 ? (
          <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
            Chưa nhận được mã?{' '}
            <Text style={styles.resendTimerText}>
              {`Gửi lại sau ${formatCountdown(countdown)}`}
            </Text>
          </Typography>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={isResending} activeOpacity={0.7}>
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              Gửi lại mã
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.noticeBox}>
        <ShieldCheck size={18} color={THEME_COLORS.TEXT_MUTED} style={styles.noticeIcon} />

        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.noticeText}>
          Mã OTP có hiệu lực trong 5 phút. Không chia sẻ mã này cho bất kỳ ai.
        </Typography>
      </View>

      <View style={styles.actionContainer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={code.length < 6}
          isLoading={isLoading}
          onPress={handleConfirm}
          style={styles.confirmButton}
        >
          Xác nhận
        </Button>

        <TouchableOpacity style={styles.changePhoneButton} onPress={handleBack} activeOpacity={0.7}>
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.TEXT_SECONDARY}>
            {returnToChangePassword ? 'Quay lại đổi mật khẩu' : 'Đổi số điện thoại khác'}
          </Typography>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.MD,
  },
  header: {
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.LG,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING_TOKENS.SM,
  },
  backButton: {
    marginLeft: -SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.XS,
  },
  stepBadge: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  subtitle: {
    lineHeight: 22,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.SM,
  },
  alertIcon: {
    marginRight: SPACING_TOKENS.XS,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    marginVertical: SPACING_TOKENS.SM,
  },
  warningText: {
    flex: 1,
    lineHeight: 18,
  },
  resendSection: {
    alignItems: 'center',
    marginVertical: SPACING_TOKENS.MD,
  },
  resendTimerText: {
    color: THEME_COLORS.PRIMARY,
    fontWeight: '600',
  },

  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.XL,
  },
  noticeIcon: {
    marginRight: SPACING_TOKENS.SM,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 'auto',
    paddingBottom: SPACING_TOKENS.LG,
  },
  confirmButton: {
    marginBottom: SPACING_TOKENS.MD,
  },
  changePhoneButton: {
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.SM,
  },
});
