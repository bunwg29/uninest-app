import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart3, Check, Crown } from 'lucide-react-native';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, NoticeBanner, ScreenContainer, Typography } from '@ui';
import { PremiumError, PremiumPlanCard, PremiumSkeleton } from '../components';
import { useCreatePremiumOrder, usePremiumPlans, usePremiumStatus } from '../hooks';
import { PREMIUM_BENEFITS, type PremiumPlanCode } from '../types';
import { formatFullDate, formatVnd } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PremiumUpgrade'>;

export const PremiumUpgradeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const statusQuery = usePremiumStatus();
  const plansQuery = usePremiumPlans();
  const createOrder = useCreatePremiumOrder();
  const [selectedCode, setSelectedCode] = useState<PremiumPlanCode>('1m');

  const status = statusQuery.data;
  const plans = plansQuery.data ?? [];
  const selectedPlan = plans.find((plan) => plan.code === selectedCode) ?? plans[0];
  const isLoading = statusQuery.isLoading || plansQuery.isLoading;
  const isError = statusQuery.isError || plansQuery.isError;

  const refresh = () => {
    void Promise.all([statusQuery.refetch(), plansQuery.refetch()]);
  };

  const handlePay = async () => {
    if (!selectedPlan) return;

    try {
      const order = await createOrder.mutateAsync(selectedPlan.code);

      navigation.navigate('PremiumPayment', { orderId: order.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn thanh toán');
    }
  };

  const renderContent = () => {
    if (isLoading) return <PremiumSkeleton />;

    if (isError || !status) return <PremiumError onRetry={refresh} />;

    return (
      <View style={styles.content}>
        {status.isPremium && status.expiresAt ? (
          <View style={styles.statusCard} testID="premium-status-active">
            <View style={styles.statusIcon}>
              <Crown size={22} color={THEME_COLORS.TEXT_PRIMARY} />
            </View>
            <View style={styles.statusBody}>
              <Typography variant="body1" weight="BOLD">
                Premium đang hoạt động
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="WARNING">
                {`Hết hạn ${formatFullDate(status.expiresAt)} · còn ${status.daysRemaining} ngày`}
              </Typography>
            </View>
          </View>
        ) : (
          <NoticeBanner tone="info" icon={Crown}>
            Bạn đang dùng gói miễn phí. Nâng cấp để tin đăng được ưu tiên hiển thị.
          </NoticeBanner>
        )}

        {status.isPremium ? (
          <Button
            title="Xem thống kê nâng cao"
            variant="outline"
            fullWidth
            leftIcon={<BarChart3 size={18} color={THEME_COLORS.PRIMARY} />}
            onPress={() => navigation.navigate('PremiumStats')}
          />
        ) : null}

        <View style={styles.section}>
          <Typography variant="h4" weight="BOLD">
            Quyền lợi Premium
          </Typography>
          {PREMIUM_BENEFITS.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <Check size={18} color={THEME_COLORS.SUCCESS} />
              <Typography variant="body2" style={styles.benefitText}>
                {benefit}
              </Typography>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Typography variant="h4" weight="BOLD">
            {status.isPremium ? 'Chọn gói gia hạn' : 'Chọn gói'}
          </Typography>
          {plans.map((plan) => (
            <PremiumPlanCard
              key={plan.code}
              plan={plan}
              isSelected={plan.code === selectedPlan?.code}
              onSelect={(item) => setSelectedCode(item.code)}
            />
          ))}
        </View>

        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" align="center">
          Thanh toán bằng chuyển khoản QR. Gia hạn khi còn hạn sẽ được cộng dồn thời gian.
        </Typography>
      </View>
    );
  };

  return (
    <ScreenContainer
      scrollable
      padding="none"
      contentContainerStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={statusQuery.isRefetching || plansQuery.isRefetching}
          onRefresh={refresh}
        />
      }
    >
      <HeaderBar title="Nâng cấp Premium" onBack={navigation.goBack} />

      {renderContent()}

      {!isLoading && !isError && selectedPlan ? (
        <View style={styles.footer}>
          <Button
            title={`${status?.isPremium ? 'Gia hạn' : 'Thanh toán'} ${formatVnd(selectedPlan.price)}`}
            fullWidth
            isLoading={createOrder.isPending}
            onPress={handlePay}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: { paddingBottom: SPACING_TOKENS.XL },
  content: { gap: SPACING_TOKENS.MD, padding: SPACING_TOKENS.MD },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  statusIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  statusBody: { flex: 1, gap: SPACING_TOKENS.XXS },
  section: { gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING_TOKENS.SM },
  benefitText: { flex: 1 },
  footer: { paddingHorizontal: SPACING_TOKENS.MD },
});
