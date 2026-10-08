import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDays, Clock3, Phone, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppError } from '@core';
import { useAuthStore } from '@features/auth';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  HeaderBar,
  Input,
  ScreenContainer,
  Typography,
  KeyboardAwareScrollView,
  NoticeBanner,
} from '@ui';
import { BookingFooter, BookingStepper, FooterButton, ResourceCard } from '../components';
import { useCreateBooking } from '../hooks';
import { useBookingStore } from '../store';
import { formatViewingLong } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_NOTE_LENGTH = 300;

export const BookingConfirmScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { resource, selectedSlot } = useBookingStore();
  const user = useAuthStore((state) => state.user);
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [note, setNote] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const createBooking = useCreateBooking();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!/^0\d{9}$/.test(phone)) {
      setPhoneError('Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số');

      return;
    }

    if (!resource || !selectedSlot) return;

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
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <BookingStepper step={3} />
        <View style={styles.body}>
          <ResourceCard
            resource={resource}
            showPrice={false}
            footer={
              <View style={styles.infoRows}>
                <InfoRow
                  icon={<CalendarDays size={19} color={THEME_COLORS.PRIMARY_DARK} />}
                  label="Thời gian"
                  value={formatViewingLong(selectedSlot.startTime)}
                />
                {resource.landlordName ? (
                  <InfoRow
                    icon={<User size={19} color={THEME_COLORS.PRIMARY_DARK} />}
                    label="Chủ trọ"
                    value={resource.landlordName}
                  />
                ) : null}
              </View>
            }
          />
          <View style={styles.field}>
            <Typography variant="body2" weight="SEMIBOLD" style={styles.fieldLabel}>
              Số điện thoại liên hệ
            </Typography>
            <Input
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              errorMessage={phoneError}
              placeholder="0905 123 456"
              idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
              leftIcon={<Phone size={19} color={THEME_COLORS.TEXT_MUTED} />}
              containerStyle={styles.input}
              inputContainerStyle={styles.phoneInput}
              style={styles.inputText}
            />
            {phoneError ? null : (
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Chủ trọ chỉ thấy số này sau khi xác nhận lịch hẹn.
              </Typography>
            )}
          </View>
          <View style={styles.field}>
            <Typography variant="body2" weight="SEMIBOLD" style={styles.fieldLabel}>
              {'Ghi chú cho chủ trọ '}
              <Typography variant="body2" colorKey="TEXT_PLACEHOLDER">
                (không bắt buộc)
              </Typography>
            </Typography>
            <Input
              value={note}
              onChangeText={setNote}
              maxLength={MAX_NOTE_LENGTH}
              multiline
              placeholder="Ví dụ: Mình muốn xem phòng vào đúng giờ đã chọn..."
              idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
              containerStyle={styles.input}
              inputContainerStyle={styles.noteInput}
              style={styles.inputText}
            />
            <View style={styles.noteMeta}>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Đừng ghi số tài khoản ngân hàng ở đây
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                {`${note.length} / ${MAX_NOTE_LENGTH}`}
              </Typography>
            </View>
          </View>
          <NoticeBanner tone="warning" icon={Clock3}>
            Đặt lịch xem phòng hoàn toàn miễn phí. Bạn chưa phải trả bất kỳ khoản nào ở bước này.
          </NoticeBanner>
        </View>
      </KeyboardAwareScrollView>
      <BookingFooter>
        <FooterButton
          title="Gửi yêu cầu xem phòng"
          isLoading={createBooking.isPending}
          onPress={handleSubmit}
        />
      </BookingFooter>
    </ScreenContainer>
  );
};

const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconTile}>{icon}</View>
    <View style={styles.flex}>
      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
        {label}
      </Typography>
      <Typography variant="body2" weight="SEMIBOLD" style={styles.infoValue}>
        {value}
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: { paddingBottom: SPACING_TOKENS.LG },
  body: { gap: 20, paddingHorizontal: 16, paddingTop: 20 },
  infoRows: { gap: 14, paddingTop: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  flex: { flex: 1 },
  infoValue: { lineHeight: 22 },
  field: { gap: 8 },
  fieldLabel: { lineHeight: 22 },
  input: { marginBottom: 0 },
  phoneInput: { height: 52, borderRadius: BORDER_RADIUS_TOKENS.MD },
  noteInput: { minHeight: 96, paddingHorizontal: 14, paddingVertical: 12 },
  inputText: { fontSize: 15, lineHeight: 22 },
  noteMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  missingState: {
    flex: 1,
    padding: SPACING_TOKENS.XL,
    gap: SPACING_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
