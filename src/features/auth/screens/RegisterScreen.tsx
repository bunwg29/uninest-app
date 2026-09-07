import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, Lock, CheckSquare, Square } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Badge, Button, Input, ScreenContainer, Typography } from '@ui';
import type { AuthStackParamList } from '@navigation';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;

const createRegisterSchema = (t: (key: string) => string) => {
  return z.object({
    fullName: z.string().min(2, t('auth.validation.fullNameRequired')),
    phoneNumber: z
      .string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(/^[0-9]{10}$/, t('auth.validation.phoneInvalid')),
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z
      .string()
      .min(8, t('auth.validation.passwordMinLength'))
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, t('auth.validation.passwordPattern')),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: t('auth.validation.termsRequired'),
    }),
  });
};

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegisterRouteProp>();
  const { register, role: currentRole, isLoading, error } = useAuth();

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const role = route.params?.role || currentRole || 'student';

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      termsAccepted: false,
    },
  });

  const handleToggleTerms = () => {
    const nextState = !isTermsAccepted;

    setIsTermsAccepted(nextState);
    setValue('termsAccepted', nextState as true, { shouldValidate: true });
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email.trim(),
        password: values.password,
        role,
      });

      navigation.navigate('OtpVerification', {
        target: values.phoneNumber.trim(),
        flow: 'register',
        role,
      });
    } catch {
      // Error handled in store
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepBadge}>
          <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            {t('auth.register.step')}
          </Typography>
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          {t('auth.register.title')}
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY}>
          {t('auth.register.subtitle')}
        </Typography>
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
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.fullNameLabel')}
              placeholder={t('auth.register.fullNamePlaceholder')}
              autoCapitalize="words"
              leftIcon={<User size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.fullName?.message}
            />
          )}
        />

        <View style={styles.phoneFieldWrapper}>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.register.phoneLabel')}
                placeholder={t('auth.register.phonePlaceholder')}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.phoneNumber?.message}
              />
            )}
          />

          <View style={styles.phoneBadgeContainer}>
            <Badge variant="available" size="sm" label={t('auth.register.phoneBadge')} />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.emailLabel')}
              placeholder={t('auth.register.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.register.passwordLabel')}
              placeholder={t('auth.register.passwordPlaceholder')}
              isPassword
              autoCapitalize="none"
              leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              helperText={t('auth.register.passwordHint')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity style={styles.termsRow} onPress={handleToggleTerms} activeOpacity={0.7}>
          <View style={styles.checkboxWrapper}>
            {isTermsAccepted ? (
              <CheckSquare size={20} color={THEME_COLORS.PRIMARY} />
            ) : (
              <Square size={20} color={THEME_COLORS.TEXT_MUTED} />
            )}
          </View>

          <Typography variant="body2" color={THEME_COLORS.TEXT_SECONDARY} style={styles.termsText}>
            {t('auth.register.termsAgreement')}{' '}
            <Typography variant="body2" weight="MEDIUM" color={THEME_COLORS.PRIMARY}>
              {t('auth.register.termsOfService')}
            </Typography>{' '}
            {t('auth.register.and')}{' '}
            <Typography variant="body2" weight="MEDIUM" color={THEME_COLORS.PRIMARY}>
              {t('auth.register.privacyPolicy')}
            </Typography>
          </Typography>
        </TouchableOpacity>

        {errors.termsAccepted ? (
          <Typography variant="tiny" color={THEME_COLORS.ERROR} style={styles.termsError}>
            {errors.termsAccepted.message}
          </Typography>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        >
          {t('auth.register.submit')}
        </Button>
      </View>

      <View style={styles.footer}>
        <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
          {t('auth.register.hasAccount')}{' '}
        </Typography>

        <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.7}>
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            {t('auth.register.loginNow')}
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
  errorBanner: {
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  form: {
    width: '100%',
  },
  phoneFieldWrapper: {
    position: 'relative',
  },
  phoneBadgeContainer: {
    position: 'absolute',
    top: 2,
    right: 0,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.XS,
  },
  checkboxWrapper: {
    marginRight: SPACING_TOKENS.SM,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    lineHeight: 20,
  },
  termsError: {
    marginBottom: SPACING_TOKENS.SM,
    marginLeft: SPACING_TOKENS.MD,
  },
  submitButton: {
    marginTop: SPACING_TOKENS.MD,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING_TOKENS.XL,
    marginBottom: SPACING_TOKENS.LG,
  },
});
