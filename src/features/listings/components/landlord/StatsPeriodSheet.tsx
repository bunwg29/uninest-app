import { StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { BottomSheet, Typography } from '@ui';
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
  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backdropColor={OVERLAY_COLORS.MODAL_BACKDROP}
      backdropAccessibilityLabel="Đóng chọn khoảng thời gian"
      sheetStyle={styles.sheet}
      handleStyle={styles.handle}
    >
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
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + 2,
  },
  handle: {
    marginBottom: SPACING_TOKENS.SM,
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
