import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import {
  AlertTriangle,
  ArrowDownUp,
  List,
  Map as MapIcon,
  MapPin,
  SearchX,
} from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import type { LandlordListing } from '@features/listings';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  EmptyState,
  ListingCard,
  ListingCardSkeleton,
  ScreenContainer,
  Typography,
} from '@ui';
import { SearchFilterSheet, SearchHeader, SearchResultsMap, SearchSortSheet } from '../components';
import { useDebouncedValue, useSearchListings } from '../hooks';
import { useSearchStore } from '../store';
import { SEARCH_SORT_OPTIONS, type SearchFilters, type SearchListingItem } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SEARCH_DEBOUNCE_MS = 400;

const formatCompactPrice = (price?: number) => {
  if (price === undefined) return undefined;

  const value = price / 1000000;

  return `${Number.isInteger(value) ? value : value.toFixed(1)}tr`;
};

const getRangeLabel = (minimum?: number | string, maximum?: number | string, suffix = '') => {
  if (minimum === undefined && maximum === undefined) return undefined;

  if (minimum !== undefined && maximum !== undefined) {
    return `${minimum}${suffix} - ${maximum}${suffix}`;
  }

  return minimum !== undefined ? `Từ ${minimum}${suffix}` : `Đến ${maximum}${suffix}`;
};

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

const toDetailListing = (listing: SearchListingItem): LandlordListing => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  area: listing.area,
  address: listing.address,
  imageUrl: listing.thumbnail ?? undefined,
  imageUrls: listing.imageUrls,
  status: 'published',
  isFeatured: listing.isHighlighted,
  viewCount: listing.stats?.views ?? 0,
  contactCount: 0,
  saveCount: listing.stats?.saved ?? 0,
  holdingStatus: listing.isReserved,
  roomType: listing.roomType,
  maxOccupants: listing.capacity,
  description: listing.description,
  latitude: listing.location?.latitude,
  longitude: listing.location?.longitude,
  amenityIds: listing.amenityIds,
});

export const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const {
    appliedFilters,
    draftFilters,
    viewMode,
    selectedListingId,
    savedListingIds,
    isFilterVisible,
    isSortVisible,
    setKeyword,
    openFilters,
    closeFilters,
    updateDraftFilters,
    resetDraftFilters,
    applyDraftFilters,
    clearAppliedFilters,
    openSort,
    closeSort,
    setSortBy,
    setViewMode,
    setSelectedListingId,
    setLocation,
    toggleSavedListing,
  } = useSearchStore();
  const [keywordInput, setKeywordInput] = useState(appliedFilters.keyword);
  const [filterValidationMessage, setFilterValidationMessage] = useState<string>();
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>();
  const debouncedKeyword = useDebouncedValue(keywordInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setKeyword(debouncedKeyword.trim());
  }, [debouncedKeyword, setKeyword]);

  const searchQuery = useSearchListings(appliedFilters);
  const listings = useMemo(() => {
    const seenIds = new Set<string>();

    return (searchQuery.data?.pages.flatMap((page) => page.items) ?? []).filter((listing) => {
      if (seenIds.has(listing.id)) return false;

      seenIds.add(listing.id);

      return true;
    });
  }, [searchQuery.data]);
  const totalResults = searchQuery.data?.pages[0]?.pagination.total ?? 0;
  const selectedListing = listings.find((listing) => listing.id === selectedListingId) ?? null;
  const hasLocation =
    appliedFilters.latitude !== undefined && appliedFilters.longitude !== undefined;
  const selectedSortOption = SEARCH_SORT_OPTIONS.find(
    (option) => option.value === appliedFilters.sortBy
  );
  const sortLabel = selectedSortOption?.label ?? 'Mới nhất';
  const compactSortLabel = selectedSortOption?.compactLabel ?? 'Mới nhất';
  const priceLabel = useMemo(() => {
    const minimum = formatCompactPrice(appliedFilters.minPrice);
    const maximum = formatCompactPrice(appliedFilters.maxPrice);

    return getRangeLabel(minimum, maximum) ?? 'Giá';
  }, [appliedFilters.maxPrice, appliedFilters.minPrice]);
  const areaLabel =
    getRangeLabel(appliedFilters.minArea, appliedFilters.maxArea, 'm²') ?? 'Diện tích';
  const activeFilterCount = [
    appliedFilters.minPrice !== undefined || appliedFilters.maxPrice !== undefined,
    appliedFilters.minArea !== undefined || appliedFilters.maxArea !== undefined,
    appliedFilters.roomTypes.length > 0,
    appliedFilters.amenities.length > 0,
    appliedFilters.radius !== undefined && appliedFilters.radius !== 5,
  ].filter(Boolean).length;

  useEffect(() => {
    if (
      !searchQuery.isPending &&
      selectedListingId &&
      !listings.some((listing) => listing.id === selectedListingId)
    ) {
      setSelectedListingId(null);
    }
  }, [listings, searchQuery.isPending, selectedListingId, setSelectedListingId]);

  const handleSubmitSearch = () => {
    Keyboard.dismiss();
    setKeyword(keywordInput.trim());
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

  const handleCloseFilters = () => {
    setFilterValidationMessage(undefined);
    closeFilters();
  };

  const handleEnableNearby = async () => {
    if (hasLocation) {
      setSortBy('distance');

      return;
    }

    setIsLocating(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        toast.warning('Bạn vẫn có thể tìm theo từ khóa và bộ lọc khi không bật vị trí.');

        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
      setSortBy('distance');
      toast.success('Đã ưu tiên các phòng gần vị trí của bạn.');
    } catch {
      toast.error('Chưa thể lấy vị trí hiện tại. Vui lòng thử lại sau.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleOpenListing = (listing: SearchListingItem) => {
    navigation.navigate('StudentListingPreview', { listing: toDetailListing(listing) });
  };

  const handleSearchMapArea = () => {
    if (!mapCenter) return;

    setLocation(mapCenter.latitude, mapCenter.longitude);
    toast.info('Đã cập nhật kết quả theo vùng bản đồ.');
  };

  const renderListing = ({ item }: { item: SearchListingItem }) => (
    <ListingCard
      id={item.id}
      title={item.title}
      price={item.price}
      imageUrl={item.thumbnail ?? undefined}
      areaSquareMeters={item.area}
      capacity={item.capacity}
      distanceMeters={item.distanceMeters ?? undefined}
      address={item.address}
      rating={item.rating}
      reviewCount={item.reviewCount}
      status={item.isReserved ? 'holding' : item.isHighlighted ? 'featured' : 'available'}
      isSaved={savedListingIds.includes(item.id)}
      onPress={() => handleOpenListing(item)}
      onBookmarkPress={() => toggleSavedListing(item.id)}
      variant="horizontal"
      compact
      style={styles.listingCard}
    />
  );

  const renderListContent = () => {
    if (searchQuery.isPending) {
      return (
        <View style={styles.stateContent}>
          {Array.from({ length: 4 }).map((_, index) => (
            <ListingCardSkeleton key={index} />
          ))}
        </View>
      );
    }

    if (searchQuery.isError) {
      return (
        <EmptyState
          icon={<AlertTriangle size={34} color={THEME_COLORS.ERROR} />}
          title="Không thể tải danh sách phòng"
          description="Kết nối đang có vấn đề. Vui lòng thử lại."
          actionTitle="Thử lại"
          onAction={() => searchQuery.refetch()}
          style={styles.centeredState}
        />
      );
    }

    if (listings.length === 0) {
      return (
        <EmptyState
          icon={<SearchX size={34} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          title="Không tìm thấy phòng phù hợp"
          description="Thử thay đổi khu vực, khoảng giá hoặc xóa bớt bộ lọc."
          actionTitle="Xóa bớt bộ lọc"
          onAction={clearAppliedFilters}
          style={styles.centeredState}
        />
      );
    }

    return (
      <FlatList
        style={styles.resultsList}
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        scrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={searchQuery.isRefetching && !searchQuery.isFetchingNextPage}
            onRefresh={() => searchQuery.refetch()}
            colors={[THEME_COLORS.PRIMARY]}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
        onEndReached={() => {
          if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
            searchQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          searchQuery.isFetchingNextPage ? (
            <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loadMore} />
          ) : null
        }
      />
    );
  };

  const renderMapContent = () => {
    if (searchQuery.isPending) {
      return (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Đang tải bản đồ phòng trọ…
          </Typography>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <SearchResultsMap
          listings={listings}
          selectedListingId={selectedListingId}
          userLocation={
            hasLocation
              ? { latitude: appliedFilters.latitude!, longitude: appliedFilters.longitude! }
              : undefined
          }
          onSelectListing={setSelectedListingId}
          onRegionChange={setMapCenter}
        />

        {mapCenter ? (
          <Button
            title="Tìm trong khu vực này"
            size="sm"
            leftIcon={<MapPin size={15} color={THEME_COLORS.WHITE} />}
            onPress={handleSearchMapArea}
            style={styles.searchAreaButton}
          />
        ) : null}

        {!searchQuery.isError && listings.length === 0 ? (
          <View style={styles.mapEmptyOverlay}>
            <Typography variant="body2" weight="SEMIBOLD" align="center">
              Không có phòng phù hợp trong khu vực này.
            </Typography>
          </View>
        ) : null}

        {searchQuery.isError ? (
          <View style={styles.mapEmptyOverlay}>
            <Typography variant="body2" weight="SEMIBOLD" align="center">
              Không thể tải danh sách phòng.
            </Typography>
            <Button title="Thử lại" size="sm" onPress={() => searchQuery.refetch()} />
          </View>
        ) : null}

        {selectedListing ? (
          <ListingCard
            id={selectedListing.id}
            title={selectedListing.title}
            price={selectedListing.price}
            imageUrl={selectedListing.thumbnail ?? undefined}
            areaSquareMeters={selectedListing.area}
            distanceMeters={selectedListing.distanceMeters ?? undefined}
            address={selectedListing.address}
            status={selectedListing.isReserved ? 'holding' : 'available'}
            isSaved={savedListingIds.includes(selectedListing.id)}
            onPress={() => handleOpenListing(selectedListing)}
            onBookmarkPress={() => toggleSavedListing(selectedListing.id)}
            variant="horizontal"
            style={styles.previewCard}
          />
        ) : null}
      </View>
    );
  };

  return (
    <ScreenContainer
      applyBottomInset={false}
      keyboardAvoiding={false}
      maxContentWidth={null}
      style={styles.container}
    >
      <SearchHeader
        keyword={keywordInput}
        activeFilterCount={activeFilterCount}
        priceLabel={priceLabel}
        areaLabel={areaLabel}
        hasRoomTypeFilter={appliedFilters.roomTypes.length > 0}
        hasAmenityFilter={appliedFilters.amenities.length > 0}
        isNearbyEnabled={hasLocation}
        onChangeKeyword={setKeywordInput}
        onSubmit={handleSubmitSearch}
        onOpenFilters={openFilters}
        onEnableNearby={handleEnableNearby}
      />

      <View style={styles.resultsToolbar}>
        <View style={styles.resultCount}>
          <Typography variant="body1" weight="BOLD">
            {searchQuery.isPending ? 'Đang tìm phòng…' : `${totalResults} phòng phù hợp`}
          </Typography>
          {isLocating ? <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} /> : null}
        </View>

        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={openSort}
            accessibilityRole="button"
            accessibilityLabel={`Sắp xếp: ${sortLabel}`}
          >
            <ArrowDownUp size={16} color={THEME_COLORS.TEXT_MUTED} />
            <Typography
              variant="caption"
              weight="SEMIBOLD"
              numberOfLines={1}
              style={styles.sortLabel}
            >
              {compactSortLabel}
            </Typography>
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonSelected]}
              onPress={() => setViewMode('list')}
              accessibilityRole="radio"
              accessibilityState={{ selected: viewMode === 'list' }}
              accessibilityLabel="Xem danh sách"
            >
              <List
                size={17}
                color={viewMode === 'list' ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'map' && styles.viewButtonSelected]}
              onPress={() => setViewMode('map')}
              accessibilityRole="radio"
              accessibilityState={{ selected: viewMode === 'map' }}
              accessibilityLabel="Xem bản đồ"
            >
              <MapIcon
                size={17}
                color={viewMode === 'map' ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {viewMode === 'list' ? renderListContent() : renderMapContent()}
      </View>

      <SearchFilterSheet
        isVisible={isFilterVisible}
        filters={draftFilters}
        validationMessage={filterValidationMessage}
        onChange={(filters) => {
          setFilterValidationMessage(undefined);
          updateDraftFilters(filters);
        }}
        onReset={() => {
          setFilterValidationMessage(undefined);
          resetDraftFilters();
        }}
        onApply={handleApplyFilters}
        onClose={handleCloseFilters}
      />

      <SearchSortSheet
        isVisible={isSortVisible}
        value={appliedFilters.sortBy}
        hasLocation={hasLocation}
        onSelect={setSortBy}
        onDistanceWithoutLocation={() => {
          closeSort();
          toast.warning('Vui lòng bật quyền vị trí để sắp xếp theo khoảng cách.');
        }}
        onClose={closeSort}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  resultsToolbar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  resultCount: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbarActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  sortButton: {
    maxWidth: 128,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  sortLabel: { flexShrink: 1 },
  viewToggle: {
    height: 36,
    flexDirection: 'row',
    padding: 3,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  viewButton: { width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  viewButtonSelected: { backgroundColor: THEME_COLORS.SURFACE },
  content: { flex: 1 },
  resultsList: { flex: 1 },
  stateContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
  },
  centeredState: { flex: 1, minHeight: 360 },
  listContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    paddingBottom: 96,
  },
  listingCard: { marginBottom: SPACING_TOKENS.SM + 4 },
  loadMore: { marginVertical: SPACING_TOKENS.MD },
  mapContainer: { flex: 1, overflow: 'hidden' },
  mapLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING_TOKENS.SM },
  searchAreaButton: {
    position: 'absolute',
    top: SPACING_TOKENS.MD,
    alignSelf: 'center',
    shadowColor: THEME_COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  mapEmptyOverlay: {
    position: 'absolute',
    top: 76,
    left: SPACING_TOKENS.MD,
    right: SPACING_TOKENS.MD,
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  previewCard: {
    position: 'absolute',
    left: SPACING_TOKENS.MD,
    right: SPACING_TOKENS.MD,
    bottom: SPACING_TOKENS.MD,
    minHeight: 146,
  },
});
