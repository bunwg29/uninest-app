import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { BottomSheet, Button, MediaThumbnail, Typography } from '@ui';
import { listingService } from '@features/listings/services';
import type { ListingAvailability } from '@features/listings/types';
import { useRecentListingIds } from '@features/recommendations';
import {
  formatListingDistance,
  getPlaceholderGradient,
  useFavorites,
  type SearchListingItem,
} from '@features/search';
import { useAddComparison, useComparison } from '../hooks';
import { MAX_COMPARISON_ITEMS } from '../store';

interface AddComparisonSheetProps {
  isVisible: boolean;
  referenceLabel: string | null;
  onClose: () => void;
}

type SheetTab = 'saved' | 'recent';

interface Candidate {
  id: string;
  title: string;
  price: number;
  area: number;
  thumbnail: string | null;
  distanceMeters: number | null;
  availability: ListingAvailability;
  isHighlighted: boolean;
}

const RECENT_LIMIT = 10;
const SHEET_HEIGHT = '66%';
const MAX_SHEET_WIDTH = 560;
const CARD_HEIGHT = 96;
const THUMBNAIL_SIZE = 72;
const CHECKBOX_SIZE = 22;
const UNAVAILABLE_OPACITY = 0.55;

const TAB_LABELS: Record<SheetTab, string> = {
  saved: 'Đã lưu',
  recent: 'Đã xem gần đây',
};

const toCandidate = (item: SearchListingItem): Candidate => ({
  id: item.id,
  title: item.title,
  price: item.price,
  area: item.area,
  thumbnail: item.thumbnail,
  distanceMeters: item.distanceMeters ?? null,
  availability: item.availability,
  isHighlighted: item.isHighlighted,
});

export const AddComparisonSheet = ({
  isVisible,
  referenceLabel,
  onClose,
}: AddComparisonSheetProps) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { items: comparisonItems } = useComparison();
  const { add: addComparison } = useAddComparison();
  const recentIds = useRecentListingIds();
  const favoritesQuery = useFavorites();
  const [activeTab, setActiveTab] = useState<SheetTab>('saved');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const remainingSlots = Math.max(0, MAX_COMPARISON_ITEMS - comparisonItems.length);
  const comparedIds = useMemo(
    () => new Set(comparisonItems.map((item) => item.id)),
    [comparisonItems]
  );

  const recentBatchIds = useMemo(() => recentIds.slice(0, RECENT_LIMIT), [recentIds]);
  const recentQuery = useQuery({
    queryKey: ['listings-batch', recentBatchIds],
    queryFn: () => listingService.getListingsByIds(recentBatchIds),
    enabled: isVisible && activeTab === 'recent' && recentBatchIds.length > 0,
  });

  useEffect(() => {
    if (isVisible) {
      setSelectedIds([]);
      setActiveTab('saved');
    }
  }, [isVisible]);

  const savedCandidates = useMemo(
    () =>
      (favoritesQuery.data?.pages ?? [])
        .flatMap((page) => page.items)
        .filter((item) => !comparedIds.has(item.id))
        .map(toCandidate),
    [favoritesQuery.data, comparedIds]
  );
  const savedTotal = favoritesQuery.data?.pages[0]?.pagination.total ?? savedCandidates.length;
  const recentCandidates = useMemo(
    () =>
      (recentQuery.data ?? []).flatMap((detail) =>
        comparedIds.has(detail.id)
          ? []
          : [
              {
                id: detail.id,
                title: detail.title,
                price: detail.price,
                area: detail.area,
                thumbnail:
                  (detail.images.find((image) => image.isCover) ?? detail.images[0])?.url ?? null,
                distanceMeters: detail.distanceMeters ?? null,
                availability: detail.availability,
                isHighlighted: false,
              } satisfies Candidate,
            ]
      ),
    [recentQuery.data, comparedIds]
  );
  const candidates = activeTab === 'saved' ? savedCandidates : recentCandidates;
  const isLoadingCandidates =
    activeTab === 'saved' ? favoritesQuery.isLoading : recentQuery.isLoading;

  const handleToggle = (candidate: Candidate) => {
    if (candidate.availability === 'rented' || candidate.availability === 'paused') {
      return;
    }

    if (selectedIds.includes(candidate.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== candidate.id));

      return;
    }

    if (selectedIds.length >= remainingSlots) {
      toast.warning(`Chỉ so sánh được tối đa ${MAX_COMPARISON_ITEMS} phòng`);

      return;
    }

    setSelectedIds([...selectedIds, candidate.id]);
  };

  const handleConfirm = async () => {
    setIsAdding(true);

    try {
      const details = await listingService.getListingsByIds(selectedIds);
      const comparable = details.filter(
        (detail) =>
          detail.status === 'active' &&
          detail.availability !== 'rented' &&
          detail.availability !== 'paused'
      );
      let addedCount = 0;

      for (const detail of comparable) {
        if ((await addComparison(detail)) === 'added') {
          addedCount += 1;
        }
      }

      const skippedCount = selectedIds.length - addedCount;

      if (skippedCount > 0) {
        toast.warning(
          addedCount > 0
            ? `${skippedCount} phòng không còn khả dụng nên chưa được thêm`
            : 'Các phòng đã chọn không còn khả dụng để so sánh'
        );
      }

      if (addedCount > 0 || skippedCount === 0) {
        onClose();
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backdropAccessibilityLabel="Đóng danh sách chọn phòng"
      applyBottomInset={false}
      sheetStyle={styles.sheet}
      handleStyle={styles.handle}
    >
      <View style={styles.header}>
        <View>
          <Typography variant="h3" weight="SEMIBOLD">
            Thêm phòng vào so sánh
          </Typography>
          <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
            {`Còn ${remainingSlots} chỗ trống`}
          </Typography>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <X size={19} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(Object.keys(TAB_LABELS) as SheetTab[]).map((tab) => {
          const isActive = tab === activeTab;
          const label = tab === 'saved' ? `${TAB_LABELS[tab]} (${savedTotal})` : TAB_LABELS[tab];

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Typography
                variant="label"
                weight={isActive ? 'SEMIBOLD' : 'MEDIUM'}
                colorKey={isActive ? 'PRIMARY_DARK' : 'TEXT_SECONDARY'}
              >
                {label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {candidates.length === 0 ? (
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.empty}>
            {isLoadingCandidates ? 'Đang tải danh sách phòng...' : 'Chưa có phòng nào để thêm.'}
          </Typography>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              referenceLabel={referenceLabel}
              isSelected={selectedIds.includes(candidate.id)}
              onPress={() => handleToggle(candidate)}
            />
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}>
        <Button
          title={selectedIds.length > 0 ? `Thêm ${selectedIds.length} phòng` : 'Thêm phòng'}
          size="lg"
          fullWidth
          disabled={selectedIds.length === 0}
          isLoading={isAdding}
          onPress={() => void handleConfirm()}
        />
      </View>
    </BottomSheet>
  );
};

const CandidateCard = ({
  candidate,
  referenceLabel,
  isSelected,
  onPress,
}: {
  candidate: Candidate;
  referenceLabel: string | null;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const isUnavailable = candidate.availability === 'rented' || candidate.availability === 'paused';
  const gradientColors = getPlaceholderGradient({
    id: candidate.id,
    isHighlighted: candidate.isHighlighted,
  });
  const meta = [
    `${candidate.area} m²`,
    candidate.distanceMeters !== null && referenceLabel
      ? `${formatListingDistance(candidate.distanceMeters)} tới ${referenceLabel}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isUnavailable}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isUnavailable }}
      accessibilityLabel={candidate.title}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isUnavailable && styles.cardUnavailable,
      ]}
    >
      <View
        style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected,
          isUnavailable && styles.checkboxUnavailable,
        ]}
      >
        {isSelected ? <Check size={13} color={THEME_COLORS.WHITE} strokeWidth={3} /> : null}
      </View>

      <MediaThumbnail
        uri={candidate.thumbnail}
        placeholderColors={
          isSelected ? [OVERLAY_COLORS.SUCCESS_BORDER, THEME_COLORS.SUCCESS_LIGHT] : gradientColors
        }
        style={styles.thumbnail}
      />

      <View style={styles.cardBody}>
        <Typography variant="label" weight="SEMIBOLD" numberOfLines={2} style={styles.cardTitle}>
          {candidate.title}
        </Typography>

        {isUnavailable ? (
          <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
            Chủ trọ đã cho thuê — không so sánh được
          </Typography>
        ) : (
          <>
            <View style={styles.priceRow}>
              <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK">
                {`${candidate.price.toLocaleString('vi-VN')}đ`}
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                /tháng
              </Typography>
            </View>
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              {meta}
            </Typography>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    maxWidth: MAX_SHEET_WIDTH,
    height: SHEET_HEIGHT,
    alignSelf: 'center',
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handle: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  tabs: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  tab: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  tabActive: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  list: { gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS, padding: SPACING_TOKENS.MD },
  empty: { paddingVertical: SPACING_TOKENS.XL },
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: 14,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardSelected: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  cardUnavailable: { opacity: UNAVAILABLE_OPACITY },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.STEP_PENDING_TEXT,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.WHITE,
  },
  checkboxSelected: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY },
  checkboxUnavailable: { borderColor: OVERLAY_COLORS.FIELD_BORDER },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  cardBody: { flex: 1, justifyContent: 'center', gap: 2 },
  cardTitle: { lineHeight: 19 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING_TOKENS.XS },
  footer: { paddingHorizontal: SPACING_TOKENS.MD, paddingTop: SPACING_TOKENS.SM },
});
