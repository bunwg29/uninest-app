import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, ScreenContainer, Typography } from '@ui';
import type { AuthStackParamList, RootStackParamList } from '@navigation';
import { OtpInput } from '../components';
import { useAuth } from '../hooks';
import { authService } from '../services';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;
type OtpRouteProp = RouteProp<AuthStackParamList, 'OtpVerification'>;

const COUNTDOWN_SECONDS = 60;

export const OtpScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const { verifyOtp, isLoading, error: storeError, clearError } = useAuth();

  const target = route.params?.target || '0905 123 456';
  const flow = route.params?.flow || 'register';
  const role = route.params?.role || 'student';

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
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
    setRemainingAttempts(null);
    setHasExpired(false);

    try {
      await authService.resendOtp(target);
      setCountdown(COUNTDOWN_SECONDS);
    } catch {
      // Handled
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

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch {
      setRemainingAttempts((prev) => (prev === null ? 2 : Math.max(0, prev - 1)));
    }
  }, [code, isLoading, clearError, flow, target, role, verifyOtp, navigation]);

  const handleChangePhone = () => {
    clearError();
    navigation.goBack();
  };

  const hasError = Boolean(storeError || remainingAttempts !== null || hasExpired);

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepBadge}>
          <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            {t('auth.otp.step')}
          </Typography>
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          {t('auth.otp.title')}
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          {t('auth.otp.subtitle', { target })}
        </Typography>
      </View>

      <OtpInput
        code={code}
        length={6}
        onCodeChange={(newCode) => {
          setCode(newCode);

          if (remainingAttempts !== null) {
            setRemainingAttempts(null);
            clearError();
          }
        }}
        hasError={hasError}
      />

      {remainingAttempts !== null ? (
        <View style={styles.errorRow}>
          <AlertCircle size={16} color={THEME_COLORS.ERROR} style={styles.alertIcon} />

          <Typography variant="body2" weight="MEDIUM" color={THEME_COLORS.ERROR}>
            {t('auth.otp.errorInvalidCode', { count: remainingAttempts })}
          </Typography>
        </View>
      ) : null}

      {hasExpired ? (
        <View style={styles.warningBox}>
          <AlertTriangle size={18} color={THEME_COLORS.WARNING} style={styles.alertIcon} />

          <Typography variant="caption" color={THEME_COLORS.WARNING} style={styles.warningText}>
            {t('auth.otp.errorExpiredCode')}
          </Typography>
        </View>
      ) : null}

      <View style={styles.resendSection}>
        {countdown > 0 ? (
          <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
            {t('auth.otp.notReceived')}{' '}
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              {t('auth.otp.resendIn', { time: formatCountdown(countdown) })}
            </Typography>
          </Typography>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={isResending} activeOpacity={0.7}>
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              {t('auth.otp.resendAction')}
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.noticeBox}>
        <ShieldCheck size={18} color={THEME_COLORS.TEXT_MUTED} style={styles.noticeIcon} />

        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.noticeText}>
          {t('auth.otp.notice')}
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
          {t('auth.otp.confirm')}
        </Button>

        <TouchableOpacity
          style={styles.changePhoneButton}
          onPress={handleChangePhone}
          activeOpacity={0.7}
        >
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.TEXT_SECONDARY}>
            {t('auth.otp.changePhone')}
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
  stepBadge: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    marginBottom: SPACING_TOKENS.SM,
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
