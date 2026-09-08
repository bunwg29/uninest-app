import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, Circle, Lock } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Input, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList } from '@navigation';
import { authService } from '../services';
import { createResetPasswordSchema } from '../validations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type ResetRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResetRouteProp>();
  const toast = useToast();

  const target = route.params?.target || '';
  const otpCode = route.params?.otpCode || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMinLength = newPassword.length >= 8;
  const hasDigit = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const isMatch = Boolean(confirmPassword && newPassword === confirmPassword);

  const passedCount = [hasMinLength, hasDigit, hasUppercase].filter(Boolean).length;
  const isAllValid = hasMinLength && hasDigit && hasUppercase && isMatch;

  const handleSubmit = async () => {
    const schema = createResetPasswordSchema(t);
    const result = schema.safeParse({ newPassword, confirmPassword });

    if (!result.success) {
      const msg = result.error.errors[0]?.message || t('common.error');

      setErrorMessage(msg);
      toast.error(msg);

      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.resetPassword({
        phoneNumber: target,
        otpCode,
        newPassword,
      });

      toast.success(t('auth.resetPassword.title') + ' thành công!');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch {
      setErrorMessage(t('common.error'));
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" weight="BOLD" style={styles.title}>
          {t('auth.resetPassword.title')}
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          {t('auth.resetPassword.subtitle')}
        </Typography>
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Typography variant="caption" color={THEME_COLORS.ERROR}>
            {errorMessage}
          </Typography>
        </View>
      ) : null}

      <View style={styles.form}>
        <Input
          label={t('auth.resetPassword.newPasswordLabel')}
          placeholder={t('auth.resetPassword.passwordPlaceholder')}
          isPassword
          autoCapitalize="none"
          leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <View style={styles.strengthBarContainer}>
          <View
            style={[
              styles.strengthSegment,
              passedCount >= 1 && { backgroundColor: THEME_COLORS.SUCCESS },
            ]}
          />

          <View
            style={[
              styles.strengthSegment,
              passedCount >= 2 && { backgroundColor: THEME_COLORS.SUCCESS },
            ]}
          />

          <View
            style={[
              styles.strengthSegment,
              passedCount >= 3 && { backgroundColor: THEME_COLORS.SUCCESS },
            ]}
          />

          <Typography
            variant="tiny"
            weight="MEDIUM"
            color={passedCount >= 2 ? THEME_COLORS.SUCCESS : THEME_COLORS.WARNING}
            style={styles.strengthText}
          >
            {passedCount >= 3
              ? t('auth.resetPassword.strengthStrong')
              : t('auth.resetPassword.strengthMedium')}
          </Typography>
        </View>

        <View style={styles.checklist}>
          <View style={styles.checkItem}>
            {hasMinLength ? (
              <Check size={16} color={THEME_COLORS.SUCCESS} />
            ) : (
              <Circle size={16} color={THEME_COLORS.BORDER} />
            )}

            <Typography
              variant="caption"
              color={hasMinLength ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_MUTED}
              style={styles.checkText}
            >
              {t('auth.resetPassword.ruleMinLength')}
            </Typography>
          </View>

          <View style={styles.checkItem}>
            {hasDigit ? (
              <Check size={16} color={THEME_COLORS.SUCCESS} />
            ) : (
              <Circle size={16} color={THEME_COLORS.BORDER} />
            )}

            <Typography
              variant="caption"
              color={hasDigit ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_MUTED}
              style={styles.checkText}
            >
              {t('auth.resetPassword.ruleDigit')}
            </Typography>
          </View>

          <View style={styles.checkItem}>
            {hasUppercase ? (
              <Check size={16} color={THEME_COLORS.SUCCESS} />
            ) : (
              <Circle size={16} color={THEME_COLORS.BORDER} />
            )}

            <Typography
              variant="caption"
              color={hasUppercase ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_MUTED}
              style={styles.checkText}
            >
              {t('auth.resetPassword.ruleUppercase')}
            </Typography>
          </View>
        </View>

        <Input
          label={t('auth.resetPassword.confirmPasswordLabel')}
          placeholder={t('auth.resetPassword.passwordPlaceholder')}
          isPassword
          autoCapitalize="none"
          leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {confirmPassword ? (
          <View style={styles.checkItem}>
            {isMatch ? (
              <Check size={16} color={THEME_COLORS.SUCCESS} />
            ) : (
              <Circle size={16} color={THEME_COLORS.ERROR} />
            )}

            <Typography
              variant="caption"
              color={isMatch ? THEME_COLORS.SUCCESS : THEME_COLORS.ERROR}
              style={styles.checkText}
            >
              {t('auth.resetPassword.ruleMatch')}
            </Typography>
          </View>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isAllValid}
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {t('auth.resetPassword.submit')}
        </Button>
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
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  subtitle: {
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  form: {
    width: '100%',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.XS,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  strengthText: {
    marginLeft: SPACING_TOKENS.XS,
  },
  checklist: {
    marginBottom: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.XS,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkText: {
    marginLeft: SPACING_TOKENS.XS,
  },
  submitButton: {
    marginTop: SPACING_TOKENS.LG,
  },
});
