import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';
import { SEARCH_SORT_OPTIONS, type SearchSortBy } from '../types';
import { RadioMark } from './RadioMark';

interface SearchSortSheetProps {
  isVisible: boolean;
  value: SearchSortBy;
  hasLocation: boolean;
  onSelect: (sortBy: SearchSortBy) => void;
  onDistanceWithoutLocation: () => void;
  onClose: () => void;
}

export const SearchSortSheet = ({
  isVisible,
  value,
  hasLocation,
  onSelect,
  onDistanceWithoutLocation,
  onClose,
}: SearchSortSheetProps) => {
  const insets = useSafeAreaInsets();
  const [pendingValue, setPendingValue] = useState(value);

  useEffect(() => {
    if (isVisible) setPendingValue(value);
  }, [isVisible, value]);

  const handleChoose = (sortBy: SearchSortBy) => {
    if (sortBy === 'distance' && !hasLocation) {
      onDistanceWithoutLocation();

      return;
    }

    setPendingValue(sortBy);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Đóng sắp xếp"
        accessibilityRole="button"
      >
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <Typography variant="h3" weight="SEMIBOLD" style={styles.title}>
            Sắp xếp theo
          </Typography>

          <View style={styles.divider} />

          {SEARCH_SORT_OPTIONS.map((option) => {
            const isSelected = option.value === pendingValue;
            const isDisabled = option.value === 'distance' && !hasLocation;

            return (
              <View key={option.value}>
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleChoose(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                >
                  <View style={styles.optionText}>
                    <Typography
                      variant="body2"
                      weight={isSelected ? 'SEMIBOLD' : 'MEDIUM'}
                      colorKey={isDisabled ? 'TEXT_PLACEHOLDER' : 'TEXT_PRIMARY'}
                    >
                      {option.label}
                    </Typography>
                    {isDisabled ? (
                      <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                        Cần quyền truy cập vị trí
                      </Typography>
                    ) : null}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
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
