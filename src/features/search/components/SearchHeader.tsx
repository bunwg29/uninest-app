import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { FilterChip, Typography } from '@ui';

interface SearchHeaderProps {
  keyword: string;
  activeFilterCount: number;
  priceLabel: string;
  areaLabel: string;
  hasRoomTypeFilter: boolean;
  hasAmenityFilter: boolean;
  isNearbyEnabled: boolean;
  onChangeKeyword: (keyword: string) => void;
  onSubmit: () => void;
  onOpenFilters: () => void;
  onEnableNearby: () => void;
}

export const SearchHeader = ({
  keyword,
  activeFilterCount,
  priceLabel,
  areaLabel,
  hasRoomTypeFilter,
  hasAmenityFilter,
  isNearbyEnabled,
  onChangeKeyword,
  onSubmit,
  onOpenFilters,
  onEnableNearby,
}: SearchHeaderProps) => {
  return (
    <View style={styles.container}>
      <Typography variant="h1" weight="BOLD" style={styles.title}>
        Tìm trọ
      </Typography>

      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Search size={19} color={THEME_COLORS.TEXT_MUTED} />
          <TextInput
            value={keyword}
            onChangeText={onChangeKeyword}
            onSubmitEditing={onSubmit}
            placeholder="Tìm theo khu vực, tên đường…"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            returnKeyType="search"
            autoCapitalize="none"
            accessibilityLabel="Từ khóa tìm phòng"
            style={styles.searchInput}
          />
          {keyword.length > 0 ? (
            <TouchableOpacity
              onPress={() => onChangeKeyword('')}
              accessibilityRole="button"
              accessibilityLabel="Xóa từ khóa tìm kiếm"
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={18} color={THEME_COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={onOpenFilters}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0 ? `Bộ lọc, đang áp dụng ${activeFilterCount} nhóm` : 'Bộ lọc'
          }
        >
          <SlidersHorizontal size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Typography variant="tiny" color={THEME_COLORS.WHITE}>
                {activeFilterCount}
              </Typography>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
      >
        <FilterChip label="Gần tôi" isSelected={isNearbyEnabled} onPress={onEnableNearby} />
        <FilterChip
          label={priceLabel}
          isSelected={priceLabel !== 'Giá'}
          onPress={onOpenFilters}
          icon={<ChevronDown size={14} color={THEME_COLORS.TEXT_MUTED} />}
        />
        <FilterChip
          label={areaLabel}
          isSelected={areaLabel !== 'Diện tích'}
          onPress={onOpenFilters}
          icon={<ChevronDown size={14} color={THEME_COLORS.TEXT_MUTED} />}
        />
        <FilterChip label="Loại phòng" isSelected={hasRoomTypeFilter} onPress={onOpenFilters} />
        <FilterChip label="Tiện ích" isSelected={hasAmenityFilter} onPress={onOpenFilters} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING_TOKENS.SM,
    paddingBottom: SPACING_TOKENS.SM,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  title: {
    paddingHorizontal: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.SM,
  },
  searchRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  searchInputContainer: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: SPACING_TOKENS.SM,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    borderWidth: 2,
    borderColor: THEME_COLORS.SURFACE,
  },
  chipsContent: {
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
  },
});
