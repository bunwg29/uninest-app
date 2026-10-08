import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { LANDLORD_STATS_PERIOD_OPTIONS, type LandlordStatsPeriod } from '../../types';

interface StatsPeriodSheetProps {
  isVisible: boolean;
  value: LandlordStatsPeriod;
  onSelect: (period: LandlordStatsPeriod) => void;
  onClose: () => void;
}

export const StatsPeriodSheet = ({
  isVisible,
  value,
  onSelect,
  onClose,
}: StatsPeriodSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Đóng chọn khoảng thời gian"
      >
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />

          <Typography variant="h3" weight="SEMIBOLD" style={styles.title}>
            Khoảng thời gian thống kê
          </Typography>

          {LANDLORD_STATS_PERIOD_OPTIONS.map((option) => {
            const isSelected = option.value === value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Typography
                  variant="body1"
                  weight={isSelected ? 'SEMIBOLD' : 'MEDIUM'}
                  colorKey={isSelected ? 'PRIMARY_DARK' : 'TEXT_PRIMARY'}
                >
                  {option.title}
                </Typography>

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
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: OVERLAY_COLORS.MODAL_BACKDROP },
  sheet: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  title: { marginBottom: SPACING_TOKENS.SM },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    marginTop: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  optionSelected: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
});
