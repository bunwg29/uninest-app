import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

interface SearchHeaderProps {
  querySummary: string;
  activeFilterCount: number;
  variant?: 'solid' | 'overlay';
  hasQueryPill?: boolean;
  hasFilterButton?: boolean;
  style?: StyleProp<ViewStyle>;
  onBack: () => void;
  onPressQuery?: () => void;
  onOpenFilters?: () => void;
}

export const SearchHeader = ({
  querySummary,
  activeFilterCount,
  variant = 'solid',
  hasQueryPill = true,
  hasFilterButton = true,
  style,
  onBack,
  onPressQuery,
  onOpenFilters,
}: SearchHeaderProps) => {
  const isOverlay = variant === 'overlay';
  const hasQuery = querySummary.length > 0;

  return (
    <View style={[styles.container, !isOverlay && styles.solidContainer, style]}>
      <TouchableOpacity
        style={[styles.backButton, isOverlay ? styles.overlayCircle : styles.outlinedButton]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
      >
        <ChevronLeft size={20} color={THEME_COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>

      {hasQueryPill ? (
        <TouchableOpacity
          style={[styles.queryPill, isOverlay ? styles.overlayPill : styles.solidPill]}
          onPress={onPressQuery}
          activeOpacity={0.8}
          accessibilityRole="search"
          accessibilityLabel={`Từ khóa tìm phòng: ${hasQuery ? querySummary : 'chưa nhập'}`}
        >
          <Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <Typography
            variant="body2"
            weight="MEDIUM"
            colorKey={hasQuery ? 'TEXT_PRIMARY' : 'TEXT_PLACEHOLDER'}
            numberOfLines={1}
            style={styles.queryText}
          >
            {hasQuery ? querySummary : 'Tìm theo khu vực, tên đường…'}
          </Typography>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {hasFilterButton ? (
        <TouchableOpacity
          style={[
            styles.filterButton,
            isOverlay ? styles.overlayCircle : styles.outlinedButton,
            activeFilterCount > 0 && !isOverlay && styles.filterButtonActive,
          ]}
          onPress={onOpenFilters}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0 ? `Bộ lọc, đang áp dụng ${activeFilterCount} nhóm` : 'Bộ lọc'
          }
        >
          <SlidersHorizontal size={20} color={THEME_COLORS.PRIMARY} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Typography
                variant="tiny"
                weight="BOLD"
                color={THEME_COLORS.WHITE}
                style={styles.badgeText}
              >
                {activeFilterCount}
              </Typography>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.spacerSmall} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  solidContainer: {
    paddingTop: SPACING_TOKENS.XS,
    paddingBottom: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filterButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  outlinedButton: {
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  filterButtonActive: { borderColor: THEME_COLORS.PRIMARY },
  overlayCircle: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  queryPill: {
    flex: 1,
    minWidth: 0,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  solidPill: { backgroundColor: THEME_COLORS.SURFACE_MUTED },
  overlayPill: {
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  queryText: { flex: 1 },
  spacer: { flex: 1 },
  spacerSmall: { width: 40 },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 19,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: THEME_COLORS.WHITE,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  badgeText: { fontSize: 10, lineHeight: 14 },
});
