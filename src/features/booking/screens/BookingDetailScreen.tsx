import { Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Check, Circle, Clock3, MapPin, TriangleAlert } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { ResourceCard, StatusBadge } from '../components';
import { useBookingDetail, useCancelBooking } from '../hooks';
import { formatBookingDateTime, getHoursUntil } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;

export const BookingDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);
  const cancelBooking = useCancelBooking();
  const toast = useToast();
  const booking = bookingQuery.data;

  const cancelWithoutReason = async () => {
    if (!booking) return;

    try {
      await cancelBooking.mutateAsync({ id: booking.id });
      toast.success('Đã hủy lịch hẹn');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hủy lịch hẹn');
    }
  };

  const handleCancel = () => {
    if (!booking) return;

    if (getHoursUntil(booking.startTime) < 24) {
      navigation.navigate('CancelBooking', { id: booking.id });

      return;
    }

    if (Platform.OS === 'web') {
      if (globalThis.confirm('Hủy lịch hẹn? Bạn có thể đặt lại nếu khung giờ vẫn còn trống.')) {
        void cancelWithoutReason();
      }

      return;
    }

    Alert.alert('Hủy lịch hẹn?', 'Bạn có thể đặt lại nếu khung giờ vẫn còn trống.', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lịch',
        style: 'destructive',
        onPress: cancelWithoutReason,
      },
    ]);
  };

  const handleAddCalendar = async () => {
    if (!booking) return;

    const formatGoogleDate = (value: string) =>
      new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Xem phòng ${booking.listing.title}`)}&dates=${formatGoogleDate(booking.startTime)}/${formatGoogleDate(booking.endTime)}&location=${encodeURIComponent(booking.listing.address)}`;

    await Linking.openURL(url);
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar title="Chi tiết lịch hẹn" onBack={() => navigation.goBack()} />
      {!booking ? (
        <View style={styles.center}>
          <Typography>Không thể tải chi tiết lịch hẹn.</Typography>
          <Button title="Thử lại" onPress={() => bookingQuery.refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.banner,
              booking.status === 'confirmed' ? styles.successBanner : styles.warningBanner,
            ]}
          >
            {booking.status === 'confirmed' ? (
              <Check size={22} color={THEME_COLORS.SUCCESS} />
            ) : (
              <TriangleAlert size={22} color={THEME_COLORS.WARNING} />
            )}
            <View style={styles.flex}>
              <Typography
                variant="body1"
                weight="BOLD"
                colorKey={booking.status === 'confirmed' ? 'SUCCESS' : 'WARNING'}
              >
                {booking.status === 'confirmed'
                  ? 'Cả 2 bên đã xác nhận'
                  : booking.status === 'cancelled'
                    ? 'Đã hủy'
                    : booking.status === 'expired'
                      ? 'Yêu cầu đã hết hạn'
                      : 'Đang chờ xác nhận'}
              </Typography>
              {booking.cancelReason ? (
                <Typography variant="caption" colorKey="TEXT_SECONDARY">
                  Lý do: {booking.cancelReason}
                </Typography>
              ) : null}
            </View>
          </View>
          <View style={styles.timeline}>
            <TimelineStep
              label="Gửi yêu cầu"
              value={formatBookingDateTime(booking.createdAt)}
              completed
            />
            <TimelineStep
              label="Chủ trọ xác nhận"
              value={
                booking.confirmedAt
                  ? formatBookingDateTime(booking.confirmedAt)
                  : 'Đang chờ phản hồi'
              }
              completed={Boolean(booking.confirmedAt)}
            />
            <TimelineStep
              label={
                booking.status === 'cancelled' || booking.status === 'expired'
                  ? 'Hủy — không có phản hồi'
                  : 'Xem phòng trực tiếp'
              }
              value={formatBookingDateTime(booking.startTime)}
              completed={false}
            />
          </View>
          <ResourceCard resource={booking.listing} />
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Clock3 size={18} color={THEME_COLORS.PRIMARY} />
              <View style={styles.flex}>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  Thời gian
                </Typography>
                <Typography variant="body2" weight="BOLD">
                  {formatBookingDateTime(booking.startTime)}
                </Typography>
              </View>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={18} color={THEME_COLORS.PRIMARY} />
              <View style={styles.flex}>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  Địa chỉ
                </Typography>
                <Typography variant="body2" weight="BOLD">
                  {booking.listing.address}
                </Typography>
              </View>
            </View>
            <View style={styles.codeRow}>
              <Typography variant="body2" colorKey="TEXT_MUTED">
                Mã yêu cầu
              </Typography>
              <Typography variant="body2" weight="BOLD">
                #{booking.code}
              </Typography>
            </View>
            <StatusBadge status={booking.status} />
          </View>
          {booking.status === 'cancelled' || booking.status === 'expired' ? (
            <View style={styles.similarBox}>
              <Typography variant="body1" weight="BOLD">
                Phòng tương tự đang còn trống
              </Typography>
              <Typography variant="body2" colorKey="TEXT_MUTED">
                Khám phá thêm các phòng phù hợp gần khu vực này.
              </Typography>
              <Button
                title="Xem phòng khác"
                variant="outline"
                onPress={() => navigation.navigate('Main', { screen: 'Search' })}
              />
            </View>
          ) : (
            <View style={styles.actions}>
              <Button
                title="Thêm vào lịch"
                variant="outline"
                onPress={handleAddCalendar}
                style={styles.actionButton}
              />
              <Button
                title="Hủy lịch hẹn"
                variant="danger"
                disabled={getHoursUntil(booking.startTime) <= 0}
                onPress={handleCancel}
                style={styles.actionButton}
              />
              {booking.status === 'pending' ? (
                <Button
                  title="Giữ chỗ phòng này"
                  onPress={() => navigation.navigate('BookingHold', { id: booking.id })}
                  fullWidth
                />
              ) : null}
            </View>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const TimelineStep = ({
  label,
  value,
  completed,
}: {
  label: string;
  value: string;
  completed: boolean;
}) => (
  <View style={styles.timelineRow}>
    <View style={[styles.timelineIcon, completed && styles.timelineCompleted]}>
      {completed ? (
        <Check size={14} color={THEME_COLORS.WHITE} />
      ) : (
        <Circle size={14} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      )}
    </View>
    <View style={styles.flex}>
      <Typography variant="body2" weight="BOLD">
        {label}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        {value}
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  banner: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  successBanner: { backgroundColor: THEME_COLORS.SUCCESS_LIGHT },
  warningBanner: { backgroundColor: THEME_COLORS.WARNING_LIGHT },
  flex: { flex: 1 },
  timeline: {
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  timelineRow: { flexDirection: 'row', gap: SPACING_TOKENS.MD },
  timelineIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  timelineCompleted: { backgroundColor: THEME_COLORS.SUCCESS },
  details: {
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  detailRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  actionButton: { flex: 1 },
  similarBox: {
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
});
