import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyRound, Phone } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Input, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList } from '@navigation';
import { authService } from '../services';
import { createForgotPasswordSchema } from '../validations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanPhone = phoneNumber.trim();
    const schema = createForgotPasswordSchema(t);
    const result = schema.safeParse({ phoneNumber: cleanPhone });

    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || t('auth.validation.phoneInvalid'));

      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ phoneNumber: cleanPhone });

      toast.success(t('auth.otp.subtitle', { target: cleanPhone }));

      navigation.navigate('OtpVerification', {
        target: cleanPhone,
        flow: 'forgot_password',
      });
    } catch {
      setErrorMessage(t('common.error'));
      toast.error(t('common.error'));
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
          {t('auth.forgotPassword.title')}
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          {t('auth.forgotPassword.subtitle')}
        </Typography>

        <View style={styles.form}>
          <Input
            label={t('auth.forgotPassword.phoneLabel')}
            placeholder={t('auth.forgotPassword.phonePlaceholder')}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            helperText={t('auth.forgotPassword.phoneHint')}
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
            {t('auth.forgotPassword.submit')}
          </Button>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
            activeOpacity={0.7}
          >
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.TEXT_MUTED}>
              {t('auth.forgotPassword.backToLogin')}
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
