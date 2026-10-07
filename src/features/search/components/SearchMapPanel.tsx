import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { List, LocateFixed, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { SearchListingItem } from '../types';
import { formatListingDistance } from '../utils';
import { SearchHeader } from './SearchHeader';
import { SearchListingRow } from './SearchListingRow';

const CAROUSEL_GAP = 12;
const CAROUSEL_PEEK = 52;
const CAROUSEL_LOCATE_BOTTOM = 193;
const SHEET_COLLAPSED_RATIO = 0.42;
const SHEET_TOP_CLEARANCE = 64;
const SHEET_TAP_THRESHOLD = 6;
const SHEET_FLING_VELOCITY = 0.5;

interface SearchMapPanelProps {
  listings: SearchListingItem[];
  selectedListingId: string | null;
  favoriteIds: Set<string>;
  totalResults: number;
  querySummary: string;
  activeFilterCount: number;
  compactSortLabel: string;
  isNearbyEnabled: boolean;
  isQuickPriceActive: boolean;
  quickPriceLabel: string;
  canSearchArea: boolean;
  isLocating: boolean;
  isLocationDenied: boolean;
  onLocateMe: () => void;
  onBack: () => void;
  onPressQuery: () => void;
  onOpenFilters: () => void;
  onOpenSort: () => void;
  onEnableNearby: () => void;
  onToggleQuickPrice: () => void;
  onSearchArea: () => void;
  onSelectListing: (listingId: string | null) => void;
  onOpenListing: (listing: SearchListingItem) => void;
  onToggleSaved: (listingId: string) => void;
  onShowList: () => void;
  onEndReached: () => void;
}

const getCarouselSpecs = (listing: SearchListingItem) =>
  [
    listing.area ? `${listing.area} m²` : null,
    formatListingDistance(listing.distanceMeters),
    listing.rating !== undefined ? `★ ${listing.rating.toFixed(1).replace('.', ',')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

export const SearchMapPanel = ({
  listings,
  selectedListingId,
  favoriteIds,
  totalResults,
  querySummary,
  activeFilterCount,
  compactSortLabel,
  isNearbyEnabled,
  isQuickPriceActive,
  quickPriceLabel,
  canSearchArea,
  isLocating,
  isLocationDenied,
  onLocateMe,
  onBack,
  onPressQuery,
  onOpenFilters,
  onOpenSort,
  onEnableNearby,
  onToggleQuickPrice,
  onSearchArea,
  onSelectListing,
  onOpenListing,
  onToggleSaved,
  onShowList,
  onEndReached,
}: SearchMapPanelProps) => {
  const insets = useSafeAreaInsets();
  const carouselRef = useRef<FlatList<SearchListingItem>>(null);
  const [width, setWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const selectedIndex = listings.findIndex((listing) => listing.id === selectedListingId);
  const isCarouselMode = selectedIndex >= 0;
  const cardWidth = Math.max(width - 16 - CAROUSEL_PEEK, 240);

  useEffect(() => {
    if (selectedIndex >= 0 && width > 0) {
      carouselRef.current?.scrollToOffset({
        offset: selectedIndex * (cardWidth + CAROUSEL_GAP),
        animated: true,
      });
    }
  }, [cardWidth, selectedIndex, width]);

  const collapsedHeight = Math.round(containerHeight * SHEET_COLLAPSED_RATIO);
  const expandedHeight = Math.max(
    containerHeight - insets.top - SHEET_TOP_CLEARANCE,
    collapsedHeight
  );
  const sheetHeight = useRef(new Animated.Value(0)).current;
  const sheetState = useRef({
    height: 0,
    collapsed: collapsedHeight,
    expanded: expandedHeight,
    isExpanded: false,
  });

  sheetState.current.collapsed = collapsedHeight;
  sheetState.current.expanded = expandedHeight;

  const snapSheet = (shouldExpand: boolean) => {
    sheetState.current.isExpanded = shouldExpand;
    setIsSheetExpanded(shouldExpand);
    Animated.spring(sheetHeight, {
      toValue: shouldExpand ? sheetState.current.expanded : sheetState.current.collapsed,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };

  useEffect(() => {
    const id = sheetHeight.addListener(({ value }) => {
      sheetState.current.height = value;
    });

    return () => sheetHeight.removeListener(id);
  }, [sheetHeight]);

  useEffect(() => {
    if (containerHeight > 0) {
      sheetHeight.setValue(isSheetExpanded ? expandedHeight : collapsedHeight);
    }
    // Chỉ đặt lại chiều cao khi kích thước vùng chứa thay đổi, không ghi đè lúc người dùng đang kéo.
  }, [containerHeight]);

  const sheetPanResponder = useMemo(() => {
    let startHeight = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        sheetHeight.stopAnimation();
        startHeight = sheetState.current.height;
      },
      onPanResponderMove: (_event, gesture) => {
        const { collapsed, expanded } = sheetState.current;

        sheetHeight.setValue(Math.min(Math.max(startHeight - gesture.dy, collapsed), expanded));
      },
      onPanResponderRelease: (_event, gesture) => {
        const { collapsed, expanded, height, isExpanded } = sheetState.current;

        if (Math.abs(gesture.dy) < SHEET_TAP_THRESHOLD) {
          snapSheet(!isExpanded);

          return;
        }

        if (Math.abs(gesture.vy) > SHEET_FLING_VELOCITY) {
          snapSheet(gesture.vy < 0);

          return;
        }

        snapSheet(height > (collapsed + expanded) / 2);
      },
    });
  }, [sheetHeight]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
    setContainerHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={styles.container} pointerEvents="box-none" onLayout={handleLayout}>
      <View style={[styles.topArea, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <SearchHeader
          variant="overlay"
          querySummary={querySummary}
          activeFilterCount={activeFilterCount}
          hasFilterButton={isCarouselMode}
          onBack={onBack}
          onPressQuery={onPressQuery}
          onOpenFilters={onOpenFilters}
        />

        {isLocationDenied ? (
          <View style={styles.deniedRow}>
            <MapChip
              label="Bật quyền vị trí để xem vị trí của bạn"
              onPress={() => void Linking.openSettings()}
            />
          </View>
        ) : null}

        {isCarouselMode ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={styles.chipsScroll}
          >
            {canSearchArea ? (
              <MapChip label="Tìm trong khu vực này" isPrimary onPress={onSearchArea} />
            ) : null}
            <MapChip
              label={isLocating ? 'Đang định vị…' : 'Gần tôi'}
              isSelected={isNearbyEnabled}
              onPress={onEnableNearby}
            />
            <MapChip
              label={quickPriceLabel}
              isSelected={isQuickPriceActive}
              onPress={onToggleQuickPrice}
            />
          </ScrollView>
        ) : null}
      </View>

      {isCarouselMode ? (
        <>
          <Animated.View style={[styles.locateWrapper, { bottom: CAROUSEL_LOCATE_BOTTOM }]}>
            <LocateButton isLocating={isLocating} onPress={onLocateMe} />
          </Animated.View>

          <FlatList
            ref={carouselRef}
            horizontal
            data={listings}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + CAROUSEL_GAP}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            style={styles.carousel}
            getItemLayout={(_data, index) => ({
              length: cardWidth + CAROUSEL_GAP,
              offset: (cardWidth + CAROUSEL_GAP) * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (cardWidth + CAROUSEL_GAP)
              );
              const next = listings[index];

              if (next && next.id !== selectedListingId) onSelectListing(next.id);
            }}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.6}
            renderItem={({ item }) => (
              <SearchListingRow
                listing={item}
                isSaved={favoriteIds.has(item.id)}
                specsText={getCarouselSpecs(item)}
                style={[styles.carouselCard, { width: cardWidth }]}
                onPress={() => onOpenListing(item)}
                onToggleSaved={() => onToggleSaved(item.id)}
              />
            )}
          />

          <TouchableOpacity
            style={styles.listPill}
            onPress={onShowList}
            accessibilityRole="button"
            accessibilityLabel="Xem danh sách"
          >
            <List size={18} color={THEME_COLORS.WHITE} />
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
              Xem danh sách
            </Typography>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Animated.View
            style={[styles.locateWrapper, { bottom: Animated.add(sheetHeight, 12) }]}
            pointerEvents="box-none"
          >
            <LocateButton isLocating={isLocating} onPress={onLocateMe} />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight, paddingBottom: Math.max(insets.bottom, 8) },
            ]}
          >
            <View {...sheetPanResponder.panHandlers} accessibilityLabel="Kéo để mở rộng danh sách">
              <View style={styles.sheetHandleArea}>
                <View style={styles.sheetHandle} />
              </View>

              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleWrapper}>
                  <Typography variant="h3" weight="SEMIBOLD" style={styles.sheetTitle}>
                    {`${totalResults} phòng trong khu vực này`}
                  </Typography>
                  <Typography
                    variant="caption"
                    weight="MEDIUM"
                    colorKey="TEXT_PLACEHOLDER"
                    style={styles.sheetSubtitle}
                  >
                    {isSheetExpanded
                      ? 'Kéo xuống để xem bản đồ'
                      : 'Kéo lên để xem danh sách đầy đủ'}
                  </Typography>
                </View>

                <TouchableOpacity
                  style={styles.sortPill}
                  onPress={onOpenSort}
                  accessibilityRole="button"
                  accessibilityLabel={`Sắp xếp: ${compactSortLabel}`}
                >
                  <Typography variant="label" weight="MEDIUM" colorKey="TEXT_SECONDARY">
                    {compactSortLabel}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {canSearchArea ? (
              <TouchableOpacity
                style={styles.areaButton}
                onPress={onSearchArea}
                accessibilityRole="button"
                accessibilityLabel="Tìm trong khu vực này"
              >
                <RefreshCw size={16} color={THEME_COLORS.WHITE} />
                <Typography variant="label" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
                  Tìm trong khu vực này
                </Typography>
              </TouchableOpacity>
            ) : null}

            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.sheetList}
              ListEmptyComponent={
                <Typography
                  variant="body2"
                  weight="SEMIBOLD"
                  align="center"
                  style={styles.sheetEmpty}
                >
                  Không có phòng phù hợp trong khu vực này.
                </Typography>
              }
              onEndReached={onEndReached}
              onEndReachedThreshold={0.4}
              renderItem={({ item }) => (
                <SearchListingRow
                  listing={item}
                  isSaved={favoriteIds.has(item.id)}
                  elevated={false}
                  onPress={() => onOpenListing(item)}
                  onToggleSaved={() => onToggleSaved(item.id)}
                />
              )}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const LocateButton = ({ isLocating, onPress }: { isLocating: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={styles.locateButton}
    onPress={onPress}
    disabled={isLocating}
    accessibilityRole="button"
    accessibilityLabel="Cập nhật vị trí hiện tại của tôi"
  >
    {isLocating ? (
      <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
    ) : (
      <LocateFixed size={21} color={THEME_COLORS.PRIMARY} />
    )}
  </TouchableOpacity>
);

const MapChip = ({
  label,
  isSelected = false,
  isPrimary = false,
  onPress,
}: {
  label: string;
  isSelected?: boolean;
  isPrimary?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.chip, isSelected && styles.chipSelected, isPrimary && styles.chipPrimary]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
  >
    <Typography
      variant="label"
      weight={isSelected || isPrimary ? 'SEMIBOLD' : 'MEDIUM'}
      color={
        isPrimary
          ? THEME_COLORS.WHITE
          : isSelected
            ? THEME_COLORS.PRIMARY_DARK
            : THEME_COLORS.TEXT_SECONDARY
      }
    >
      {label}
    </Typography>
  </TouchableOpacity>
);

const shadow = {
  shadowColor: OVERLAY_COLORS.SHADOW,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill },
  topArea: { gap: 10 },
  chipsScroll: { flexGrow: 0 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME_COLORS.WHITE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    ...shadow,
  },
  chipSelected: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  deniedRow: { paddingHorizontal: 16, alignItems: 'flex-start' },
  locateWrapper: { position: 'absolute', right: 16 },
  locateButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    ...shadow,
  },
  carousel: { position: 'absolute', left: 0, right: 0, bottom: 74, flexGrow: 0 },
  carouselContent: { gap: CAROUSEL_GAP, paddingHorizontal: 16 },
  carouselCard: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  listPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 12,
  },
  sheetHandleArea: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sheetTitleWrapper: { flex: 1, minWidth: 0 },
  sheetTitle: { fontSize: 18, lineHeight: 26 },
  sheetSubtitle: { marginTop: 4, letterSpacing: 0.2 },
  sortPill: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  areaButton: {
    alignSelf: 'flex-start',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    ...shadow,
  },
  chipPrimary: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY },
  sheetEmpty: { paddingVertical: 24 },
  sheetList: { gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
});
