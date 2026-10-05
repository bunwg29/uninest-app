import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { ResourceCard, StatusBadge } from '../components';
import { useBookingDetail } from '../hooks';
import { formatBookingDateTime } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);

  return (
    <ScreenContainer>
      <HeaderBar title="Yêu cầu xem phòng" />
      {bookingQuery.isLoading ? (
        <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loader} />
      ) : bookingQuery.data ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.successIcon}>
              <Check size={38} strokeWidth={3} color={THEME_COLORS.WHITE} />
            </View>
            <Typography variant="h1" weight="BOLD" align="center">
              Đã gửi yêu cầu xem phòng
            </Typography>
            <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
              Chủ trọ sẽ phản hồi yêu cầu của bạn trong thời gian sớm nhất.
            </Typography>
            <ResourceCard resource={bookingQuery.data.listing} />
            <View style={styles.summary}>
              <SummaryRow
                label="Thời gian"
                value={formatBookingDateTime(bookingQuery.data.startTime)}
              />
              <SummaryRow label="Mã yêu cầu" value={`#${bookingQuery.data.code}`} />
              <View style={styles.row}>
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  Trạng thái
                </Typography>
                <StatusBadge status={bookingQuery.data.status} />
              </View>
            </View>
            <View style={styles.infoBox}>
              <Typography variant="body2" colorKey="TEXT_SECONDARY">
                Bạn không cần thanh toán khi đặt lịch. Hãy trao đổi với chủ trọ qua UniNest để bảo
                đảm an toàn.
              </Typography>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Button
              title="Xem lịch hẹn của tôi"
              fullWidth
              onPress={() => navigation.replace('MyBookings')}
            />
            <Button
              title="Tiếp tục tìm phòng"
              fullWidth
              variant="ghost"
              onPress={() => navigation.navigate('Main', { screen: 'Search' })}
            />
          </View>
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
    <Typography variant="body2" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="body2" weight="BOLD" style={styles.value}>
      {value}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  loader: { flex: 1 },
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD },
  successIcon: {
    width: 76,
    height: 76,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: THEME_COLORS.SUCCESS,
  },
  summary: {
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING_TOKENS.MD,
  },
  value: { flex: 1, textAlign: 'right' },
  infoBox: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  footer: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.XS,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
});
