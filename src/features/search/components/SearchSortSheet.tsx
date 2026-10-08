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
  const insets = useSafeAreaInsets();
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
