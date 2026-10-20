import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { THEME_COLORS } from '@theme';
import { BottomSheet, Button, Typography } from '@ui';
import { SEARCH_SORT_OPTIONS, type SearchSortBy } from '../types';
import { RadioMark } from './RadioMark';

interface SearchSortSheetProps {
  isVisible: boolean;
  value: SearchSortBy;
  hasLocation: boolean;
  onSelect: (sortBy: SearchSortBy) => void;
  onRequestLocation: () => Promise<boolean>;
  onClose: () => void;
}

export const SearchSortSheet = ({
  isVisible,
  value,
  hasLocation,
  onSelect,
  onRequestLocation,
  onClose,
}: SearchSortSheetProps) => {
  const [pendingValue, setPendingValue] = useState(value);

  useEffect(() => {
    if (isVisible) setPendingValue(value);
  }, [isVisible, value]);

  const handleChoose = async (sortBy: SearchSortBy) => {
    if (sortBy === 'nearest' && !hasLocation) {
      const isGranted = await onRequestLocation();

      if (isGranted) setPendingValue(sortBy);

      return;
    }

    setPendingValue(sortBy);
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backdropAccessibilityLabel="Đóng sắp xếp"
      handleStyle={styles.handle}
    >
      <Typography variant="h3" weight="SEMIBOLD" style={styles.title}>
        Sắp xếp theo
      </Typography>

      <View style={styles.divider} />

      {SEARCH_SORT_OPTIONS.map((option) => {
        const isSelected = option.value === pendingValue;

        return (
          <View key={option.value}>
            <TouchableOpacity
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => void handleChoose(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.optionText}>
                <Typography
                  variant="body2"
                  weight={isSelected ? 'SEMIBOLD' : 'MEDIUM'}
                  colorKey="TEXT_PRIMARY"
                >
                  {option.label}
                </Typography>
              </View>
              <RadioMark isSelected={isSelected} />
            </TouchableOpacity>
            <View style={styles.divider} />
          </View>
        );
      })}

      <Button
        title="Áp dụng"
        size="lg"
        onPress={() => onSelect(pendingValue)}
        style={styles.applyButton}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  handle: {
    marginTop: 10,
  },
  title: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, fontSize: 18, lineHeight: 26 },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  optionSelected: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  optionText: { flex: 1, gap: 2 },
  applyButton: { marginHorizontal: 16, marginTop: 16 },
});
