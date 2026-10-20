import { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowLeftRight,
  Sparkles,
  Bot,
  CheckCircle2,
} from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Button, ScreenContainer, Typography } from '@ui';
import { useResponsiveLayout } from '@hooks';
import type { AuthStackParamList } from '@navigation';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  iconType: 'search' | 'compare' | 'ai';
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide_1',
    title: 'Tìm phòng gần trường chỉ trong 5 phút',
    description:
      'Lọc theo giá, tiện ích và khoảng cách tới trường bạn đang học. Không còn phải lướt hàng chục nhóm Facebook.',
    iconType: 'search',
  },
  {
    id: 'slide_2',
    title: 'So sánh 4 phòng cạnh nhau, không sót gì',
    description:
      'Giá, diện tích, tiền cọc, khoảng cách và từng tiện ích xếp thẳng hàng để bạn quyết định nhanh.',
    iconType: 'compare',
  },
  {
    id: 'slide_3',
    title: 'Không biết bắt đầu? Cứ hỏi trợ lý AI',
    description:
      '"Tìm phòng dưới 2 triệu 5 gần Bách khoa, có chỗ để xe" — AI đọc hiểu và trả về phòng có thật đang cho thuê.',
    iconType: 'ai',
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setOnboardingCompleted } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const { contentWidth, viewportHeight, isCompact } = useResponsiveLayout();
  const useCompactIllustration = isCompact || viewportHeight < 700;
  const illustrationSize = useCompactIllustration ? 190 : 240;

  const handleFinishOnboarding = useCallback(async () => {
    await setOnboardingCompleted(true);

    navigation.replace('Login');
  }, [navigation, setOnboardingCompleted]);

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    } else {
      await handleFinishOnboarding();
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / contentWidth);

    if (index >= 0 && index < ONBOARDING_SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const renderSlideIllustration = (type: OnboardingSlide['iconType']) => {
    if (type === 'search') {
      return (
        <View
          style={[styles.illustrationCard, { width: illustrationSize, height: illustrationSize }]}
        >
          <View style={styles.primaryCircle}>
            <Search size={52} color={THEME_COLORS.SURFACE} />
          </View>

          <View style={[styles.floatingBadge, styles.badgeTopRight]}>
            <MapPin size={20} color={THEME_COLORS.PRIMARY} />

            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.PRIMARY}
              style={styles.badgeText}
            >
              Gần trường
            </Typography>
          </View>

          <View style={[styles.floatingBadge, styles.badgeBottomLeft]}>
            <Compass size={20} color={THEME_COLORS.SUCCESS} />

            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.SUCCESS}
              style={styles.badgeText}
            >
              Bán kính 2km
            </Typography>
          </View>
        </View>
      );
    }

    if (type === 'compare') {
      return (
        <View
          style={[styles.illustrationCard, { width: illustrationSize, height: illustrationSize }]}
        >
          <View style={styles.secondaryCircle}>
            <SlidersHorizontal size={52} color={THEME_COLORS.SURFACE} />
          </View>

          <View style={[styles.floatingBadge, styles.badgeTopRight]}>
            <ArrowLeftRight size={20} color={THEME_COLORS.SECONDARY} />

            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.SECONDARY}
              style={styles.badgeText}
            >
              4 phòng
            </Typography>
          </View>

          <View style={[styles.floatingBadge, styles.badgeBottomLeft]}>
            <CheckCircle2 size={20} color={THEME_COLORS.SUCCESS} />

            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.SUCCESS}
              style={styles.badgeText}
            >
              Minh bạch giá
            </Typography>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[styles.illustrationCard, { width: illustrationSize, height: illustrationSize }]}
      >
        <View style={styles.aiCircle}>
          <Bot size={52} color={THEME_COLORS.SURFACE} />
        </View>

        <View style={[styles.floatingBadge, styles.badgeTopRight]}>
          <Sparkles size={20} color="#7C3AED" />

          <Typography variant="tiny" weight="SEMIBOLD" color="#7C3AED" style={styles.badgeText}>
            Trợ lý AI
          </Typography>
        </View>

        <View style={[styles.floatingBadge, styles.badgeBottomLeft]}>
          <Typography
            variant="tiny"
            weight="MEDIUM"
            color={THEME_COLORS.TEXT_SECONDARY}
            style={styles.badgeText}
          >
            Dưới 2.5 triệu
          </Typography>
        </View>
      </View>
    );
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View
        style={[
          styles.slideContainer,
          { width: contentWidth },
          useCompactIllustration && styles.compactSlide,
        ]}
      >
        <View
          style={[
            styles.illustrationWrapper,
            useCompactIllustration && styles.compactIllustrationWrapper,
          ]}
        >
          {renderSlideIllustration(item.iconType)}
        </View>

        <View style={styles.textContent}>
          <Typography variant="h1" weight="BOLD" style={styles.title}>
            {item.title}
          </Typography>

          <Typography
            variant="body1"
            color={THEME_COLORS.TEXT_SECONDARY}
            style={styles.description}
          >
            {item.description}
          </Typography>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer style={styles.container} keyboardAvoiding={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleFinishOnboarding}
          activeOpacity={0.7}
          style={styles.skipButton}
        >
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            Bỏ qua
          </Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        bounces={false}
        style={styles.flatList}
        extraData={contentWidth}
        getItemLayout={(_, index) => ({
          length: contentWidth,
          offset: contentWidth * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <View style={styles.paginationRow}>
          {ONBOARDING_SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;

            return (
              <View
                key={slide.id}
                style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
              />
            );
          })}
        </View>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
          style={styles.actionButton}
        >
          {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
        </Button>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  header: {
    paddingTop: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.LG,
    alignItems: 'flex-end',
    height: 80,
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.SM,
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    paddingHorizontal: SPACING_TOKENS.XL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactSlide: {
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.XXL,
  },
  illustrationCard: {
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compactIllustrationWrapper: {
    marginBottom: SPACING_TOKENS.LG,
  },
  primaryCircle: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  secondaryCircle: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.SECONDARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  aiCircle: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.ACCENT_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: OVERLAY_COLORS.ACCENT_PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  floatingBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  badgeTopRight: {
    top: 15,
    right: -10,
  },
  badgeBottomLeft: {
    bottom: 20,
    left: -15,
  },
  badgeText: {
    marginLeft: 6,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.SM,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING_TOKENS.MD,
    lineHeight: 32,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingBottom: SPACING_TOKENS.MD,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.XL,
    gap: SPACING_TOKENS.XS,
  },
  dot: {
    height: 8,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  dotActive: {
    width: 24,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  dotInactive: {
    width: 8,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
  },
  actionButton: {
    width: '100%',
  },
});
