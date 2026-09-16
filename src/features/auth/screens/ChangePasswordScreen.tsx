import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ChevronLeft, Circle, HelpCircle, Lock } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Button, Input, Modal, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { authService } from '../services';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const hasMinLength = newPassword.length >= 8;
  const hasDigit = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const strengthScore = [hasMinLength, hasDigit, hasUppercase].filter(Boolean).length;
  const isDifferent = Boolean(newPassword) && newPassword !== currentPassword;
  const isMatch = Boolean(confirmPassword) && newPassword === confirmPassword;
  const isValid =
    hasMinLength && hasDigit && hasUppercase && isDifferent && isMatch && Boolean(currentPassword);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);

  const sendForgotCurrentPasswordOtp = async () => {
    const phoneNumber = user?.phoneNumber?.trim();

    if (!phoneNumber) {
      toast.error('Tài khoản chưa có số điện thoại để nhận mã OTP');

      return;
    }

    setIsSendingOtp(true);

    try {
      await authService.resendOtp(phoneNumber, 'FORGOT_PASSWORD');
      toast.success('Mã OTP đã được gửi đến số điện thoại của bạn');
      navigation.navigate('Auth', {
        screen: 'OtpVerification',
        params: {
          target: phoneNumber,
          flow: 'forgot_password',
          returnToChangePassword: true,
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi mã OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleForgotCurrentPassword = () => {
    setIsForgotModalVisible(true);
  };

  const handleConfirmForgotPassword = () => {
    setIsForgotModalVisible(false);
    sendForgotCurrentPasswordOtp();
  };

  const mutation = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword, newPassword, confirmPassword }),
    onSuccess: async () => {
      await logout();
      toast.success('Đổi mật khẩu thành công');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Login' } }],
      });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Không thể đổi mật khẩu'),
  });

  const checks = [
    ['Tối thiểu 8 ký tự', hasMinLength],
    ['Có ít nhất một chữ số', hasDigit],
    ['Có ít nhất một chữ in hoa', hasUppercase],
    ['Khác mật khẩu cũ', isDifferent],
  ] as const;

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD">
          Đổi mật khẩu
        </Typography>
        <View style={styles.headerSpace} />
      </View>
      <Input
        label="Mật khẩu hiện tại"
        isPassword
        leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TouchableOpacity
        style={styles.forgotLink}
        onPress={handleForgotCurrentPassword}
        disabled={isSendingOtp}
      >
        <HelpCircle size={16} color={THEME_COLORS.PRIMARY} />
        <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
          Quên mật khẩu hiện tại?
        </Typography>
      </TouchableOpacity>
      <Input
        label="Mật khẩu mới"
        isPassword
        leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <View style={styles.strengthRow}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[styles.strengthSegment, index < strengthScore && styles.strengthPassed]}
          />
        ))}
        <Typography
          variant="tiny"
          color={
            strengthScore >= 3
              ? THEME_COLORS.SUCCESS
              : strengthScore >= 2
                ? THEME_COLORS.WARNING
                : THEME_COLORS.ERROR
          }
        >
          {strengthScore >= 3 ? 'Mạnh' : strengthScore >= 2 ? 'Vừa' : 'Yếu'}
        </Typography>
      </View>
      <View style={styles.checklist}>
        {checks.map(([label, passed]) => (
          <View style={styles.check} key={label}>
            {passed ? (
              <Check size={16} color={THEME_COLORS.SUCCESS} />
            ) : (
              <Circle size={16} color={THEME_COLORS.BORDER} />
            )}
            <Typography
              variant="caption"
              color={passed ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_MUTED}
            >
              {label}
            </Typography>
          </View>
        ))}
      </View>
      <Input
        label="Nhập lại mật khẩu mới"
        isPassword
        leftIcon={<Lock size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        errorMessage={confirmPassword && !isMatch ? 'Hai mật khẩu không khớp nhau' : undefined}
      />
      <Typography variant="caption" color={THEME_COLORS.WARNING} style={styles.notice}>
        Sau khi đổi, bạn sẽ bị đăng xuất khỏi các thiết bị khác.
      </Typography>
      <Button
        fullWidth
        isLoading={mutation.isPending}
        disabled={!isValid}
        onPress={() => mutation.mutate()}
      >
        Cập nhật mật khẩu
      </Button>

      <Modal
        isVisible={isForgotModalVisible}
        onClose={() => setIsForgotModalVisible(false)}
        title="Quên mật khẩu hiện tại?"
        description="Bạn có muốn nhận mã OTP để đặt lại mật khẩu không?"
        cancelText="Huỷ"
        confirmText="Tiếp tục"
        onConfirm={handleConfirmForgotPassword}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING_TOKENS.LG, paddingVertical: SPACING_TOKENS.MD },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING_TOKENS.XL,
  },
  backButton: { padding: SPACING_TOKENS.XS },
  headerSpace: { width: 32 },
  forgotLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS,
    alignSelf: 'flex-end',
    marginTop: -SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  strengthPassed: { backgroundColor: THEME_COLORS.SUCCESS },
  checklist: { marginBottom: SPACING_TOKENS.MD },
  check: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS, marginBottom: 6 },
  notice: {
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    padding: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.LG,
  },
});
