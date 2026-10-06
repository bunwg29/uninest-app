import { ScrollView, StyleSheet, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { ResourceCard } from '../components';
import { useBookingDetail, useHoldBooking } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingHold'>;

const getHoldRules = (deposit: number) => [
  `Khoản cọc dự kiến là ${deposit.toLocaleString('vi-VN')} ₫ theo mức cọc của phòng.`,
  'Yêu cầu giữ chỗ có hiệu lực trong 7 ngày kể từ lúc xác nhận.',
  'Bạn được hoàn 100% nếu hủy trong 24 giờ đầu và chưa nhận phòng.',
  'Chỉ thanh toán qua cổng sandbox của UniNest, không chuyển khoản bên ngoài.',
];

export const BookingHoldScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);
  const holdBooking = useHoldBooking();
  const toast = useToast();
  const deposit = bookingQuery.data?.listing.deposit ?? 2_500_000;

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
      <HeaderBar title="Giữ chỗ" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {bookingQuery.data ? <ResourceCard resource={bookingQuery.data.listing} /> : null}
        <View style={styles.titleRow}>
          <ShieldCheck size={28} color={THEME_COLORS.PRIMARY} />
          <Typography variant="h2" weight="BOLD" style={styles.flex}>
            Trước khi giữ chỗ, đọc kỹ 4 điều này
          </Typography>
        </View>
        <View style={styles.rules}>
          {getHoldRules(deposit).map((rule, index) => (
            <View key={rule} style={styles.ruleRow}>
              <View style={styles.number}>
                <Typography variant="body2" weight="BOLD" color={THEME_COLORS.WHITE}>
                  {index + 1}
                </Typography>
              </View>
              <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.flex}>
                {rule}
              </Typography>
            </View>
          ))}
        </View>
        <View style={styles.summary}>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Số tiền cọc
          </Typography>
          <Typography variant="h1" weight="BOLD" colorKey="PRIMARY">
            {deposit.toLocaleString('vi-VN')} ₫
          </Typography>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            Thanh toán sandbox — không phát sinh giao dịch tiền thật.
          </Typography>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Tiếp tục đặt cọc"
          fullWidth
          isLoading={holdBooking.isPending}
          disabled={!bookingQuery.data || bookingQuery.data.status !== 'confirmed'}
          onPress={handleHold}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.LG,
    paddingBottom: SPACING_TOKENS.XL,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.MD },
  flex: { flex: 1 },
  rules: { gap: SPACING_TOKENS.MD },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING_TOKENS.MD },
  number: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  summary: {
    gap: SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.LG,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  footer: {
    padding: SPACING_TOKENS.MD,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
