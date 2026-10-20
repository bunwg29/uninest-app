import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Mail, Lock, CheckSquare, Square } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Badge, Button, Input, ScreenContainer, Typography } from '@ui';
import type { AuthStackParamList } from '@navigation';
import { useAuth } from '../hooks';
import { registerSchema, type RegisterFormValues } from '../validations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegisterRouteProp>();
  const { role: currentRole, error } = useAuth();

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const role = route.params?.role || currentRole || 'student';

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = (values: RegisterFormValues) => {
    navigation.navigate('RegisterAddress', {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      email: values.email.trim(),
      password: values.password,
      role,
    });
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepBadge}>
            <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              Bước 1 / 2
            </Typography>
          </View>
          <Badge
            variant={role === 'landlord' ? 'holding' : 'primary'}
            size="sm"
            label={role === 'landlord' ? 'Vai trò: Chủ trọ' : 'Vai trò: Sinh viên'}
          />
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Tạo tài khoản
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY}>
          Chỉ mất chưa tới một phút.
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
              label="Họ và tên"
              placeholder="Nguyễn Xuân Hoài"
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
                label="Số điện thoại"
                placeholder="0905 123 456"
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
            <Badge variant="available" size="sm" label="Sẽ nhận OTP" />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="nguyenvana@gmail.com"
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
              label="Mật khẩu"
              placeholder="••••••••"
              isPassword
              autoCapitalize="none"
              leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              helperText="Tối thiểu 8 ký tự, có cả chữ và số"
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
            Tôi đồng ý với{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Terms', { tab: 'terms' })}
            >
              Điều khoản sử dụng
            </Text>{' '}
            và{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Terms', { tab: 'privacy' })}
            >
              Chính sách quyền riêng tư của UniNest.
            </Text>
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
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        >
          Tiếp tục
        </Button>
      </View>

      <View style={styles.footer}>
        <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
          Đã có tài khoản?
        </Typography>

        <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.7} style={styles.loginLink}>
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            Đăng nhập
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
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
  linkText: {
    color: THEME_COLORS.PRIMARY,
    fontWeight: '500',
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
  loginLink: {
    marginLeft: 4,
  },
});
