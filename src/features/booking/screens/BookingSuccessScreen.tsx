import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, Info, X } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, NoticeBanner, ScreenContainer, Typography } from '@ui';
import { BookingFooter, FooterButton, ResourceCard, StatusBadge } from '../components';
import { useBookingDetail } from '../hooks';
import { formatViewingSlot } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);
  const booking = bookingQuery.data;

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Main')}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <X size={20} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>
      {bookingQuery.isLoading ? (
        <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loader} />
      ) : booking ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.successIcon}>
              <Check size={52} strokeWidth={2.5} color={THEME_COLORS.SUCCESS} />
            </View>
            <View style={styles.heading}>
              <Typography variant="h1" weight="BOLD" align="center" style={styles.title}>
                Đã gửi yêu cầu xem phòng
              </Typography>
              <Typography
                variant="body1"
                colorKey="TEXT_SECONDARY"
                align="center"
                style={styles.description}
              >
                {`${booking.landlord?.fullName ?? 'Chủ trọ'} có `}
                <Typography
                  variant="body1"
                  weight="SEMIBOLD"
                  align="center"
                  style={styles.description}
                >
                  24 giờ
                </Typography>
                {' để xác nhận. Bạn sẽ nhận thông báo ngay khi có phản hồi.'}
              </Typography>
            </View>
            <ResourceCard
              resource={booking.listing}
              showPrice={false}
              compact
              footer={
                <View style={styles.summary}>
                  <SummaryRow label="Thời gian" value={formatViewingSlot(booking.startTime)} />
                  <SummaryRow label="Mã yêu cầu" value={`#${booking.code}`} />
                  <View style={styles.row}>
                    <Typography variant="label" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
                      Trạng thái
                    </Typography>
                    <StatusBadge status={booking.status} />
                  </View>
                </View>
              }
            />
            <NoticeBanner tone="info" icon={Info}>
              Trong lúc chờ, bạn có thể nhắn tin hỏi thêm hoặc đặt lịch xem một phòng khác — không
              giới hạn số yêu cầu.
            </NoticeBanner>
          </ScrollView>
          <BookingFooter>
            <FooterButton
              title="Xem lịch hẹn của tôi"
              onPress={() => navigation.replace('MyBookings')}
            />
            <FooterButton
              title="Tiếp tục tìm phòng"
              tone="outline"
              onPress={() => navigation.navigate('Main', { screen: 'Search' })}
            />
          </BookingFooter>
        </>
      ) : (
        <View style={styles.error}>
          <Typography align="center">Không thể tải thông tin lịch hẹn.</Typography>
          <Button title="Thử lại" onPress={() => bookingQuery.refetch()} />
        </View>
      )}
    </ScreenContainer>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Typography variant="label" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
      {label}
    </Typography>
    <Typography variant="label" weight="SEMIBOLD" align="right" style={styles.value}>
      {value}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  screen: { backgroundColor: THEME_COLORS.SURFACE },
  topBar: { height: 56, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 16 },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  loader: { flex: 1 },
  content: { gap: 24, paddingHorizontal: 16, paddingTop: 24, paddingBottom: SPACING_TOKENS.LG },
  successIcon: {
    width: 104,
    height: 104,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  heading: { gap: 8 },
  title: { letterSpacing: -0.5 },
  description: { lineHeight: 24 },
  summary: { gap: 12, paddingTop: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING_TOKENS.MD,
  },
  value: { flex: 1 },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
});
