import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, Input, ScreenContainer, Typography } from '@ui';
import { authService } from '../services';

const IDENTITY_PATTERN = /^(\d{9}|\d{12})$/;

interface LandlordVerificationScreenProps {
  onVerified?: () => void;
}

export const LandlordVerificationScreen = ({ onVerified }: LandlordVerificationScreenProps) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [identityNumber, setIdentityNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const verification = useMutation({
    mutationFn: () =>
      authService.submitLandlordVerification({
        identityNumber: identityNumber.trim(),
        streetAddress: streetAddress.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Đã hoàn tất xác minh. Bạn có thể đăng tin ngay.');
      onVerified?.();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Không thể gửi thông tin xác minh'),
  });

  const handleSubmit = () => {
    if (!IDENTITY_PATTERN.test(identityNumber.trim())) {
      setErrorMessage('Số CCCD/CMND phải gồm 9 hoặc 12 chữ số');

      return;
    }

    setErrorMessage(undefined);
    verification.mutate();
  };

  return (
    <ScreenContainer keyboardAvoiding>
      <HeaderBar title="Xác minh Chủ trọ" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.notice}>
          <ShieldAlert size={22} color={THEME_COLORS.WARNING} />
          <View style={styles.noticeText}>
            <Typography variant="body1" weight="BOLD" color={THEME_COLORS.WARNING}>
              Tài khoản đang ở trạng thái "Chờ xác minh"
            </Typography>
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              Hoàn thiện thông tin xác minh cơ bản để được phép đăng tin cho thuê.
            </Typography>
          </View>
        </View>

        <Input
          label="Số CCCD/CMND"
          value={identityNumber}
          onChangeText={(value) => setIdentityNumber(value.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={12}
          placeholder="Nhập 9 hoặc 12 chữ số"
          errorMessage={errorMessage}
        />
        <Input
          label="Địa chỉ liên hệ (không bắt buộc)"
          value={streetAddress}
          onChangeText={setStreetAddress}
          placeholder="Số nhà, tên đường"
          maxLength={255}
        />

        <Button
          title="Gửi thông tin xác minh"
          fullWidth
          isLoading={verification.isPending}
          onPress={handleSubmit}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD,
  },
  notice: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  noticeText: { flex: 1, gap: SPACING_TOKENS.XXS },
});
