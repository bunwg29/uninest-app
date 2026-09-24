import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ChevronLeft, Sparkles, Star } from 'lucide-react-native';
import { Badge, Button, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import type { PremiumPlan } from '../types/premium';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'starter',
    name: 'Cơ bản',
    duration: '7 ngày nổi bật',
    price: 49000,
    description: 'Phù hợp khi bạn cần lấp phòng nhanh trong tuần.',
  },
  {
    id: 'popular',
    name: 'Tăng tốc',
    duration: '30 ngày nổi bật',
    price: 149000,
    description: 'Tin luôn ở vị trí ưu tiên và được duyệt nhanh hơn.',
    badge: 'PHỔ BIẾN NHẤT',
    featured: true,
  },
  {
    id: 'professional',
    name: 'Chuyên nghiệp',
    duration: '90 ngày nổi bật',
    price: 349000,
    description: 'Tối ưu cho chủ trọ có nhiều phòng cần quản lý.',
    badge: 'TIẾT KIỆM 22%',
  },
];

export const PremiumPlansScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          Gói Nổi bật
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Star size={28} fill={THEME_COLORS.TEXT_PRIMARY} color={THEME_COLORS.TEXT_PRIMARY} />
        </View>
        <Typography variant="h1" weight="BOLD" align="center">
          Đưa tin của bạn lên đầu
        </Typography>
        <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.subtitle}>
          Tiếp cận nhiều sinh viên hơn và rút ngắn thời gian tìm người thuê.
        </Typography>

        <View style={styles.benefits}>
          {[
            'Ưu tiên hiển thị trong kết quả tìm kiếm',
            'Huy hiệu Nổi bật dễ nhận biết',
            'Ưu tiên kiểm duyệt trong 1–2 giờ',
          ].map((item) => (
            <View key={item} style={styles.benefitRow}>
              <View style={styles.checkIcon}>
                <Check size={15} color={THEME_COLORS.SUCCESS} />
              </View>
              <Typography variant="body2" style={styles.benefitText}>
                {item}
              </Typography>
            </View>
          ))}
        </View>

        {PREMIUM_PLANS.map((plan) => (
          <View key={plan.id} style={[styles.planCard, plan.featured && styles.featuredCard]}>
            {plan.badge ? (
              <Badge
                label={plan.badge}
                variant={plan.featured ? 'featured' : 'holding'}
                size="sm"
                style={styles.planBadge}
              />
            ) : null}
            <View style={styles.planTitleRow}>
              <View>
                <Typography variant="h3" weight="BOLD">
                  {plan.name}
                </Typography>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  {plan.duration}
                </Typography>
              </View>
              <View style={styles.priceRow}>
                <Typography variant="h2" weight="BOLD" colorKey="PRIMARY_DARK">
                  {plan.price.toLocaleString('vi-VN')}đ
                </Typography>
              </View>
            </View>
            <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.planDescription}>
              {plan.description}
            </Typography>
            <Button
              title="Chọn gói này"
              variant={plan.featured ? 'primary' : 'outline'}
              onPress={() => navigation.navigate('PremiumCheckout', { planId: plan.id })}
              fullWidth
            />
          </View>
        ))}

        <View style={styles.guarantee}>
          <Sparkles size={18} color={THEME_COLORS.PRIMARY} />
          <Typography variant="caption" colorKey="TEXT_SECONDARY" style={styles.guaranteeText}>
            Gói được kích hoạt ngay sau khi thanh toán thành công.
          </Typography>
        </View>
      </ScrollView>
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
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  subtitle: { marginTop: 8, paddingHorizontal: 20 },
  benefits: {
    padding: SPACING_TOKENS.MD,
    marginVertical: 18,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  benefitText: { flex: 1, marginLeft: 10 },
  planCard: {
    padding: SPACING_TOKENS.MD,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  featuredCard: { borderWidth: 2, borderColor: THEME_COLORS.SECONDARY },
  planBadge: { alignSelf: 'flex-start', marginBottom: 10 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceRow: { alignItems: 'flex-end' },
  planDescription: { marginVertical: 12 },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  guaranteeText: { flex: 1, marginLeft: 10 },
});
