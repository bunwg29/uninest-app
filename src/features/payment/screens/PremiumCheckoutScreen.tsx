import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, CreditCard, ShieldCheck, Smartphone } from 'lucide-react-native';
import { Button, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { PREMIUM_PLANS } from './PremiumPlansScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PremiumCheckout'>;

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán qua ứng dụng MoMo', icon: Smartphone },
  { id: 'vnpay', name: 'VNPay', description: 'Thẻ ATM và ngân hàng số', icon: CreditCard },
];

export const PremiumCheckoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [isPaying, setIsPaying] = useState(false);
  const plan = useMemo(
    () => PREMIUM_PLANS.find((item) => item.id === route.params.planId) || PREMIUM_PLANS[1],
    [route.params.planId]
  );

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      navigation.replace('PremiumStatus', { state: 'active' });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          Thanh toán
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
            GÓI ĐÃ CHỌN
          </Typography>
          <View style={styles.summaryRow}>
            <View>
              <Typography variant="h3" weight="BOLD">
                {plan.name}
              </Typography>
              <Typography variant="caption" colorKey="TEXT_MUTED">
                {plan.duration}
              </Typography>
            </View>
            <Typography variant="h2" weight="BOLD" colorKey="PRIMARY_DARK">
              {plan.price.toLocaleString('vi-VN')}đ
            </Typography>
          </View>
        </View>

        <Typography variant="body1" weight="BOLD" style={styles.sectionTitle}>
          Phương thức thanh toán
        </Typography>
        {PAYMENT_METHODS.map(({ id, name, description, icon: Icon }) => {
          const isSelected = paymentMethod === id;

          return (
            <TouchableOpacity
              key={id}
              style={[styles.paymentMethod, isSelected && styles.selectedMethod]}
              onPress={() => setPaymentMethod(id)}
            >
              <View style={styles.methodIcon}>
                <Icon size={21} color={THEME_COLORS.PRIMARY} />
              </View>
              <View style={styles.methodCopy}>
                <Typography variant="body2" weight="BOLD">
                  {name}
                </Typography>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  {description}
                </Typography>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.secureNotice}>
          <ShieldCheck size={20} color={THEME_COLORS.SUCCESS} />
          <Typography variant="caption" colorKey="TEXT_SECONDARY" style={styles.secureText}>
            Giao dịch được bảo vệ. Đây là luồng thanh toán sandbox của UniNest.
          </Typography>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
            Tổng thanh toán
          </Typography>
          <Typography variant="h3" weight="BOLD" colorKey="PRIMARY_DARK">
            {plan.price.toLocaleString('vi-VN')}đ
          </Typography>
        </View>
        <Button
          title="Thanh toán"
          onPress={handlePayment}
          isLoading={isPaying}
          style={styles.payButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    height: 58,
    paddingHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 24 },
  content: { flexGrow: 1, padding: SPACING_TOKENS.MD, backgroundColor: THEME_COLORS.BACKGROUND },
  summaryCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    borderWidth: 1,
    borderColor: '#F0D9A0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: { marginTop: SPACING_TOKENS.LG, marginBottom: 10 },
  paymentMethod: {
    minHeight: 76,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 10,
  },
  selectedMethod: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
  },
  methodCopy: { flex: 1, marginLeft: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C9CFDA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: THEME_COLORS.PRIMARY },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME_COLORS.PRIMARY },
  secureNotice: {
    flexDirection: 'row',
    padding: 14,
    marginTop: 10,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  secureText: { flex: 1, marginLeft: 10 },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.SURFACE,
  },
  payButton: { minWidth: 160 },
});
