import { useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react-native';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { removeDiacritics } from '@core';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { BottomSheet, Button, Input, Typography } from '@ui';

export interface PriceComparisonPickerOption {
  label: string;
  value: string;
}

interface PriceComparisonPickerSheetProps {
  isVisible: boolean;
  title: string;
  options: PriceComparisonPickerOption[];
  selectedValue?: string;
  emptyMessage: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelect: (option: PriceComparisonPickerOption) => void;
  onClose: () => void;
}

export const PriceComparisonPickerSheet = ({
  isVisible,
  title,
  options,
  selectedValue,
  emptyMessage,
  searchPlaceholder,
  isLoading = false,
  isError = false,
  onRetry,
  onSelect,
  onClose,
}: PriceComparisonPickerSheetProps) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!isVisible) setSearchKeyword('');
  }, [isVisible]);

  const filteredOptions = useMemo(() => {
    const normalizedKeyword = removeDiacritics(searchKeyword).trim().replace(/\s+/g, ' ');

    if (!normalizedKeyword) return options;

    return options.filter((option) =>
      removeDiacritics(option.label).replace(/\s+/g, ' ').includes(normalizedKeyword)
    );
  }, [options, searchKeyword]);

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      applyBottomInset
      keyboardAvoiding
      sheetStyle={styles.sheet}
    >
      <View style={styles.header}>
        <Typography variant="h3" weight="SEMIBOLD">
          {title}
        </Typography>
        <TouchableOpacity
          style={styles.close}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <X size={20} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {searchPlaceholder ? (
        <Input
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          placeholder={searchPlaceholder}
          leftIcon={<Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          clearable
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel={searchPlaceholder}
          containerStyle={styles.searchContainer}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Đang tải dữ liệu khu vực...
          </Typography>
        </View>
      ) : isError ? (
        <View style={styles.stateContainer}>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            Không thể tải danh sách khu vực. Vui lòng thử lại.
          </Typography>
          {onRetry ? (
            <Button variant="outline" size="sm" onPress={onRetry}>
              Thử lại
            </Button>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value}
          style={styles.optionsList}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => {
            const isSelected = item.value === selectedValue;

            return (
              <TouchableOpacity
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => onSelect(item)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Typography
                  variant="body2"
                  weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                  colorKey={isSelected ? 'PRIMARY' : 'TEXT_PRIMARY'}
                  style={styles.optionLabel}
                >
                  {item.label}
                </Typography>
                {isSelected ? <Check size={18} color={THEME_COLORS.PRIMARY} /> : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.empty}>
              {searchKeyword.trim() ? 'Không tìm thấy khu vực phù hợp' : emptyMessage}
            </Typography>
          }
        />
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: { maxHeight: '72%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
  },
  searchContainer: {
    marginBottom: SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  stateContainer: {
    minHeight: 180,
    gap: SPACING_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingBottom: SPACING_TOKENS.LG,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  list: { paddingHorizontal: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.MD },
  optionsList: { flexShrink: 1 },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.SM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  optionSelected: {
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  optionLabel: { flex: 1 },
  empty: { paddingVertical: SPACING_TOKENS.XL },
});
