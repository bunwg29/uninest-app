import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, Clock3, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppError } from '@core';
import { useAuthStore } from '@features/auth';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, Input, ScreenContainer, Typography } from '@ui';
import { ResourceCard } from '../components';
import { useCreateBooking } from '../hooks';
import { useBookingStore } from '../store';
import { formatBookingDateTime } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BookingConfirmScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { resource, selectedSlot } = useBookingStore();
  const user = useAuthStore((state) => state.user);
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [note, setNote] = useState('');
  const [isAccepted, setIsAccepted] = useState(true);
  const [phoneError, setPhoneError] = useState('');
  const createBooking = useCreateBooking();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!/^0\d{9}$/.test(phone)) {
      setPhoneError('Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số');

      return;
    }

    if (!resource || !selectedSlot || !isAccepted) return;

    setPhoneError('');

    try {
      const booking = await createBooking.mutateAsync({
        listingId: resource.id,
        startTime: selectedSlot.startTime,
        phone,
        note: note.trim() || undefined,
      });

      navigation.replace('BookingSuccess', { id: booking.id });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 409) {
        toast.error('Khung giờ vừa có người đặt, vui lòng chọn khung giờ khác');

        return;
      }

      toast.error(error instanceof Error ? error.message : 'Không thể gửi yêu cầu xem phòng');
    }
  };

  if (!resource || !selectedSlot) {
    return (
      <ScreenContainer>
        <HeaderBar title="Xác nhận yêu cầu" onBack={() => navigation.goBack()} />
        <View style={styles.missingState}>
          <Typography align="center">Bạn chưa chọn thời gian xem phòng.</Typography>
          <Button title="Quay lại chọn lịch" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <HeaderBar title="Xác nhận yêu cầu" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ResourceCard resource={resource} />
        <View style={styles.infoBox}>
          <View style={styles.iconCircle}>
            <Clock3 size={20} color={THEME_COLORS.PRIMARY} />
          </View>
          <View style={styles.flex}>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              Thời gian
            </Typography>
            <Typography variant="body1" weight="BOLD">
              {formatBookingDateTime(selectedSlot.startTime)}
            </Typography>
          </View>
        </View>
        <Input
          label="Số điện thoại liên hệ"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
          errorMessage={phoneError}
          placeholder="0905 123 456"
        />
        <View style={styles.freeBox}>
          <ShieldCheck size={20} color={THEME_COLORS.SUCCESS} />
          <Typography variant="body2" colorKey="SUCCESS" style={styles.flex}>
            Chỉ trả phí khi bạn xác nhận giữ phòng
          </Typography>
        </View>
        <Input
          label="Ghi chú cho chủ trọ"
          value={note}
          onChangeText={setNote}
          maxLength={300}
          multiline
          placeholder="Ví dụ: Mình muốn xem phòng vào đúng giờ đã chọn..."
          helperText={`${note.length}/300 ký tự`}
        />
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setIsAccepted((value) => !value)}
        >
          <View style={[styles.checkbox, isAccepted && styles.checked]}>
            {isAccepted ? <Check size={15} color={THEME_COLORS.WHITE} /> : null}
          </View>
          <Typography variant="body2" style={styles.flex}>
            Tôi hiểu đặt lịch xem phòng hoàn toàn miễn phí
          </Typography>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Gửi yêu cầu xem phòng"
          fullWidth
          disabled={!isAccepted}
          isLoading={createBooking.isPending}
          onPress={handleSubmit}
        />
        <Button
          title="Tiếp tục tìm phòng"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('Main', { screen: 'Search' })}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.LG },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  iconCircle: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  flex: { flex: 1 },
  freeBox: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    alignItems: 'center',
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  checked: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY },
  footer: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.XS,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  missingState: {
    flex: 1,
    padding: SPACING_TOKENS.XL,
    gap: SPACING_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
