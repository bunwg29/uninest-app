import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Mail, Lock } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Divider, Input, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList, RootStackParamList } from '@navigation';
import { SocialAuthButtons } from '../components';
import { useAuth } from '../hooks';
import { createLoginSchema, type LoginFormValues, type LoginIdentifierType } from '../validations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading, error, clearError } = useAuth();
  const toast = useToast();

  const [loginType, setLoginType] = useState<LoginIdentifierType>('phone');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(loginType, t)),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const handleTabChange = (type: LoginIdentifierType) => {
    setLoginType(type);
    clearError();
    reset({ identifier: '', password: '' });
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        identifier: values.identifier.trim(),
        password: values.password,
        type: loginType,
      });

      toast.success(t('auth.login.title') + ' thành công!');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const handleGoToRegister = () => {
    clearError();
    navigation.navigate('Register');
  };

  const handleGoToForgotPassword = () => {
    clearError();
    navigation.navigate('ForgotPassword');
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" weight="BOLD" style={styles.title}>
          {t('auth.login.title')}
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY}>
          {t('auth.login.subtitle')}
        </Typography>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, loginType === 'phone' && styles.tabButtonActive]}
          onPress={() => handleTabChange('phone')}
          activeOpacity={0.7}
        >
          <Typography
            variant="body2"
            weight={loginType === 'phone' ? 'SEMIBOLD' : 'MEDIUM'}
            color={loginType === 'phone' ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED}
          >
            {t('auth.login.tabPhone')}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, loginType === 'email' && styles.tabButtonActive]}
          onPress={() => handleTabChange('email')}
          activeOpacity={0.7}
        >
          <Typography
            variant="body2"
            weight={loginType === 'email' ? 'SEMIBOLD' : 'MEDIUM'}
            color={loginType === 'email' ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED}
          >
            {t('auth.login.tabEmail')}
          </Typography>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Typography variant="caption" color={THEME_COLORS.ERROR}>
            {error}
          </Typography>
        </View>
      ) : null}

      <View style={styles.form}>
        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={
                loginType === 'phone' ? t('auth.login.phoneLabel') : t('auth.login.emailLabel')
              }
              placeholder={
                loginType === 'phone'
                  ? t('auth.login.phonePlaceholder')
                  : t('auth.login.emailPlaceholder')
              }
              keyboardType={loginType === 'phone' ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
              leftIcon={
                loginType === 'phone' ? (
                  <Phone size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
                ) : (
                  <Mail size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
                )
              }
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.identifier?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.login.passwordLabel')}
              placeholder={t('auth.login.passwordPlaceholder')}
              isPassword
              autoCapitalize="none"
              leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handleGoToForgotPassword}
          activeOpacity={0.7}
        >
          <Typography variant="body2" weight="MEDIUM" color={THEME_COLORS.PRIMARY}>
            {t('auth.login.forgotPassword')}
          </Typography>
        </TouchableOpacity>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        >
          {t('auth.login.submit')}
        </Button>
      </View>

      <Divider label={t('auth.login.orDivider')} style={styles.divider} />

      <SocialAuthButtons
        onGooglePress={() => toast.info('Đăng nhập Google đang phát triển')}
        onApplePress={() => toast.info('Đăng nhập Apple đang phát triển')}
      />

      <View style={styles.footer}>
        <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
          {t('auth.login.noAccount')}
        </Typography>

        <TouchableOpacity
          onPress={handleGoToRegister}
          activeOpacity={0.7}
          style={styles.registerLink}
        >
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            {t('auth.login.registerNow')}
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
    marginTop: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.LG,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: 4,
    marginBottom: SPACING_TOKENS.LG,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING_TOKENS.SM,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  tabButtonActive: {
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginVertical: SPACING_TOKENS.XS,
  },
  submitButton: {
    marginTop: SPACING_TOKENS.MD,
  },
  divider: {
    marginVertical: SPACING_TOKENS.LG,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING_TOKENS.XL,
    marginBottom: SPACING_TOKENS.LG,
  },
  registerLink: {
    marginLeft: 4,
  },
});
