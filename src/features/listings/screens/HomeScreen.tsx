import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Building2,
  GraduationCap,
  MapPin,
  MessageSquare,
  PlusCircle,
  Scale,
  Search,
  Tag,
  Users2,
} from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Avatar, Button, ScreenContainer, Typography } from '@ui';
import { useAuth, useRoleGuard } from '@features/auth';
import { SEARCH_SCHOOLS, useSearchStore } from '@features/search';
import { useComparisonStore } from '@features/comparison';
import type { MainTabParamList, RootStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const QUICK_CATEGORIES = [
  {
    id: 'near-university',
    label: 'Gần trường ĐH',
    icon: GraduationCap,
    bgColor: '#EFF6FF',
    iconColor: THEME_COLORS.PRIMARY,
  },
  {
    id: 'roommate',
    label: 'Tìm ở ghép',
    icon: Users2,
    bgColor: '#ECFDF5',
    iconColor: THEME_COLORS.SUCCESS,
  },
  {
    id: 'studio',
    label: 'Căn hộ mini',
    icon: Building2,
    bgColor: '#FFF7ED',
    iconColor: THEME_COLORS.SECONDARY,
  },
  {
    id: 'budget',
    label: 'Giá sinh viên',
    icon: Tag,
    bgColor: '#FAF5FF',
    iconColor: '#7C3AED',
  },
];

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { isLandlord } = useRoleGuard();
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const comparisonCount = useComparisonStore((state) => state.items.length);
  const applySearchPreset = useSearchStore((state) => state.applyPreset);

  const handleGoToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const handleGoToSearch = () => {
    navigation.navigate('Search' as never);
  };

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === 'roommate') {
      handleGoToRoommateCommunity();

      return;
    }

    const school = SEARCH_SCHOOLS[0];

    if (categoryId === 'near-university') {
      applySearchPreset({
        schoolId: school.id,
        latitude: school.latitude,
        longitude: school.longitude,
        radius: 3,
        sortBy: 'distance',
      });
    } else if (categoryId === 'studio') {
      applySearchPreset({ roomTypes: ['chung_cu_mini', 'studio'] });
    } else if (categoryId === 'budget') {
      applySearchPreset({ maxPrice: 2_000_000, sortBy: 'price_asc' });
    }

    handleGoToSearch();
  };

  const handleGoToRoommateCommunity = () => {
    navigation.navigate('Community', { category: 'roommate' });
  };

  const handleGoToMessages = () => {
    navigation.navigate('Messages' as never);
  };

  const handleGoToComparison = () => {
    navigation.navigate('Comparison');
  };

  const handleGoToListingPost = () => {
    useListingPostStore.getState().initCreate();
    navigation.navigate('ListingPost', {
      screen: 'ListingPostBasicInfo',
      params: undefined,
    });
  };

  const handleGoToListings = () => {
    navigation.navigate('Listings' as never);
  };

  const userDisplayName = user?.fullName || 'Bạn';
  const locationText = user?.streetAddress || user?.fullAddress || 'Đà Nẵng, Việt Nam';

  return (
    <ScreenContainer
      scrollable
      applyBottomInset={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileHeaderButton}
          onPress={handleGoToProfile}
          activeOpacity={0.8}
        >
          <Avatar uri={user?.avatarUrl || undefined} name={userDisplayName} size="md" />

          <View style={styles.greetingContainer}>
            <Typography
              variant="body1"
              weight="BOLD"
              color={THEME_COLORS.TEXT_PRIMARY}
              numberOfLines={1}
            >
              Chào {userDisplayName} 👋
            </Typography>

            <View style={styles.locationRow}>
              <MapPin size={13} color={THEME_COLORS.PRIMARY} />

              <Typography
                variant="caption"
                color={THEME_COLORS.TEXT_MUTED}
                style={styles.locationText}
                numberOfLines={1}
              >
                {locationText}
              </Typography>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleGoToComparison}
            activeOpacity={0.7}
            accessibilityLabel="Mở danh sách so sánh"
          >
            <Scale size={20} color={THEME_COLORS.TEXT_PRIMARY} />
            {comparisonCount > 0 ? (
              <View style={styles.comparisonBadge}>
                <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.WHITE}>
                  {comparisonCount}
                </Typography>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleGoToMessages}
            activeOpacity={0.7}
          >
            <MessageSquare size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleGoToProfile}
            activeOpacity={0.7}
          >
            <Bell size={20} color={THEME_COLORS.TEXT_PRIMARY} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={handleGoToSearch} activeOpacity={0.8}>
        <Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />

        <Typography
          variant="body2"
          color={THEME_COLORS.TEXT_PLACEHOLDER}
          style={styles.searchPlaceholder}
        >
          Tìm theo khu vực, tên trường, tên đường…
        </Typography>
      </TouchableOpacity>

      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Typography variant="body1" weight="BOLD" color={THEME_COLORS.TEXT_PRIMARY}>
            Danh mục nổi bật
          </Typography>
        </View>

        <View style={[styles.categoriesGrid, isCompact && styles.categoriesGridCompact]}>
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;

            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, isCompact && styles.categoryItemCompact]}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: cat.bgColor }]}>
                  <Icon size={24} color={cat.iconColor} />
                </View>

                <Typography
                  variant="caption"
                  weight="SEMIBOLD"
                  color={THEME_COLORS.TEXT_PRIMARY}
                  style={styles.categoryLabel}
                >
                  {cat.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLandlord ? (
        <View style={styles.landlordCard}>
          <View style={styles.cardHeader}>
            <Typography variant="body1" weight="BOLD" color={THEME_COLORS.TEXT_PRIMARY}>
              Quản lý Cho thuê
            </Typography>

            <TouchableOpacity onPress={handleGoToListings} activeOpacity={0.7}>
              <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
                Xem tất cả tin
              </Typography>
            </TouchableOpacity>
          </View>

          <Typography variant="caption" color={THEME_COLORS.TEXT_SECONDARY} style={styles.cardDesc}>
            Đăng tin phòng trọ của bạn để tiếp cận sinh viên đang tìm kiếm phòng ở.
          </Typography>

          <View style={[styles.landlordButtonsRow, isCompact && styles.landlordButtonsColumn]}>
            <Button
              title="Đăng tin cho thuê"
              variant="primary"
              size="md"
              leftIcon={<PlusCircle size={16} color={THEME_COLORS.SURFACE} />}
              onPress={handleGoToListingPost}
              style={styles.actionBtn}
            />

            <Button
              title="Tin đăng của bạn"
              variant="outline"
              size="md"
              onPress={handleGoToListings}
              style={styles.actionBtn}
            />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  contentContainer: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
  },
  profileHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingContainer: {
    marginLeft: SPACING_TOKENS.SM,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME_COLORS.ERROR,
  },
  comparisonBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + 2,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.MD,
  },
  searchPlaceholder: {
    marginLeft: SPACING_TOKENS.SM,
    flex: 1,
  },
  categoriesSection: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.MD,
  },
  categoriesHeader: {
    marginBottom: SPACING_TOKENS.MD,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesGridCompact: {
    flexWrap: 'wrap',
    rowGap: SPACING_TOKENS.MD,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
  },
  categoryItemCompact: {
    flexBasis: '50%',
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  landlordCard: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.MD,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardDesc: {
    marginBottom: SPACING_TOKENS.MD,
  },
  landlordButtonsRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
  },
  landlordButtonsColumn: {
    flexDirection: 'column',
  },
  actionBtn: {
    flex: 1,
  },
});
