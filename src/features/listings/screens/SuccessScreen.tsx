import { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2, ShieldCheck, Clock, Home, PlusCircle } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography, ScreenContainer, Badge } from '@ui';
import type { ListingPostStackParamList, RootStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;
type ScreenRouteProp = RouteProp<ListingPostStackParamList, 'ListingPostSuccess'>;

export const SuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const listingId = route.params?.listingId;

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

  return (
    <ScreenContainer applyTopInset applyBottomInset={false} keyboardAvoiding={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon & Heading */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={56} color={THEME_COLORS.SUCCESS} strokeWidth={2.5} />
          </View>

          <Typography variant="h2" weight="BOLD" colorKey="TEXT_PRIMARY" style={styles.title}>
            Đã gửi tin đi duyệt
          </Typography>

          <View style={styles.badgeWrapper}>
            <Badge label="Chờ duyệt" variant="holding" size="md" />
          </View>

          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.subtitle}>
            Quản trị viên sẽ kiểm tra trong 4–8 giờ làm việc. Bạn nhận thông báo ngay khi có kết
            quả.
          </Typography>
        </View>

        {/* Listing Info Card */}
        {listingId ? (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Typography variant="caption" colorKey="TEXT_MUTED">
                Mã tin đăng
              </Typography>
              <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
                #{listingId.slice(0, 8).toUpperCase()}
              </Typography>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Typography variant="caption" colorKey="TEXT_MUTED">
                Thời gian kiểm duyệt dự kiến
              </Typography>
              <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_PRIMARY">
                4 - 8 giờ làm việc
              </Typography>
            </View>
          </View>
        ) : null}

        {/* Guidance Section */}
        <View style={styles.guideCard}>
          <Typography
            variant="body1"
            weight="SEMIBOLD"
            colorKey="TEXT_PRIMARY"
            style={styles.guideTitle}
          >
            Các bước tiếp theo
          </Typography>

          <View style={styles.guideStep}>
            <View style={styles.stepIconWrapper}>
              <Clock size={18} color={THEME_COLORS.PRIMARY} />
            </View>
            <View style={styles.stepText}>
              <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_PRIMARY">
                1. Đội ngũ kiểm duyệt kiểm tra
              </Typography>
              <Typography variant="caption" colorKey="TEXT_SECONDARY">
                Xác thực thông tin cơ bản, hình ảnh và địa chỉ để đảm bảo phòng trọ thật, giá thật.
              </Typography>
            </View>
          </View>

          <View style={styles.guideStep}>
            <View style={styles.stepIconWrapper}>
              <ShieldCheck size={18} color={THEME_COLORS.SUCCESS} />
            </View>
            <View style={styles.stepText}>
              <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_PRIMARY">
                2. Thông báo kết quả duyệt
              </Typography>
              <Typography variant="caption" colorKey="TEXT_SECONDARY">
                Bạn sẽ nhận được thông báo ngay khi bài đăng được phê duyệt.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Button
          title="Đăng tin khác"
          variant="outline"
          leftIcon={<PlusCircle size={18} color={THEME_COLORS.PRIMARY} />}
          onPress={handlePostAnother}
          style={styles.anotherButton}
        />
        <Button
          title="Về danh sách tin đăng"
          variant="primary"
          leftIcon={<Home size={18} color={THEME_COLORS.SURFACE} />}
          onPress={handleGoHome}
          style={styles.homeButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: SPACING_TOKENS.LG,
    paddingBottom: SPACING_TOKENS.XXL,
    gap: SPACING_TOKENS.LG,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING_TOKENS.XL,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.LG,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING_TOKENS.SM,
  },
  badgeWrapper: {
    marginBottom: SPACING_TOKENS.MD,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.XS,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: THEME_COLORS.BORDER,
    marginVertical: SPACING_TOKENS.SM,
  },
  guideCard: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    gap: SPACING_TOKENS.MD,
  },
  guideTitle: {
    marginBottom: SPACING_TOKENS.XS,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM,
  },
  stepIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    gap: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    gap: SPACING_TOKENS.MD,
  },
  anotherButton: {
    flex: 1,
  },
  homeButton: {
    flex: 1.2,
  },
});
