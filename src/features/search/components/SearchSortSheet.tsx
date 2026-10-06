import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { SEARCH_SORT_OPTIONS, type SearchSortBy } from '../types';

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

  const handleSelect = (sortBy: SearchSortBy) => {
    if (sortBy === 'distance' && !hasLocation) {
      onDistanceWithoutLocation();

      return;
    }

    onSelect(sortBy);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Typography variant="h3" weight="BOLD">
              Sắp xếp kết quả
            </Typography>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Đóng sắp xếp">
              <X size={21} color={THEME_COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          {SEARCH_SORT_OPTIONS.map((option) => {
            const isSelected = option.value === value;
            const isDisabled = option.value === 'distance' && !hasLocation;

            return (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              >
                <View style={styles.optionText}>
                  <Typography
                    variant="body1"
                    weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
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
                {isSelected ? <Check size={20} color={THEME_COLORS.PRIMARY} /> : null}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 27, 34, 0.48)',
  },
  sheet: {
    paddingHorizontal: SPACING_TOKENS.MD,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XL,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.XL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    marginVertical: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  optionText: { flex: 1, gap: 2 },
});
