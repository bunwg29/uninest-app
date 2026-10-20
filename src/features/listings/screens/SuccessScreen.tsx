import { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, Home, PlusCircle, X } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Button, Typography, ScreenContainer, GradientView } from '@ui';
import { useResponsiveLayout } from '@hooks';
import type { ListingPostStackParamList, RootStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { LandlordStatusPill } from '../components/landlord/LandlordStatusPill';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;
type ScreenRouteProp = RouteProp<ListingPostStackParamList, 'ListingPostSuccess'>;

const REVIEW_POINTS = [
  'Ảnh có phải chụp thực tế phòng này không',
  'Giá và diện tích có hợp lý với khu vực không',
  'Tin có trùng với tin đăng nào khác không',
  'Mô tả không chứa số điện thoại hay tài khoản ngân hàng',
] as const;

export const SuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { title, price, area, imageUri } = route.params ?? {};
  const { isCompact } = useResponsiveLayout();

  const handleGoHome = useCallback(() => {
    const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

    if (rootNav) {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Listings' } }],
      });
    } else {
      navigation.navigate('ListingPostBasicInfo');
    }
  }, [navigation]);

  const handlePostAnother = useCallback(() => {
    useListingPostStore.getState().initCreate();
    navigation.reset({
      index: 0,
      routes: [{ name: 'ListingPostBasicInfo' }],
    });
  }, [navigation]);

  const summary = [
    price ? `${price.toLocaleString('vi-VN')}đ/tháng` : null,
    area ? `${area} m²` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleGoHome}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <X size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Check size={54} color={THEME_COLORS.SUCCESS} strokeWidth={3} />
          </View>

          <Typography variant="h2" weight="BOLD" colorKey="TEXT_PRIMARY" style={styles.title}>
            Đã gửi tin đi duyệt
          </Typography>

          <Typography variant="body1" colorKey="TEXT_SECONDARY" style={styles.subtitle}>
            Quản trị viên sẽ kiểm tra trong{' '}
            <Typography variant="body1" weight="BOLD" colorKey="TEXT_PRIMARY">
              4–8 giờ làm việc
            </Typography>
            . Bạn nhận thông báo ngay khi có kết quả.
          </Typography>
        </View>

        {title ? (
          <View style={styles.listingCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.thumb} />
            ) : (
              <GradientView
                colors={[OVERLAY_COLORS.PLACEHOLDER_TINT, THEME_COLORS.PRIMARY_LIGHT]}
                style={styles.thumb}
              />
            )}
            <View style={styles.listingText}>
              <Typography variant="body2" weight="BOLD" numberOfLines={2}>
                {title}
              </Typography>
              {summary ? (
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                  {summary}
                </Typography>
              ) : null}
            </View>
            <LandlordStatusPill label="Chờ duyệt" tone="info" />
          </View>
        ) : null}

        <View style={styles.guideCard}>
          <Typography variant="body2" weight="BOLD" colorKey="TEXT_PRIMARY">
            Quản trị viên sẽ kiểm tra
          </Typography>
          <View style={styles.guideDivider} />
          {REVIEW_POINTS.map((point) => (
            <View key={point} style={styles.guideRow}>
              <View style={styles.guideDot} />
              <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.guideText}>
                {point}
              </Typography>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, isCompact && styles.bottomBarCompact]}>
        <Button
          title="Đăng tin khác"
          variant="outline"
          size="lg"
          leftIcon={<PlusCircle size={18} color={THEME_COLORS.PRIMARY} />}
          onPress={handlePostAnother}
          style={styles.anotherButton}
        />
        <Button
          title="Về danh sách tin đăng"
          variant="primary"
          size="lg"
          leftIcon={<Home size={18} color={THEME_COLORS.SURFACE} />}
          onPress={handleGoHome}
          style={styles.homeButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: { height: 56, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 16 },
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  scrollContent: { padding: 16, paddingBottom: SPACING_TOKENS.XXL, gap: 24 },
  header: { alignItems: 'center', gap: 16 },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { textAlign: 'center', lineHeight: 24 },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  thumb: { width: 56, height: 56, borderRadius: BORDER_RADIUS_TOKENS.MD, overflow: 'hidden' },
  listingText: { flex: 1, gap: 4 },
  guideCard: {
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  guideDivider: { height: 1, marginVertical: 14, backgroundColor: THEME_COLORS.DIVIDER },
  guideRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  guideDot: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  guideText: { flex: 1, lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    gap: SPACING_TOKENS.MD,
  },
  bottomBarCompact: { flexDirection: 'column' },
  anotherButton: { flex: 1 },
  homeButton: { flex: 1.2 },
});
