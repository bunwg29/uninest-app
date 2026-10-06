import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useQueries } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, GradientView, Typography } from '@ui';
import { listingService } from '@features/listings/services';
import { LISTING_DETAIL_QUERY_KEY } from '@features/listings/hooks/useListingDetail';
import type { ListingAvailability } from '@features/listings/types';
import { useRecentlyViewedStore } from '@features/recommendations';
import {
  formatListingDistance,
  getPlaceholderGradient,
  useFavorites,
  type SearchListingItem,
} from '@features/search';
import { MAX_COMPARISON_ITEMS, useComparisonStore } from '../store';

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
const SHEET_RADIUS = 24;
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
  const comparisonItems = useComparisonStore((state) => state.items);
  const addComparison = useComparisonStore((state) => state.add);
  const recentIds = useRecentlyViewedStore((state) => state.listingIds);
  const favoritesQuery = useFavorites();
  const [activeTab, setActiveTab] = useState<SheetTab>('saved');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const remainingSlots = Math.max(0, MAX_COMPARISON_ITEMS - comparisonItems.length);
  const comparedIds = useMemo(
    () => new Set(comparisonItems.map((item) => item.id)),
    [comparisonItems]
  );

  const recentQueries = useQueries({
    queries: recentIds.slice(0, RECENT_LIMIT).map((id) => ({
      queryKey: [...LISTING_DETAIL_QUERY_KEY, id],
      queryFn: () => listingService.getListingDetail(id),
      enabled: isVisible && activeTab === 'recent',
    })),
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
      recentQueries.flatMap((query) =>
        query.data && !comparedIds.has(query.data.id)
          ? [
              {
                id: query.data.id,
                title: query.data.title,
                price: query.data.price,
                area: query.data.area,
                thumbnail:
                  (query.data.images.find((image) => image.isCover) ?? query.data.images[0])?.url ??
                  null,
                distanceMeters: query.data.distanceMeters ?? null,
                availability: query.data.availability,
                isHighlighted: false,
              } satisfies Candidate,
            ]
          : []
      ),
    [recentQueries, comparedIds]
  );
  const candidates = activeTab === 'saved' ? savedCandidates : recentCandidates;
  const isLoadingCandidates =
    activeTab === 'saved'
      ? favoritesQuery.isLoading
      : recentQueries.some((query) => query.isLoading);

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
      const details = await Promise.all(
        selectedIds.map((id) => listingService.getListingDetail(id))
      );

      details.forEach((detail) => addComparison(detail));
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể thêm phòng vào so sánh');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose} accessibilityLabel="Đóng danh sách chọn phòng">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />

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
              const label =
                tab === 'saved' ? `${TAB_LABELS[tab]} (${savedTotal})` : TAB_LABELS[tab];

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

          <View
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
          >
            <Button
              title={selectedIds.length > 0 ? `Thêm ${selectedIds.length} phòng` : 'Thêm phòng'}
              size="lg"
              fullWidth
              disabled={selectedIds.length === 0}
              isLoading={isAdding}
              onPress={() => void handleConfirm()}
            />
          </View>
        </View>
      </View>
    </Modal>
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
  const [hasImageError, setHasImageError] = useState(false);
  const isUnavailable = candidate.availability === 'rented' || candidate.availability === 'paused';
  const gradientColors = getPlaceholderGradient({
    id: candidate.id,
    isHighlighted: candidate.availability === 'holding',
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

      {candidate.thumbnail && !hasImageError ? (
        <Image
          source={{ uri: candidate.thumbnail }}
          style={styles.thumbnail}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <GradientView
          colors={
            isSelected
              ? [OVERLAY_COLORS.SUCCESS_BORDER, THEME_COLORS.SUCCESS_LIGHT]
              : gradientColors
          }
          style={styles.thumbnail}
        />
      )}

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
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP },
  sheetWrapper: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: MAX_SHEET_WIDTH,
    height: SHEET_HEIGHT,
    alignSelf: 'center',
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
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
