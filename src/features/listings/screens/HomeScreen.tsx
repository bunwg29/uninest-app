import { useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlusCircle } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import { useAuth, useRoleGuard } from '@features/auth';
import {
  DEFAULT_SEARCH_FILTERS,
  SEARCH_SCHOOLS,
  useFavoriteIds,
  useSearchListings,
  useSearchStore,
  useToggleFavorite,
  type SearchFilters,
  type SearchListingItem,
} from '@features/search';
import { useComparison } from '@features/comparison';
import { useUnreadNotificationCount } from '@features/notifications';
import {
  RecommendationCard,
  useRecentListingIds,
  useRecentlyViewedStore,
} from '@features/recommendations';
import type { MainTabParamList, RootStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { useOpenListing } from '../hooks';
import { HomeHeader } from '../components/home/HomeHeader';
import {
  AiBanner,
  AreaChips,
  HomeChipRow,
  InfoBanner,
  SectionHeader,
} from '../components/home/HomeSections';
import { HomeSkeleton } from '../components/home/HomeSkeleton';
import { NearbyMapPreview } from '../components/home/NearbyMapPreview';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;
type HomeChipId = 'near-university' | 'budget' | 'loft' | 'roommate';

const NEAR_SCHOOL = SEARCH_SCHOOLS[0];
const CAROUSEL_LIMIT = 6;
const BUDGET_MAX_PRICE = 2_000_000;
const NEARBY_RADIUS_KM = 3;

const HOME_CHIPS = [
  { id: 'near-university', label: 'Gần trường' },
  { id: 'budget', label: 'Dưới 2 triệu' },
  { id: 'loft', label: 'Có gác' },
  { id: 'roommate', label: 'Ở ghép' },
] as const;

const COLD_START_AREAS = ['Hoà Khánh Bắc', 'Hoà Khánh Nam'] as const;

const buildHomeFilters = (chipId: HomeChipId): SearchFilters => ({
  ...DEFAULT_SEARCH_FILTERS,
  roomTypes: [],
  amenities: [],
  schoolId: NEAR_SCHOOL.id,
  latitude: NEAR_SCHOOL.latitude,
  longitude: NEAR_SCHOOL.longitude,
  radius: NEARBY_RADIUS_KM,
  limit: CAROUSEL_LIMIT,
  ...(chipId === 'budget' ? { maxPrice: BUDGET_MAX_PRICE, sortBy: 'price_asc' as const } : null),
  ...(chipId === 'loft' ? { keyword: 'gác' } : null),
});

const CarouselSeparator = () => <View style={styles.carouselSeparator} />;

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { user, role } = useAuth();
  const { isLandlord } = useRoleGuard();
  const { openListing } = useOpenListing();
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const { count: comparisonCount } = useComparison();
  const { data: unreadNotificationCount = 0 } = useUnreadNotificationCount();
  const applySearchPreset = useSearchStore((state) => state.applyPreset);
  const openSearchFilters = useSearchStore((state) => state.openFilters);
  const setSearchViewMode = useSearchStore((state) => state.setViewMode);
  const recentViewCount = useRecentListingIds().length;
  const hasHydratedHistory = useRecentlyViewedStore((state) => state.hasHydrated);
  const [selectedChipId, setSelectedChipId] = useState<HomeChipId>('near-university');

  const isColdStart = hasHydratedHistory && recentViewCount === 0;
  const activeChipId: HomeChipId = isColdStart ? 'near-university' : selectedChipId;
  const filters = useMemo(() => buildHomeFilters(activeChipId), [activeChipId]);
  const listingsQuery = useSearchListings(filters);
  const favoriteIdsQuery = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const favoriteIds = useMemo(() => new Set(favoriteIdsQuery.data ?? []), [favoriteIdsQuery.data]);
  const listings = useMemo(
    () => (listingsQuery.data?.pages.flatMap((page) => page.items) ?? []).slice(0, CAROUSEL_LIMIT),
    [listingsQuery.data]
  );
  const isLoading = !hasHydratedHistory || listingsQuery.isLoading;

  const handleGoToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const handleGoToSearch = () => {
    navigation.navigate('Search' as never);
  };

  const handleGoToFilters = () => {
    openSearchFilters();
    handleGoToSearch();
  };

  const handleGoToMap = () => {
    setSearchViewMode('map');
    handleGoToSearch();
  };

  const handleGoToRoommateCommunity = () => {
    navigation.navigate('Community', { category: 'roommate' });
  };

  const handleGoToComparison = () => {
    navigation.navigate('Comparison');
  };

  const handleGoToAiChat = () => {
    navigation.navigate('AiChat' as never);
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

  const handleChipPress = (chipId: string) => {
    if (chipId === 'roommate') {
      handleGoToRoommateCommunity();

      return;
    }

    setSelectedChipId(chipId as HomeChipId);
  };

  const handleViewAll = () => {
    applySearchPreset(filters);
    handleGoToSearch();
  };

  const handleAreaPress = (area: string) => {
    applySearchPreset({ keyword: area });
    handleGoToSearch();
  };

  const handleToggleSaved = (listingId: string) => {
    if (role !== 'student') {
      toast.info('Chỉ Sinh viên mới có thể lưu phòng.');

      return;
    }

    toggleFavorite.mutate({ listingId, isSaved: favoriteIds.has(listingId) });
  };

  const userDisplayName = user?.fullName || 'Bạn';
  const locationText = user?.streetAddress || user?.fullAddress || 'Đà Nẵng, Việt Nam';

  const renderListing = ({ item }: { item: SearchListingItem }) => (
    <RecommendationCard
      title={item.title}
      price={item.price}
      imageUrl={item.thumbnail}
      areaSquareMeters={item.area}
      capacity={item.capacity}
      distanceMeters={item.distanceMeters}
      campusShortName={NEAR_SCHOOL.shortName}
      rating={item.rating}
      reviewCount={item.reviewCount}
      availability={item.availability}
      isHighlighted={item.isHighlighted}
      isSaved={favoriteIds.has(item.id)}
      onPress={() => openListing(item.id)}
      onToggleSaved={() => handleToggleSaved(item.id)}
    />
  );

  const renderCarouselContent = () => {
    if (listingsQuery.isError) {
      return (
        <View style={styles.carouselMessage}>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Không tải được gợi ý phòng.
          </Typography>

          <TouchableOpacity onPress={() => listingsQuery.refetch()} activeOpacity={0.7}>
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
              Thử lại
            </Typography>
          </TouchableOpacity>
        </View>
      );
    }

    if (listings.length === 0) {
      return (
        <View style={styles.carouselMessage}>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Chưa có phòng phù hợp với lựa chọn này.
          </Typography>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        ItemSeparatorComponent={CarouselSeparator}
      />
    );
  };

  return (
    <ScreenContainer
      scrollable
      applyBottomInset={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <HomeHeader
            displayName={userDisplayName}
            avatarUrl={user?.avatarUrl}
            locationText={locationText}
            subtitle={isColdStart ? 'Bắt đầu tìm phòng đầu tiên nhé' : undefined}
            comparisonCount={comparisonCount}
            hasUnreadNotifications={unreadNotificationCount > 0}
            onProfilePress={handleGoToProfile}
            onComparisonPress={handleGoToComparison}
            onNotificationsPress={() => navigation.navigate('Notifications')}
            onSearchPress={handleGoToSearch}
            onFilterPress={handleGoToFilters}
          />

          {isColdStart ? (
            <View style={styles.firstSection}>
              <InfoBanner message="Xem thử vài phòng, gợi ý sẽ chính xác dần theo những gì bạn quan tâm." />

              <View style={styles.sectionGap}>
                <SectionHeader
                  title="Phổ biến gần ĐH Bách khoa"
                  actionLabel="Xem tất cả"
                  onActionPress={handleViewAll}
                />
              </View>
            </View>
          ) : (
            <View style={styles.firstSection}>
              <HomeChipRow
                chips={HOME_CHIPS}
                selectedId={activeChipId}
                onChipPress={handleChipPress}
              />

              <View style={styles.sectionGap}>
                <SectionHeader
                  title="Gợi ý dành cho bạn"
                  subtitle={`Dựa trên ${recentViewCount} phòng bạn đã xem gần đây`}
                  showSparkle
                  actionLabel="Xem tất cả"
                  onActionPress={handleViewAll}
                />
              </View>
            </View>
          )}

          <View style={styles.carousel}>{renderCarouselContent()}</View>

          <View style={styles.sectionGap}>
            {isColdStart ? (
              <AiBanner
                title="Tả nhu cầu bằng lời của bạn"
                description={'"Dưới 2 triệu, gần Bách khoa, có chỗ để xe"'}
                actionLabel="Thử"
                onPress={handleGoToAiChat}
              />
            ) : (
              <AiBanner
                title="Chưa biết bắt đầu từ đâu?"
                description="Mô tả nhu cầu, AI tìm phòng giúp bạn"
                actionLabel="Hỏi ngay"
                onPress={handleGoToAiChat}
              />
            )}
          </View>

          {isColdStart ? (
            <View style={styles.sectionGap}>
              <SectionHeader title="Chọn khu vực quan tâm" />

              <View style={styles.areaChips}>
                <AreaChips areas={COLD_START_AREAS} onAreaPress={handleAreaPress} />
              </View>
            </View>
          ) : (
            <View style={styles.sectionGap}>
              <SectionHeader
                title="Gần bạn"
                actionLabel="Mở bản đồ"
                onActionPress={handleGoToMap}
              />

              <View style={styles.map}>
                <NearbyMapPreview listings={listings} onPress={handleGoToMap} />
              </View>
            </View>
          )}

          {isLandlord ? (
            <View style={[styles.landlordCard, styles.sectionGap]}>
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

              <Typography
                variant="caption"
                color={THEME_COLORS.TEXT_SECONDARY}
                style={styles.cardDesc}
              >
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
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  firstSection: {
    paddingTop: SPACING_TOKENS.MD,
  },
  sectionGap: {
    marginTop: SPACING_TOKENS.LG,
  },
  carousel: {
    marginTop: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  carouselContent: {
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  carouselSeparator: {
    width: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  carouselMessage: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM,
  },
  areaChips: {
    marginTop: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  map: {
    marginTop: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  landlordCard: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    marginHorizontal: SPACING_TOKENS.MD,
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
