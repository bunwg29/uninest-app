import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { CheckCircle2, Copy, TimerOff } from 'lucide-react-native';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, EmptyState, HeaderBar, ScreenContainer, Typography } from '@ui';
import { PremiumError, PremiumSkeleton } from '../components';
import { usePremiumOrder, usePremiumStatus } from '../hooks';
import { formatCountdown, formatFullDate, formatVnd } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PremiumPayment'>;
type PaymentRoute = RouteProp<RootStackParamList, 'PremiumPayment'>;

const QR_SIZE = 220;

interface CopyRowProps {
  label: string;
  value: string;
  onCopy: (label: string, value: string) => void;
}

const CopyRow = ({ label, value, onCopy }: CopyRowProps) => (
  <View style={styles.infoRow}>
    <View style={styles.infoBody}>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        {label}
      </Typography>
      <Typography variant="body1" weight="SEMIBOLD">
        {value}
      </Typography>
    </View>
    <TouchableOpacity
      onPress={() => onCopy(label, value)}
      hitSlop={SPACING_TOKENS.SM}
      accessibilityRole="button"
      accessibilityLabel={`Sao chép ${label}`}
    >
      <Copy size={18} color={THEME_COLORS.PRIMARY} />
    </TouchableOpacity>
  </View>
);

export const PremiumPaymentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentRoute>();
  const toast = useToast();
  const orderQuery = usePremiumOrder(route.params.orderId);
  const statusQuery = usePremiumStatus();
  const [now, setNow] = useState(() => Date.now());

  const order = orderQuery.data;
  const isPending = order?.status === 'pending';

  useEffect(() => {
    if (!isPending) return undefined;

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, [isPending]);

  const handleCopy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    toast.info(`Đã sao chép ${label.toLowerCase()}`);
  };

  const renderContent = () => {
    if (orderQuery.isLoading) return <PremiumSkeleton />;

    if (orderQuery.isError || !order) return <PremiumError onRetry={() => orderQuery.refetch()} />;

    if (order.status === 'paid') {
      const expiresAt = statusQuery.data?.expiresAt;

      return (
        <EmptyState
          title="Thanh toán thành công"
          description={
            expiresAt
              ? `Gói Premium của bạn có hiệu lực đến ${formatFullDate(expiresAt)}.`
              : 'Gói Premium của bạn đã được kích hoạt.'
          }
          icon={<CheckCircle2 size={40} color={THEME_COLORS.SUCCESS} />}
          actionTitle="Xem thống kê nâng cao"
          onAction={() => navigation.replace('PremiumStats')}
        />
      );
    }

    const remaining = new Date(order.expiresAt).getTime() - now;

    if (order.status === 'expired' || remaining <= 0) {
      return (
        <EmptyState
          title="Đơn thanh toán đã hết hạn"
          description="Nếu bạn đã chuyển khoản, hệ thống vẫn sẽ kích hoạt khi nhận được tiền. Nếu chưa, hãy tạo đơn mới."
          icon={<TimerOff size={40} color={THEME_COLORS.WARNING} />}
          actionTitle="Tạo đơn mới"
          onAction={navigation.goBack}
        />
      );
    }

    return (
      <View style={styles.content}>
        <View style={styles.qrCard}>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            Quét mã bằng ứng dụng ngân hàng để thanh toán
          </Typography>
          <Image
            source={{ uri: order.qrUrl }}
            style={styles.qr}
            resizeMode="contain"
            accessibilityLabel="Mã QR chuyển khoản"
          />
          <Typography variant="h2" weight="BOLD" colorKey="PRIMARY_DARK" align="center">
            {formatVnd(order.amount)}
          </Typography>
        </View>

        <View style={styles.infoCard}>
          {order.bankCode ? (
            <CopyRow label="Ngân hàng" value={order.bankCode} onCopy={handleCopy} />
          ) : null}
          {order.bankAccount ? (
            <CopyRow label="Số tài khoản" value={order.bankAccount} onCopy={handleCopy} />
          ) : null}
          {order.accountName ? (
            <CopyRow label="Chủ tài khoản" value={order.accountName} onCopy={handleCopy} />
          ) : null}
          <CopyRow label="Nội dung chuyển khoản" value={order.referenceCode} onCopy={handleCopy} />
        </View>

        <View style={styles.waitingRow}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.waitingText}>
            {`Đang chờ thanh toán · còn ${formatCountdown(remaining)}`}
          </Typography>
        </View>

        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" align="center">
          Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động kích hoạt Premium.
        </Typography>

        <Button title="Quay lại" variant="outline" fullWidth onPress={navigation.goBack} />
      </View>
    );
  };

  return (
    <ScreenContainer scrollable padding="none" contentContainerStyle={styles.screenContent}>
      <HeaderBar title="Thanh toán Premium" onBack={navigation.goBack} />

      {renderContent()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: { paddingBottom: SPACING_TOKENS.XL },
  content: { gap: SPACING_TOKENS.MD, padding: SPACING_TOKENS.MD },
  qrCard: {
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  qr: { width: QR_SIZE, height: QR_SIZE },
  infoCard: {
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  infoBody: { flex: 1, gap: SPACING_TOKENS.XXS },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.SM,
  },
  waitingText: { flexShrink: 1 },
});
