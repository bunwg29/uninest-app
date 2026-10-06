import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, LayoutGrid, List } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

interface SearchToolbarProps {
  totalResults: number;
  isLoading?: boolean;
  isLocating?: boolean;
  sortLabel: string;
  compactSortLabel: string;
  isSortOpen: boolean;
  viewMode: 'list' | 'grid';
  onOpenSort: () => void;
  onChangeViewMode: (viewMode: 'list' | 'grid') => void;
}

export const SearchToolbar = ({
  totalResults,
  isLoading = false,
  isLocating = false,
  sortLabel,
  compactSortLabel,
  isSortOpen,
  viewMode,
  onOpenSort,
  onChangeViewMode,
}: SearchToolbarProps) => {
  const SortChevron = isSortOpen ? ChevronUp : ChevronDown;

  return (
    <View style={styles.container}>
      <View style={styles.countWrapper}>
        <Typography variant="body2" weight="BOLD" numberOfLines={1}>
          {isLoading ? 'Đang tìm phòng…' : `${totalResults} phòng`}
          {isLoading ? null : (
            <Typography variant="body2" colorKey="TEXT_MUTED">
              {' phù hợp'}
            </Typography>
          )}
        </Typography>
        {isLocating ? <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} /> : null}
      </View>

      <TouchableOpacity
        style={[styles.sortPill, isSortOpen && styles.sortPillOpen]}
        onPress={onOpenSort}
        accessibilityRole="button"
        accessibilityLabel={`Sắp xếp: ${sortLabel}`}
      >
        <Typography
          variant="label"
          weight={isSortOpen ? 'SEMIBOLD' : 'MEDIUM'}
          colorKey={isSortOpen ? 'PRIMARY_DARK' : 'TEXT_SECONDARY'}
          numberOfLines={1}
          style={styles.sortLabel}
        >
          {compactSortLabel}
        </Typography>
        <SortChevron
          size={14}
          color={isSortOpen ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_SECONDARY}
        />
      </TouchableOpacity>

      <View style={styles.viewToggle}>
        <ToggleButton
          label="Xem danh sách"
          isSelected={viewMode === 'list'}
          onPress={() => onChangeViewMode('list')}
        >
          <List
            size={17}
            color={viewMode === 'list' ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
          />
        </ToggleButton>
        <ToggleButton
          label="Xem dạng lưới"
          isSelected={viewMode === 'grid'}
          onPress={() => onChangeViewMode('grid')}
        >
          <LayoutGrid
            size={17}
            color={viewMode === 'grid' ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
          />
        </ToggleButton>
      </View>
    </View>
  );
};

const ToggleButton = ({
  label,
  isSelected,
  onPress,
  children,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity
    style={[styles.toggleButton, isSelected && styles.toggleButtonSelected]}
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={label}
  >
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  countWrapper: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortPill: {
    height: 34,
    maxWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  sortPillOpen: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  sortLabel: { flexShrink: 1, fontSize: 13, lineHeight: 20 },
  viewToggle: {
    width: 80,
    height: 38,
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  toggleButton: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  toggleButtonSelected: { backgroundColor: THEME_COLORS.SURFACE },
});
