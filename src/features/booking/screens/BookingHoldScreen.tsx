import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { HeaderBar, ScreenContainer, Typography } from '@ui';
import { BookingFooter, FooterButton, ResourceCard } from '../components';
import { useBookingDetail, useHoldBooking } from '../hooks';
import { formatFullPrice } from '@core';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingHold'>;

const DEFAULT_DEPOSIT = 2_500_000;

const getHoldRules = (deposit: number, price: number | undefined) => [
  {
    title: `Cọc ${formatFullPrice(deposit)}${deposit === price ? ', bằng 1 tháng tiền phòng' : ''}`,
    body: 'Khoản cọc được trừ vào tiền thuê tháng đầu khi bạn dọn vào.',
  },
  {
    title: 'Giữ chỗ có hiệu lực 7 ngày',
    body: 'Trong 7 ngày bạn phải hoàn tất thủ tục thuê với chủ trọ. Quá hạn, chủ trọ có quyền mở lại phòng.',
  },
  {
    title: 'Bạn đổi ý trong 24 giờ đầu: hoàn 100%',
    body: 'Sau 24 giờ, việc hoàn cọc do hai bên tự thoả thuận ngoài ứng dụng.',
  },
  {
    title: 'Chỉ chuyển tiền qua UniNest',
    body: 'Nếu chủ trọ yêu cầu chuyển khoản riêng, đừng chuyển và báo cáo ngay cho chúng tôi.',
  },
];

export const BookingHoldScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);
  const holdBooking = useHoldBooking();
  const toast = useToast();
  const booking = bookingQuery.data;
  const deposit = booking?.listing.deposit ?? DEFAULT_DEPOSIT;
  const landlordName = booking?.landlord?.fullName;

  const handleHold = async () => {
    try {
      await holdBooking.mutateAsync(params.id);
      toast.success('Đã tạo yêu cầu giữ chỗ trong 7 ngày');
      navigation.replace('BookingDetail', { id: params.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo yêu cầu giữ chỗ');
    }
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar title="Giữ chỗ phòng" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {booking ? (
          <ResourceCard
            resource={booking.listing}
            subtitle={
              landlordName
                ? `${booking.listing.address} · ${landlordName}`
                : booking.listing.address
            }
          />
        ) : null}
        <View style={styles.heading}>
          <Typography variant="h2" weight="SEMIBOLD" style={styles.title}>
            Trước khi giữ chỗ, đọc kỹ 4 điều này
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.description}>
            Giữ chỗ nghĩa là phòng được khoá riêng cho bạn và không hiện với sinh viên khác.
          </Typography>
        </View>
        {getHoldRules(deposit, booking?.listing.price).map((rule, index) => (
          <View key={rule.title} style={styles.rule}>
            <View style={styles.number}>
              <Typography variant="label" weight="BOLD" colorKey="PRIMARY_DARK">
                {index + 1}
              </Typography>
            </View>
            <View style={styles.ruleText}>
              <Typography variant="body2" weight="SEMIBOLD" style={styles.ruleTitle}>
                {rule.title}
              </Typography>
              <Typography variant="label" weight="REGULAR" colorKey="TEXT_MUTED">
                {rule.body}
              </Typography>
            </View>
          </View>
        ))}
      </ScrollView>
      <BookingFooter>
        <View style={styles.depositRow}>
          <View>
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              Số tiền cần cọc
            </Typography>
            <Typography variant="h3" weight="SEMIBOLD" style={styles.depositAmount}>
              {formatFullPrice(deposit)}
            </Typography>
          </View>
          <View style={styles.sandboxBadge}>
            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.WHITE}
              style={styles.badgeText}
            >
              Sandbox
            </Typography>
          </View>
        </View>
        <FooterButton
          title="Tiếp tục đặt cọc"
          isLoading={holdBooking.isPending}
          disabled={!booking || booking.status !== 'confirmed'}
          onPress={handleHold}
        />
      </BookingFooter>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: 12,
    paddingBottom: SPACING_TOKENS.LG,
  },
  heading: { gap: 8, marginTop: 8, marginBottom: 8 },
  title: { letterSpacing: -0.3 },
  description: { lineHeight: 22 },
  rule: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  number: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  ruleText: { flex: 1, gap: 4 },
  ruleTitle: { lineHeight: 22 },
  depositRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  depositAmount: { lineHeight: 22 },
  sandboxBadge: {
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
  badgeText: { fontSize: 11, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
});
