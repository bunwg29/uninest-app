import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, ScreenContainer, Typography, BackButton } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList } from '@navigation';
import { AddressFields, EMPTY_ADDRESS, type AddressValue } from '../components/AddressFields';
import { UniversityPicker } from '../components/UniversityPicker';
import type { University } from '../services/universitiesService';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RegisterAddressRouteProp = RouteProp<AuthStackParamList, 'RegisterAddress'>;

export const RegisterAddressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegisterAddressRouteProp>();
  const { register, isLoading, error } = useAuth();
  const toast = useToast();

  const { fullName, phoneNumber, email, password, role } = route.params;

  const [address, setAddress] = useState<AddressValue>(EMPTY_ADDRESS);
  const [universities, setUniversities] = useState<University[]>([]);
  const isStudent = role !== 'landlord';

  const handleSubmit = async () => {
    if (!address.province) {
      toast.error('Vui lòng chọn Tỉnh/Thành phố');

      return;
    }

    if (!address.ward) {
      toast.error('Vui lòng chọn Phường/Xã');

      return;
    }

    try {
      await register({
        fullName,
        phoneNumber,
        email: email || undefined,
        password,
        role,
        provinceCode: address.province.code,
        wardCode: address.ward.code,
        streetAddress: address.streetAddress.trim() || undefined,
        universityCodes: isStudent ? universities.map((university) => university.code) : undefined,
      });

      toast.success(`Mã xác thực đã được gửi tới ${phoneNumber}`);

      navigation.navigate('OtpVerification', {
        target: phoneNumber,
        flow: 'register',
        role,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <BackButton onPress={() => navigation.goBack()} />

          <View style={styles.stepBadge}>
            <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              Bước 2 / 2
            </Typography>
          </View>
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Thông tin địa chỉ
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY}>
          Cung cấp địa chỉ khu vực của bạn để nhận các đề xuất và kết nối chuẩn xác nhất.
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
        {isStudent ? (
          <UniversityPicker
            label="Trường đang học"
            value={universities}
            maxSelection={1}
            helperText="Giúp UniNest gợi ý phòng gần trường của bạn"
            onChange={setUniversities}
          />
        ) : null}

        <AddressFields value={address} onChange={setAddress} />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Hoàn tất đăng ký
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.MD,
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
  submitButton: {
    marginTop: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.XL,
  },
});
