import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { BookingSlot } from '../types';

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;

const SESSIONS = [
  { key: 'morning', label: 'Buổi sáng' },
  { key: 'afternoon', label: 'Buổi chiều' },
  { key: 'evening', label: 'Buổi tối' },
] as const;

type SessionKey = (typeof SESSIONS)[number]['key'];

const getSession = (time: string): SessionKey => {
  const hour = Number(time.split(':')[0]);

  if (hour >= EVENING_START_HOUR) return 'evening';

  return hour >= AFTERNOON_START_HOUR ? 'afternoon' : 'morning';
};

export const SlotGrid = ({
  slots,
  selected,
  onSelect,
}: {
  slots: BookingSlot[];
  selected?: string;
  onSelect: (slot: BookingSlot) => void;
}) => (
  <View style={styles.container}>
    {SESSIONS.map((session) => {
      const sessionSlots = slots.filter((slot) => getSession(slot.time) === session.key);

      if (sessionSlots.length === 0) return null;

      return (
        <View key={session.key} style={styles.session}>
          <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER" style={styles.sessionLabel}>
            {session.label}
          </Typography>
          <View style={styles.grid}>
            {sessionSlots.map((slot) => {
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
                        ? THEME_COLORS.PRIMARY_DARK
                        : slot.available
                          ? THEME_COLORS.TEXT_SECONDARY
                          : OVERLAY_COLORS.FIELD_BORDER
                    }
                  >
                    {slot.time}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    })}
    <View style={styles.legend}>
      <View style={styles.legendSwatch} />
      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
        Đã có người đặt
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 16 },
  session: { gap: 8 },
  sessionLabel: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  slot: {
    width: '30.9%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectedSlot: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderColor: THEME_COLORS.PRIMARY,
  },
  disabledSlot: {
    backgroundColor: THEME_COLORS.BACKGROUND,
    borderColor: THEME_COLORS.DIVIDER,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  legendSwatch: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: THEME_COLORS.DIVIDER,
    borderRadius: BORDER_RADIUS_TOKENS.XS,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
});
