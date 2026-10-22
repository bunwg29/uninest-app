import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import * as Location from 'expo-location';
import { Map as MapIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AMENITY_DISPLAY_LIST, ROOM_TYPE_OPTIONS } from '@features/listings/types/constants';
import type { MainTabParamList, RootStackParamList } from '@navigation';
import { useDebouncedValue, useToast } from '@hooks';
import { OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import {
  SearchErrorView,
  SearchEmptyView,
  SearchFilterSheet,
  SearchFocusView,
  SearchHeader,
  SearchListingGridCard,
  SearchListingRow,
  SearchMapPanel,
  SearchResultSkeleton,
  SearchResultsMap,
  SearchSortSheet,
  SearchToolbar,
  type RelaxSuggestion,
} from '../components';
import { useAuth } from '@features/auth';
import { useSavedSearchActions } from '@features/notifications';
import { buildSearchParams } from '../services/searchParams';
import { useFavoriteIds, useRecentSearches, useSearchListings, useToggleFavorite } from '../hooks';
import { useSearchStore } from '../store';
import {
  SEARCH_SCHOOLS,
  SEARCH_SORT_OPTIONS,
  type SearchFilters,
  type SearchListingItem,
  type SearchListingLocation,
  type SearchSchool,
} from '../types';
import { formatMillions, getQuerySummary } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTER_COUNT_DEBOUNCE_MS = 400;
const QUICK_PRICE_LIMIT = 2_500_000;
const PRICE_RELAX_STEP = 400_000;
const RADIUS_STEPS = [1, 2, 3, 5, 10, 20] as const;

const getFilterValidationMessage = (filters: SearchFilters) => {
  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    return 'Giá tối thiểu không được lớn hơn giá tối đa.';
  }

  if (
    filters.minArea !== undefined &&
    filters.maxArea !== undefined &&
    filters.minArea > filters.maxArea
  ) {
    return 'Diện tích tối thiểu không được lớn hơn diện tích tối đa.';
  }

  return undefined;
};

const isNetworkFailure = (error: unknown) => axios.isAxiosError(error) && !error.response;

export const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Search'>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Search'>>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const {
    appliedFilters,
    draftFilters,
    viewMode,
    selectedListingId,
    isFilterVisible,
    isSortVisible,
    setKeyword,
    openFilters,
    closeFilters,
    updateDraftFilters,
    resetDraftFilters,
    applyDraftFilters,
    clearAppliedFilters,
    setRadius,
    openSort,
    closeSort,
    setSortBy,
    setViewMode,
    setSelectedListingId,
    setLocation,
    applyPreset,
  } = useSearchStore();
  const { role } = useAuth();
  const { width } = useWindowDimensions();
  const favoriteIdsQuery = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const { create: saveSearch } = useSavedSearchActions();
  const recentSearches = useRecentSearches();
  const favoriteIds = useMemo(() => new Set(favoriteIdsQuery.data ?? []), [favoriteIdsQuery.data]);
  const gridColumns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [keywordInput, setKeywordInput] = useState(appliedFilters.keyword);
  const [filterValidationMessage, setFilterValidationMessage] = useState<string>();
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>();
  const [myLocation, setMyLocation] = useState<SearchListingLocation>();
  const [recenterToken, setRecenterToken] = useState(0);
  const [isLocationDenied, setIsLocationDenied] = useState(false);
  const debouncedDraftFilters = useDebouncedValue(draftFilters, FILTER_COUNT_DEBOUNCE_MS);

  const searchQuery = useSearchListings(appliedFilters);
  const draftCountQuery = useSearchListings(debouncedDraftFilters, { enabled: isFilterVisible });
  const listings = useMemo(() => {
    const seenIds = new Set<string>();

    return (searchQuery.data?.pages.flatMap((page) => page.items) ?? []).filter((listing) => {
      if (seenIds.has(listing.id)) return false;

      seenIds.add(listing.id);

      return true;
    });
  }, [searchQuery.data]);
  const totalResults = searchQuery.data?.pages[0]?.pagination.total ?? 0;
  const draftResultCount = draftCountQuery.data?.pages[0]?.pagination.total;
  const suggestion = searchQuery.data?.pages[0]?.suggestion;
  const hasLocation =
    appliedFilters.latitude !== undefined && appliedFilters.longitude !== undefined;
  const selectedSchool = SEARCH_SCHOOLS.find((school) => school.id === appliedFilters.schoolId);
  const distanceSuffix = selectedSchool ? 'tới trường' : 'từ vị trí của bạn';
  const selectedSortOption = SEARCH_SORT_OPTIONS.find(
    (option) => option.value === appliedFilters.sortBy
  );
  const sortLabel = selectedSortOption?.label ?? 'Phù hợp nhất';
  const compactSortLabel = selectedSortOption?.compactLabel ?? 'Phù hợp';
  const querySummary = getQuerySummary(appliedFilters);
  const isQuickPriceActive =
    appliedFilters.maxPrice === QUICK_PRICE_LIMIT && appliedFilters.minPrice === undefined;
  const activeFilterCount = [
    appliedFilters.minPrice !== undefined || appliedFilters.maxPrice !== undefined,
    appliedFilters.minArea !== undefined || appliedFilters.maxArea !== undefined,
    appliedFilters.roomTypes.length > 0,
    appliedFilters.amenities.length > 0,
    appliedFilters.universities.length > 0,
    appliedFilters.radius !== undefined && appliedFilters.radius !== 5,
    appliedFilters.schoolId !== undefined,
  ].filter(Boolean).length;
  const criteriaCount = activeFilterCount + (appliedFilters.keyword ? 1 : 0);
  const mapSelectedListing = listings.find((listing) => listing.id === selectedListingId);
  const mapListings = useMemo(
    () => listings.filter((listing) => listing.location !== undefined),
    [listings]
  );
  const schoolSuggestions = useMemo(() => {
    const normalized = keywordInput.trim().toLowerCase();

    if (!normalized) return [];

    return SEARCH_SCHOOLS.filter((school) =>
      `${school.name} ${school.shortName}`.toLowerCase().includes(normalized)
    );
  }, [keywordInput]);

  const shouldOpenFilters = route.params?.openFilters === true;

  useEffect(() => {
    if (!shouldOpenFilters) return;

    openFilters();
    tabNavigation.setParams({ openFilters: undefined });
  }, [openFilters, shouldOpenFilters, tabNavigation]);

  useEffect(() => {
    if (
      !searchQuery.isPending &&
      selectedListingId &&
      !listings.some((listing) => listing.id === selectedListingId)
    ) {
      setSelectedListingId(null);
    }
  }, [listings, searchQuery.isPending, selectedListingId, setSelectedListingId]);

  useEffect(() => {
    if (viewMode !== 'map' || myLocation) return;

    let isCancelled = false;

    const locateOnOpen = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (isCancelled) return;

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          setIsLocationDenied(true);

          return;
        }

        setIsLocationDenied(false);

        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

        if (isCancelled || !position) return;

        setMyLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setRecenterToken((token) => token + 1);
      } catch {
        setIsLocationDenied(false);
      }
    };

    void locateOnOpen();

    return () => {
      isCancelled = true;
    };
  }, [viewMode, myLocation]);

  const openSearchFocus = () => {
    setKeywordInput(appliedFilters.keyword);
    setIsSearchFocused(true);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();

      return;
    }

    openSearchFocus();
  };

  const handleSubmitSearch = (term = keywordInput) => {
    const normalized = term.trim();

    Keyboard.dismiss();
    setKeywordInput(normalized);
    setKeyword(normalized);
    recentSearches.addTerm(normalized);
    setIsSearchFocused(false);
  };

  const handleSelectSchoolSuggestion = (school: SearchSchool) => {
    Keyboard.dismiss();
    applyPreset({
      ...appliedFilters,
      keyword: '',
      schoolId: school.id,
      latitude: school.latitude,
      longitude: school.longitude,
    });
    setKeywordInput('');
    setIsSearchFocused(false);
  };

  const handleApplyFilters = () => {
    const validationMessage = getFilterValidationMessage(draftFilters);

    if (validationMessage) {
      setFilterValidationMessage(validationMessage);

      return;
    }

    setFilterValidationMessage(undefined);
    applyDraftFilters();
  };

  const handleSaveFilters = async () => {
    const validationMessage = getFilterValidationMessage(draftFilters);

    if (validationMessage) {
      setFilterValidationMessage(validationMessage);

      return;
    }

    if (role !== 'student') {
      toast.info('Chỉ sinh viên có thể lưu bộ lọc tìm phòng.');

      return;
    }

    try {
      const summary = getQuerySummary(draftFilters);
      const name = (summary || 'Tất cả phòng trọ').slice(0, 100);

      await saveSearch.mutateAsync({ name, criteria: buildSearchParams(draftFilters) });
      toast.success('Đã lưu bộ lọc. Bạn sẽ nhận thông báo khi có phòng phù hợp.');
      closeFilters();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu bộ lọc');
    }
  };

  const handleCloseFilters = () => {
    setFilterValidationMessage(undefined);
    closeFilters();
  };

  const fetchCurrentCoordinates = async (): Promise<SearchListingLocation | null> => {
    setIsLocating(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setIsLocationDenied(true);
        toast.warning('Hãy cho phép UniNest truy cập vị trí trong Cài đặt để dùng tính năng này.');

        return null;
      }

      setIsLocationDenied(false);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
    } catch {
      toast.error('Chưa thể lấy vị trí hiện tại. Vui lòng thử lại sau.');

      return null;
    } finally {
      setIsLocating(false);
    }
  };

  const handleEnableNearby = async () => {
    if (hasLocation) {
      setSortBy('nearest');

      return;
    }

    const coordinates = await fetchCurrentCoordinates();

    if (!coordinates) return;

    setMyLocation(coordinates);
    setLocation(coordinates.latitude, coordinates.longitude);
    setSortBy('nearest');
    toast.success('Đã ưu tiên các phòng gần vị trí của bạn.');
  };

  const handleLocateMe = async () => {
    const coordinates = await fetchCurrentCoordinates();

    if (!coordinates) return;

    setMyLocation(coordinates);
    setRecenterToken((token) => token + 1);
    toast.success('Đã cập nhật vị trí hiện tại của bạn.');
  };

  const handleUseCurrentLocationFilter = async () => {
    const coordinates = await fetchCurrentCoordinates();

    if (coordinates) setMyLocation(coordinates);

    return coordinates;
  };

  const handleOpenListing = (listing: SearchListingItem) => {
    navigation.navigate('ListingDetail', { id: listing.id });
  };

  const handleSearchMapArea = () => {
    if (!mapCenter) return;

    setLocation(mapCenter.latitude, mapCenter.longitude);
    toast.info('Đã cập nhật kết quả theo vùng bản đồ.');
  };

  const handleToggleQuickPrice = () => {
    applyPreset({
      ...appliedFilters,
      minPrice: undefined,
      maxPrice: isQuickPriceActive ? undefined : QUICK_PRICE_LIMIT,
    });
  };

  const handleToggleSaved = (listingId: string) => {
    if (role !== 'student') {
      toast.info('Chỉ Sinh viên mới có thể lưu phòng.');

      return;
    }

    toggleFavorite.mutate({ listingId, isSaved: favoriteIds.has(listingId) });
  };

  const handleRelaxSearch = () => {
    if (suggestion?.type === 'expand_radius' && suggestion.radiusKm) {
      setRadius(suggestion.radiusKm);

      return;
    }

    clearAppliedFilters();
  };

  const loadNextPage = () => {
    if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
      searchQuery.fetchNextPage();
    }
  };

  const relaxSuggestions = useMemo<RelaxSuggestion[]>(() => {
    const items: RelaxSuggestion[] = [];
    const firstAmenity = AMENITY_DISPLAY_LIST.find((amenity) =>
      appliedFilters.amenities.includes(amenity.id)
    );

    if (firstAmenity) {
      items.push({
        key: 'amenity',
        label: `Bỏ "${firstAmenity.name}"`,
        onPress: () =>
          applyPreset({
            ...appliedFilters,
            amenities: appliedFilters.amenities.filter((id) => id !== firstAmenity.id),
          }),
      });
    }

    if (appliedFilters.maxPrice !== undefined) {
      const nextPrice = appliedFilters.maxPrice + PRICE_RELAX_STEP;

      items.push({
        key: 'price',
        label: `Tăng lên ${formatMillions(nextPrice)} triệu`,
        onPress: () => applyPreset({ ...appliedFilters, maxPrice: nextPrice }),
      });
    }

    const nextRadius = RADIUS_STEPS.find((step) => step > (appliedFilters.radius ?? 5));

    if (hasLocation && nextRadius) {
      items.push({
        key: 'radius',
        label: `Mở bán kính ${nextRadius} km`,
        onPress: () => setRadius(nextRadius),
      });
    }

    const missingRoomType = ROOM_TYPE_OPTIONS.find(
      (option) => !appliedFilters.roomTypes.includes(option.value)
    );

    if (appliedFilters.roomTypes.length > 0 && missingRoomType) {
      items.push({
        key: 'room-type',
        label: `Thêm loại "${missingRoomType.label}"`,
        onPress: () =>
          applyPreset({
            ...appliedFilters,
            roomTypes: [...appliedFilters.roomTypes, missingRoomType.value],
          }),
      });
    }

    return items.slice(0, 4);
  }, [appliedFilters, applyPreset, hasLocation, setRadius]);

  const renderListing = ({ item }: { item: SearchListingItem }) =>
    viewMode === 'grid' ? (
      <SearchListingGridCard
        listing={item}
        isSaved={favoriteIds.has(item.id)}
        distanceSuffix={distanceSuffix}
        onPress={() => handleOpenListing(item)}
        onToggleSaved={() => handleToggleSaved(item.id)}
      />
    ) : (
      <SearchListingRow
        listing={item}
        isSaved={favoriteIds.has(item.id)}
        distanceSuffix={distanceSuffix}
        onPress={() => handleOpenListing(item)}
        onToggleSaved={() => handleToggleSaved(item.id)}
      />
    );

  const renderHeader = () => (
    <SearchHeader
      querySummary={querySummary}
      activeFilterCount={activeFilterCount}
      onBack={handleBack}
      onPressQuery={openSearchFocus}
      onOpenFilters={openFilters}
    />
  );

  const renderToolbar = () => (
    <SearchToolbar
      totalResults={totalResults}
      isLocating={isLocating}
      sortLabel={sortLabel}
      compactSortLabel={compactSortLabel}
      isSortOpen={isSortVisible}
      viewMode={viewMode === 'grid' ? 'grid' : 'list'}
      onOpenSort={openSort}
      onChangeViewMode={setViewMode}
    />
  );

  const renderResults = () => {
    if (searchQuery.isPending) {
      return (
        <>
          {renderHeader()}
          <SearchResultSkeleton />
        </>
      );
    }

    if (searchQuery.isError) {
      return (
        <>
          <SearchHeader
            querySummary=""
            activeFilterCount={0}
            hasQueryPill={false}
            hasFilterButton={false}
            onBack={handleBack}
          />
          <SearchErrorView
            isNetworkError={isNetworkFailure(searchQuery.error)}
            onRetry={() => searchQuery.refetch()}
            onOpenSaved={() => navigation.navigate('SavedRooms')}
          />
        </>
      );
    }

    if (listings.length === 0) {
      return (
        <>
          {renderHeader()}
          <SearchEmptyView
            criteriaCount={criteriaCount}
            description={
              suggestion?.message ?? 'Thử thay đổi khu vực, khoảng giá hoặc xóa bớt bộ lọc.'
            }
            suggestions={relaxSuggestions}
            actionTitle={
              suggestion?.type === 'expand_radius' ? 'Mở rộng bán kính' : 'Xoá bớt bộ lọc'
            }
            onAction={handleRelaxSearch}
            onOpenAssistant={() => navigation.navigate('Main', { screen: 'AiChat' })}
          />
        </>
      );
    }

    return (
      <>
        {renderHeader()}
        {renderToolbar()}

        <View style={styles.content}>
          <FlatList
            key={viewMode === 'grid' ? `grid-${gridColumns}` : 'list'}
            style={styles.resultsList}
            numColumns={viewMode === 'grid' ? gridColumns : 1}
            columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={renderListing}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ListSeparator}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl
                refreshing={searchQuery.isRefetching && !searchQuery.isFetchingNextPage}
                onRefresh={() => searchQuery.refetch()}
                colors={[THEME_COLORS.PRIMARY]}
                tintColor={THEME_COLORS.PRIMARY}
              />
            }
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.35}
            ListFooterComponent={
              searchQuery.isFetchingNextPage ? (
                <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loadMore} />
              ) : null
            }
          />

          <TouchableOpacity
            style={styles.mapPill}
            onPress={() => setViewMode('map')}
            accessibilityRole="button"
            accessibilityLabel="Xem bản đồ"
          >
            <MapIcon size={18} color={THEME_COLORS.WHITE} />
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
              Xem bản đồ
            </Typography>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <SearchResultsMap
        listings={listings}
        selectedListingId={selectedListingId}
        userLocation={
          hasLocation && !selectedSchool
            ? { latitude: appliedFilters.latitude!, longitude: appliedFilters.longitude! }
            : undefined
        }
        school={selectedSchool}
        myLocation={myLocation}
        recenterToken={recenterToken}
        onSelectListing={setSelectedListingId}
        onOpenListing={(listingId) => navigation.navigate('ListingDetail', { id: listingId })}
        onPressMap={() => setSelectedListingId(null)}
        onRegionChange={setMapCenter}
      />

      <SearchMapPanel
        listings={mapSelectedListing ? mapListings : listings}
        selectedListingId={selectedListingId}
        favoriteIds={favoriteIds}
        totalResults={totalResults}
        querySummary={querySummary}
        activeFilterCount={activeFilterCount}
        compactSortLabel={compactSortLabel}
        isNearbyEnabled={hasLocation}
        isQuickPriceActive={isQuickPriceActive}
        quickPriceLabel="Dưới 2,5tr"
        canSearchArea={mapCenter !== undefined}
        isLocating={isLocating}
        isLocationDenied={isLocationDenied}
        onLocateMe={() => void handleLocateMe()}
        onBack={() => setViewMode('list')}
        onPressQuery={openSearchFocus}
        onOpenFilters={openFilters}
        onOpenSort={openSort}
        onEnableNearby={handleEnableNearby}
        onToggleQuickPrice={handleToggleQuickPrice}
        onSearchArea={handleSearchMapArea}
        onSelectListing={setSelectedListingId}
        onOpenListing={handleOpenListing}
        onToggleSaved={handleToggleSaved}
        onShowList={() => setViewMode('list')}
        onEndReached={loadNextPage}
      />

      {searchQuery.isPending ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
        </View>
      ) : null}
    </View>
  );

  const renderBody = () => {
    if (isSearchFocused) {
      return (
        <SearchFocusView
          keyword={keywordInput}
          recentTerms={recentSearches.terms}
          schoolSuggestions={schoolSuggestions}
          onChangeKeyword={setKeywordInput}
          onSubmit={() => handleSubmitSearch()}
          onCancel={() => setIsSearchFocused(false)}
          onSelectRecent={(term) => handleSubmitSearch(term)}
          onRemoveRecent={recentSearches.removeTerm}
          onClearRecent={recentSearches.clearTerms}
          onSelectSchool={handleSelectSchoolSuggestion}
        />
      );
    }

    if (viewMode === 'map' && !searchQuery.isError) return renderMap();

    return renderResults();
  };

  const isMapVisible = viewMode === 'map' && !isSearchFocused && !searchQuery.isError;

  return (
    <View style={styles.container}>
      {isMapVisible ? null : (
        <View
          style={{
            height: insets.top + (Platform.OS === 'android' ? SPACING_TOKENS.SM : 0),
            backgroundColor: THEME_COLORS.SURFACE,
          }}
        />
      )}
      {renderBody()}

      <SearchFilterSheet
        isVisible={isFilterVisible}
        filters={draftFilters}
        validationMessage={filterValidationMessage}
        resultCount={draftResultCount}
        onChange={(filters) => {
          setFilterValidationMessage(undefined);
          updateDraftFilters(filters);
        }}
        onReset={() => {
          setFilterValidationMessage(undefined);
          resetDraftFilters();
        }}
        onApply={handleApplyFilters}
        onSave={() => void handleSaveFilters()}
        onClose={handleCloseFilters}
        onUseCurrentLocation={handleUseCurrentLocationFilter}
      />

      <SearchSortSheet
        isVisible={isSortVisible}
        value={appliedFilters.sortBy}
        hasLocation={hasLocation}
        onSelect={setSortBy}
        onRequestLocation={async () => {
          const coordinates = await fetchCurrentCoordinates();

          if (!coordinates) return false;

          setMyLocation(coordinates);
          setLocation(coordinates.latitude, coordinates.longitude);

          return true;
        }}
        onClose={closeSort}
      />
    </View>
  );
};

const ListSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  content: { flex: 1 },
  resultsList: { flex: 1 },
  listContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    paddingBottom: 96,
  },
  separator: { height: 12 },
  gridRow: { gap: 12 },
  loadMore: { marginVertical: SPACING_TOKENS.MD },
  mapPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mapContainer: { flex: 1, overflow: 'hidden' },
  mapLoading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
  },
});
