import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ChevronLeft, Clock3, Star } from 'lucide-react-native';
import { Button, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PremiumStatus'>;

export const PremiumStatusScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const isExpired = route.params?.state === 'expired';

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

      <View style={styles.content}>
        <View style={[styles.statusIcon, isExpired && styles.expiredIcon]}>
          {isExpired ? (
            <Clock3 size={38} color={THEME_COLORS.WARNING} />
          ) : (
            <Check size={42} color={THEME_COLORS.SUCCESS} />
          )}
        </View>
        <Typography variant="h1" weight="BOLD" align="center">
          {isExpired ? 'Gói Nổi bật đã hết hạn' : 'Đã kích hoạt thành công!'}
        </Typography>
        <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.subtitle}>
          {isExpired
            ? 'Gia hạn để tin tiếp tục được ưu tiên hiển thị với sinh viên.'
            : 'Tin của bạn đã được ưu tiên hiển thị trong 30 ngày tới.'}
        </Typography>

        <View style={styles.statusCard}>
          <View style={styles.starBox}>
            <Star size={22} fill={THEME_COLORS.TEXT_PRIMARY} color={THEME_COLORS.TEXT_PRIMARY} />
          </View>
          <View style={styles.statusCopy}>
            <Typography variant="body1" weight="BOLD">
              Gói Tăng tốc
            </Typography>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              {isExpired ? 'Đã hết hạn hôm nay' : 'Hiệu lực đến 23/10/2026'}
            </Typography>
          </View>
        </View>

        <Button
          title={isExpired ? 'Gia hạn ngay' : 'Về trang tổng quan'}
          onPress={() =>
            isExpired
              ? navigation.replace('PremiumPlans')
              : navigation.navigate('Main', { screen: 'Overview' })
          }
          fullWidth
          size="lg"
          style={styles.primaryButton}
        />
        {!isExpired ? (
          <Button
            title="Xem tin đang nổi bật"
            variant="outline"
            onPress={() => navigation.navigate('Main', { screen: 'Listings' })}
            fullWidth
            size="lg"
          />
        ) : null}
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
  content: {
    flex: 1,
    padding: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.BACKGROUND,
    alignItems: 'center',
  },
  statusIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginTop: SPACING_TOKENS.XL,
    marginBottom: SPACING_TOKENS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  expiredIcon: { backgroundColor: THEME_COLORS.WARNING_LIGHT },
  subtitle: { marginTop: 10, paddingHorizontal: 20 },
  statusCard: {
    width: '100%',
    marginVertical: SPACING_TOKENS.XL,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  starBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  statusCopy: { marginLeft: 12 },
  primaryButton: { marginBottom: 12 },
});
