import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { BookingSlot } from '../types';

export const SlotGrid = ({
  slots,
  selected,
  onSelect,
}: {
  slots: BookingSlot[];
  selected?: string;
  onSelect: (slot: BookingSlot) => void;
}) => (
  <View style={styles.grid}>
    {slots.map((slot) => {
      const isSelected = selected === slot.startTime;

      return (
        <TouchableOpacity
          key={slot.startTime}
          style={[
            styles.slot,
            isSelected && styles.selectedSlot,
            !slot.available && styles.disabledSlot,
          ]}
          disabled={!slot.available}
          onPress={() => onSelect(slot)}
        >
          <Typography
            variant="body2"
            weight="SEMIBOLD"
            color={
              isSelected
                ? THEME_COLORS.WHITE
                : slot.available
                  ? THEME_COLORS.TEXT_PRIMARY
                  : THEME_COLORS.TEXT_PLACEHOLDER
            }
            style={!slot.available ? styles.disabledText : undefined}
          >
            {slot.time}
          </Typography>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  slot: {
    flexGrow: 1,
    flexBasis: 88,
    maxWidth: 160,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectedSlot: { backgroundColor: THEME_COLORS.PRIMARY, borderColor: THEME_COLORS.PRIMARY },
  disabledSlot: { backgroundColor: THEME_COLORS.SURFACE_MUTED },
  disabledText: { textDecorationLine: 'line-through' },
});
